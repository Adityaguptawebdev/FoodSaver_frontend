import Skeleton from "./Skeleton.jsx";

export default function DonationCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-charcoal-900/10 bg-cream-50 shadow-sm">
      <Skeleton className="h-40 w-full rounded-none" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
        </div>

        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />

        <div className="mt-1 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function DonationGridSkeleton({ count = 6 }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DonationCardSkeleton key={i} />
      ))}
    </div>
  );
}
