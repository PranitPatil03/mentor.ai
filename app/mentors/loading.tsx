export default function MentorsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      <p className="text-sm text-gray-500">Loading tutors…</p>
    </div>
  );
}
