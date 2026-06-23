export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-4 text-gray-200">&gt;</div>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Title skeleton */}
      <div className="mb-6 mt-4 h-9 w-48 animate-pulse rounded bg-gray-200" />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar skeleton */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="min-w-0 flex-1">
          {/* Controls skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="h-10 w-56 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 w-44 animate-pulse rounded-lg bg-gray-200" />
          </div>

          {/* Product grid skeleton — 6 cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="aspect-square animate-pulse bg-gray-200" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
