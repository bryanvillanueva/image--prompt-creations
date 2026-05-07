export default function ImageSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="aspect-[4/5] w-full animate-pulse bg-gray-200" />
      <div className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
      </div>
    </div>
  );
}