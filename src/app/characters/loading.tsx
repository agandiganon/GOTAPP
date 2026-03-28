export default function CharactersLoading() {
  return (
    <div className="min-h-screen bg-canvas p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 w-64 mb-4 skeleton-pulse" />
        <div className="h-4 w-80 skeleton-pulse" />
      </div>

      {/* Filter Pills Skeleton */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 flex-shrink-0 skeleton-pulse rounded-full" />
        ))}
      </div>

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="panel-surface overflow-hidden group transition-all duration-300 hover:shadow-xl"
          >
            {/* Image skeleton */}
            <div className="aspect-[3/4] w-full skeleton-pulse mb-4" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 skeleton-pulse" />
              <div className="h-4 w-full skeleton-pulse" />
              <div className="h-4 w-5/6 skeleton-pulse" />

              {/* Status badges skeleton */}
              <div className="flex gap-2 mt-4">
                <div className="h-6 w-16 skeleton-pulse rounded-full" />
                <div className="h-6 w-20 skeleton-pulse rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
