export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-full max-w-2xl px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-12 text-center">
          <div className="h-12 w-48 mx-auto mb-4 skeleton-pulse" />
          <div className="h-4 w-72 mx-auto skeleton-pulse" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="panel-surface p-6">
              <div className="h-8 w-3/4 mb-4 skeleton-pulse" />
              <div className="space-y-3">
                <div className="h-4 w-full skeleton-pulse" />
                <div className="h-4 w-5/6 skeleton-pulse" />
                <div className="h-4 w-4/5 skeleton-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Decorative bottom accent */}
        <div className="mt-12 flex justify-center">
          <div className="h-1 w-16 rounded-full skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}
