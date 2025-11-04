export default function FormSkeleton() {
  return (
    <div className="skeleton p-4 rounded-lg space-y-3">
      <div className="h-4 rounded w-1/2"></div>
      <div className="h-10 rounded"></div>
      <div className="h-10 rounded"></div>
      <div className="h-8 rounded w-1/3"></div>
    </div>
  );
}
