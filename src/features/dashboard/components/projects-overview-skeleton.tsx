import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsOverviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-10 py-10">
      <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="relative flex h-[130px] flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-4 w-24 rounded-md" />
            <div className="flex items-end justify-between">
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-6 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative flex h-[220px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-5 w-2/3 rounded-md" />
            <Skeleton className="mt-3 h-3 w-28 rounded-md" />
            <div className="mt-5 flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center -space-x-1.5">
                <Skeleton className="h-6 w-6 rounded-full border-2 border-white" />
                <Skeleton className="h-6 w-6 rounded-full border-2 border-white" />
                <Skeleton className="h-6 w-6 rounded-full border-2 border-white" />
              </div>
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
