export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {/* Skeleton Card */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4 animate-pulse">
        
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>

        {/* Email Input Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>

        {/* Password Input Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>

        {/* Button Skeleton */}
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>

      {/* Text skeleton below */}
      <div className="h-4 bg-gray-300 rounded w-40 mt-6"></div>
    </div>
  );
}
