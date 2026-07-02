// ──────────────────────────────────────────────
// PawPets — Profile Page Loading Skeleton
// ──────────────────────────────────────────────

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-gray-200" />

      {/* User info card skeleton */}
      <div className="mb-8 rounded-lg border p-6">
        <div className="space-y-3">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
      <div className="rounded-lg border">
        <div className="space-y-3 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
