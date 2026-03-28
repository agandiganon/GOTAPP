export default function PoliticsLoading() {
  return (
    <div className="min-h-screen bg-canvas p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 w-72 mb-4 skeleton-pulse" />
        <div className="h-4 w-96 skeleton-pulse" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="panel-surface p-6">
              {/* Title skeleton */}
              <div className="h-7 w-3/4 mb-4 skeleton-pulse" />

              {/* Content skeleton */}
              <div className="space-y-3">
                <div className="h-4 w-full skeleton-pulse" />
                <div className="h-4 w-full skeleton-pulse" />
                <div className="h-4 w-5/6 skeleton-pulse" />
              </div>

              {/* Footer elements skeleton */}
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-20 skeleton-pulse rounded-full" />
                <div className="h-6 w-24 skeleton-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-4">
          <div className="panel-surface p-6">
            <div className="h-6 w-1/2 mb-4 skeleton-pulse" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-full skeleton-pulse" />
              ))}
            </div>
          </div>

          <div className="panel-surface p-6">
            <div className="h-6 w-1/2 mb-4 skeleton-pulse" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-full skeleton-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
