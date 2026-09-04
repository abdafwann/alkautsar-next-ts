export default function ProductGridSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Header / Sorting Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-pulse">
        <div className="w-48 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse flex flex-col h-full shadow-2xs">
            <div className="w-full aspect-square bg-gray-100 rounded-xl mb-4"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-1/2 h-3 bg-gray-100 rounded mb-4"></div>
            <div className="w-1/3 h-6 bg-gray-200 rounded mt-auto mb-4"></div>
            <div className="w-full h-10 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
