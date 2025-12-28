import { Skeleton } from '../ui/skeleton';

export const CardSkeleton = () => {
  return (
    <div
      data-testid="card-skeleton"
      className="px-2.5 py-1.5 bg-white rounded-md mx-2 mb-2 border-2 border-transparent shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
};

