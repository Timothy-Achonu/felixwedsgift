import { adminStyles } from "./admin-styles";

type SkeletonKind = "details" | "schedule" | "page-images" | "photos";

const layouts: Record<SkeletonKind, number> = {
  details: 6,
  schedule: 3,
  "page-images": 3,
  photos: 6,
};

export function AdminSkeleton({ kind }: { kind: SkeletonKind }) {
  const count = layouts[kind];

  if (kind === "photos") {
    return (
      <div
        aria-label="Loading photographs"
        aria-busy="true"
        className="mt-10 grid animate-pulse gap-5 motion-reduce:animate-none sm:grid-cols-2 xl:grid-cols-3"
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="border-wedding-navy/14 bg-wedding-cream/52 border p-3"
          >
            <div className="bg-wedding-navy/8 aspect-4/3" />
            <div className="bg-wedding-navy/8 mt-4 h-4 w-1/2" />
            <div className="bg-wedding-navy/8 mt-4 h-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-label={`Loading ${kind.replace("-", " ")}`}
      aria-busy="true"
      className="mt-12 grid animate-pulse gap-4 motion-reduce:animate-none"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={
            kind === "details"
              ? "border-wedding-navy/12 grid gap-4 border-t py-6 sm:grid-cols-2"
              : adminStyles.scheduleCard
          }
        >
          <div className="bg-wedding-navy/8 h-4 w-2/5" />
          {kind === "details" ? (
            <div className="bg-wedding-navy/8 h-11 w-full" />
          ) : (
            <>
              <div className="bg-wedding-navy/8 mt-4 h-4 w-3/4" />
              <div className="bg-wedding-navy/8 mt-5 h-36" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function AdminQueryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className={`${adminStyles.formError} ${adminStyles.pageError}`}>
      <p role="alert">{message}</p>
      <button
        type="button"
        className={`${adminStyles.secondaryButton} mt-3`}
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}
