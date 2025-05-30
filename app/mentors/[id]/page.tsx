import { redirect } from "next/navigation";

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/companions/${id}`);
}
