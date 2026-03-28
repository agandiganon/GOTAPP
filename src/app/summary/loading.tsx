export default function SummaryLoading() {
  return (
    <div className="min-h-screen bg-canvas p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 w-56 mb-4 skeleton-pulse" />
        <div className="h-4 w-80 skeleton-pulse" />
      </div>

      {/* Episode Selection Skeleton */}
      <div className="mb-8 panel-surface p-6">
        <div className="h-6 w-40 mb-4 skeleton-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 skeleton-pulse rounded-lg" />
          ))}
        </div>
      </div>

      {/* Summary Content Skeleton */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="panel-surface p-6">
          <div className="h-7 w-2/3 mb-4 skeleton-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full skeleton-pulse" />
            <div className="h-4 w-full skeleton-pulse" />
            <div className="h-4 w-4/5 skeleton-pulse" />
            <div className="h-4 w-5/6 skeleton-pulse" />
          </div>
        </div>

        {/* Section 2 */}
        <div className="panel-surface p-6">
          <div className="h-7 w-1/2 mb-4 skeleton-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 skeleton-pulse" />
                <div className="h-4 w-full skeleton-pulse" />
                <div className="h-4 w-5/6 skeleton-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 */}
        <div className="panel-surface p-6">
          <div className="h-7 w-1/3 mb-4 skeleton-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 w-4 flex-shrink-0 skeleton-pulse rounded" />
                <div className="flex-1 h-4 skeleton-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-8 flex gap-3">
        <div className="flex-1 h-10 skeleton-pulse rounded-lg" />
        <div className="flex-1 h-10 skeleton-pulse rounded-lg" />
      </div>
    </div>
  );
}
