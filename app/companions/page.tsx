import { redirect } from "next/navigation";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
  const filters = await searchParams;
  const params = new URLSearchParams();
  params.set("tab", "public");
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.topic) params.set("topic", filters.topic);
  redirect(`/mentors?${params.toString()}`);
};

export default CompanionsLibrary;
