import { adminStyles } from "./admin-styles";
import type { AdminSectionId } from "./admin-navigation-transition";

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

export function AdminRouteSkeleton({ kind }: { kind: AdminSectionId }) {
  const label = kind.replaceAll("-", " ");

  return (
    <section
      aria-label={`Loading ${label}`}
      aria-busy="true"
      className={adminStyles.content}
    >
      <div
        aria-hidden="true"
        className={`${adminStyles.contentIntro} animate-pulse motion-reduce:animate-none`}
      >
        <div className="bg-wedding-navy/8 h-3 w-32" />
        <div className="bg-wedding-navy/8 mt-4 h-16 w-4/5 max-w-3xl" />
        <div className="bg-wedding-navy/8 mt-4 h-4 w-full max-w-[32rem]" />
      </div>

      {kind === "overview" ? (
        <div
          aria-hidden="true"
          className={`${adminStyles.moduleGrid} animate-pulse motion-reduce:animate-none`}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className={`${adminStyles.moduleCard} grid content-start gap-4`}
            >
              <div className="bg-wedding-navy/8 h-3 w-28" />
              <div className="bg-wedding-navy/8 h-8 w-3/4" />
              <div className="bg-wedding-navy/8 h-4 w-full" />
              <div className="bg-wedding-navy/8 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <AdminSkeleton kind={kind} />
      )}
    </section>
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
