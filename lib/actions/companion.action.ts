"use server";
import {
  createSupabaseServerClient,
  getCurrentSupabaseUser,
  isUserPro,
} from "../supabase";
import { DEFAULT_COMPANIONS, DEFAULT_COMPANION_IDS } from "@/constants";
import { revalidatePath } from "next/cache";

const isMissingTableError = (error: { message?: string } | null | undefined) => {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    message.includes("could not find the table") ||
    (message.includes("relation") && message.includes("does not exist"))
  );
};

const throwMissingTableSetupError = (table: string) => {
  throw new Error(
    `Supabase table \"${table}\" is missing. Run the SQL in supabase/schema.sql inside Supabase SQL Editor.`
  );
};

const getRequiredUserId = async () => {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user.id;
};

/**
 * Fallback helper: given a list of { companion_id } rows, resolve each to
 * either a DB companion or a default companion.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolveCompanions = async (supabase: any, rows: { companion_id: string }[]) => {
  const dbIds = rows
    .map((r) => r.companion_id)
    .filter((id) => !DEFAULT_COMPANION_IDS.has(id));

  let dbMap: Record<string, unknown> = {};
  if (dbIds.length > 0) {
    const { data: dbCompanions } = await supabase
      .from("companions")
      .select()
      .in("id", dbIds);
    if (dbCompanions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dbMap = Object.fromEntries(dbCompanions.map((c: any) => [c.id, c]));
    }
  }

  return rows
    .map((r) => {
      if (DEFAULT_COMPANION_IDS.has(r.companion_id)) {
        return DEFAULT_COMPANIONS.find((c) => c.id === r.companion_id) ?? null;
      }
      return dbMap[r.companion_id] ?? null;
    })
    .filter(Boolean);
};

export const createCompanion = async (formData: CreateCompanion) => {
  const author = await getRequiredUserId();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select();

  if (error) {
    if (isMissingTableError(error)) throwMissingTableSetupError("companions");
    throw new Error(error.message || "Failed to create a companion");
  }

  if (!data)
    throw new Error(error?.message || "Failed to create a companion");

  return data[0];
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const user = await getCurrentSupabaseUser();
  const userId = user?.id;
  const supabase = await createSupabaseServerClient();

  // ── Filter defaults in-memory ──
  let filteredDefaults = DEFAULT_COMPANIONS.map((c) => ({
    ...c,
    bookmarked: false,
  }));

  if (subject && topic) {
    const s = subject.toLowerCase();
    const t = topic.toLowerCase();
    filteredDefaults = filteredDefaults.filter(
      (c) =>
        c.subject.toLowerCase().includes(s) &&
        (c.topic.toLowerCase().includes(t) ||
          c.name.toLowerCase().includes(t))
    );
  } else if (subject) {
    const s = subject.toLowerCase();
    filteredDefaults = filteredDefaults.filter((c) =>
      c.subject.toLowerCase().includes(s)
    );
  } else if (topic) {
    const t = topic.toLowerCase();
    filteredDefaults = filteredDefaults.filter(
      (c) =>
        c.topic.toLowerCase().includes(t) ||
        c.name.toLowerCase().includes(t)
    );
  }

  // ── Query user-created companions from DB ──
  let query = supabase.from("companions").select();

  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) {
    if (isMissingTableError(error)) return filteredDefaults;
    throw new Error(error.message);
  }

  // ── Merge: defaults first, then DB companions ──
  if (!userId) {
    return [
      ...filteredDefaults,
      ...companions.map((companion) => ({ ...companion, bookmarked: false })),
    ];
  }

  // Get bookmarks for this user
  const { data: bookmarks, error: bookmarkError } = await supabase
    .from("bookmarks")
    .select("companion_id")
    .eq("user_id", userId);

  if (bookmarkError) {
    if (isMissingTableError(bookmarkError)) {
      return [
        ...filteredDefaults,
        ...companions.map((companion) => ({ ...companion, bookmarked: false })),
      ];
    }
    throw new Error(bookmarkError.message);
  }

  const bookmarkedIds = new Set(bookmarks.map((b) => b.companion_id));

  return [
    ...filteredDefaults,
    ...companions.map((companion) => ({
      ...companion,
      bookmarked: bookmarkedIds.has(companion.id),
    })),
  ];
};

export const getCompanion = async (id: string) => {
  // Check defaults first
  const defaultCompanion = DEFAULT_COMPANIONS.find((c) => c.id === id);
  if (defaultCompanion) return defaultCompanion;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error) {
    if (isMissingTableError(error)) return null;
    throw new Error(error.message);
  }

  return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
  const userId = await getRequiredUserId();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });

  if (error) {
    if (isMissingTableError(error)) return [];
    // FK violation for default companions — silently skip
    if (DEFAULT_COMPANION_IDS.has(companionId)) return [];
    throw new Error(error.message);
  }

  return data;
};

/** Check if user can start a new session (Pro = unlimited, Free = 10/month). */
export const canStartSession = async (): Promise<{
  allowed: boolean;
  remaining: number | null;
}> => {
  const userId = await getRequiredUserId();

  const pro = await isUserPro(userId);
  if (pro) return { allowed: true, remaining: null };

  const supabase = await createSupabaseServerClient();
  const monthLimit = 10;

  // Count sessions created this calendar month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabase
    .from("session_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth);

  if (error) {
    if (isMissingTableError(error)) return { allowed: true, remaining: monthLimit };
    throw new Error(error.message);
  }

  const used = count ?? 0;
  return { allowed: used < monthLimit, remaining: monthLimit - used };
};

/** Quick helper for client components — returns { isPro: boolean }. */
export const checkProStatus = async (): Promise<boolean> => {
  const userId = await getRequiredUserId();
  return isUserPro(userId);
};

export const getRecentSessions = async (limit = 10) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("session_history")
    .select(`companion_id, companions:companion_id (*)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error)) return [];

    // Fallback: plain select without join
    const { data: plain, error: plainError } = await supabase
      .from("session_history")
      .select("companion_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (plainError) return [];

    return await resolveCompanions(supabase, plain);
  }

  return data
    .map(({ companion_id, companions }) => {
      if (companions) return companions;
      return DEFAULT_COMPANIONS.find((c) => c.id === companion_id) ?? null;
    })
    .filter(Boolean);
};

export const getUserSessions = async (userId: string, limit = 10) => {
  const supabase = await createSupabaseServerClient();

  // Try the joined query first
  const { data, error } = await supabase
    .from("session_history")
    .select(`companion_id, companions:companion_id (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error)) return [];

    // If the join fails (e.g. FK referencing non-existent default rows),
    // fall back to a plain select and resolve companions manually.
    const { data: plain, error: plainError } = await supabase
      .from("session_history")
      .select("companion_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (plainError) {
      if (isMissingTableError(plainError)) return [];
      return [];
    }

    return await resolveCompanions(supabase, plain);
  }

  return data
    .map(({ companion_id, companions }) => {
      if (companions) return companions;
      return DEFAULT_COMPANIONS.find((c) => c.id === companion_id) ?? null;
    })
    .filter(Boolean);
};

export const getUserCompanions = async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw new Error(error.message);
  }

  return data;
};

export const newCompanionPermissions = async () => {
  const userId = await getRequiredUserId();

  // Pro users can create unlimited companions
  const pro = await isUserPro(userId);
  if (pro) return true;

  const supabase = await createSupabaseServerClient();
  const limit = Number(process.env.MAX_FREE_COMPANIONS ?? 3);

  const { data, error } = await supabase
    .from("companions")
    .select("id", { count: "exact" })
    .eq("author", userId);

  if (error) {
    if (isMissingTableError(error)) return true;
    throw new Error(error.message);
  }

  return (data?.length ?? 0) < limit;
};

export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
    .eq("user_id", userId);
  if (error) {
    if (isMissingTableError(error)) return [];
    throw new Error(error.message);
  }
  // We don't need the bookmarks data, so we return only the companions
  return data.map(({ companions }) => companions);
};

export const addBookmark = async (companionId: string, path: string) => {
  const user = await getCurrentSupabaseUser();
  const userId = user?.id;
  if (!userId) return;
  // Can't bookmark default companions (no DB row)
  if (DEFAULT_COMPANION_IDS.has(companionId)) return;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const user = await getCurrentSupabaseUser();
  const userId = user?.id;
  if (!userId) return;
  if (DEFAULT_COMPANION_IDS.has(companionId)) return;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    if (isMissingTableError(error)) return [];
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};
