export default function TodoSkeleton() {
  return (
    <div className="animate-pulse p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-3 shimmer"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2 shimmer"></div>
    </div>
  );
}
