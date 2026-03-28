export default function MapLoading() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(210,168,90,0.15)]">
        <div className="h-8 w-48 mb-2 skeleton-pulse" />
        <div className="h-4 w-96 skeleton-pulse" />
      </div>

      {/* Main content area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Left sidebar - Location list */}
        <div className="lg:col-span-1 panel-surface p-4 overflow-y-auto">
          <div className="h-6 w-3/4 mb-4 skeleton-pulse" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="p-3 bg-[rgba(28,33,50,0.4)] rounded-lg skeleton-pulse h-16"
              />
            ))}
          </div>
        </div>

        {/* Center - Map area */}
        <div className="lg:col-span-2 panel-surface overflow-hidden relative">
          <div className="w-full h-full skeleton-pulse" />
          {/* Zoom controls skeleton */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="w-10 h-10 skeleton-pulse rounded-lg" />
            <div className="w-10 h-10 skeleton-pulse rounded-lg" />
          </div>
        </div>

        {/* Right sidebar - Details panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Selected location info */}
          <div className="panel-surface p-6">
            <div className="h-7 w-3/4 mb-4 skeleton-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-full skeleton-pulse" />
              <div className="h-4 w-5/6 skeleton-pulse" />
              <div className="h-4 w-4/5 skeleton-pulse" />
            </div>
          </div>

          {/* Additional info */}
          <div className="panel-surface p-6">
            <div className="h-6 w-1/2 mb-4 skeleton-pulse" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-full skeleton-pulse" />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <div className="flex-1 h-10 skeleton-pulse rounded-lg" />
            <div className="flex-1 h-10 skeleton-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
