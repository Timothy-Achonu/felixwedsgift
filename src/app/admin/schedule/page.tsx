import { requireAdmin } from "@/lib/auth/admin";

import { AdminShell } from "../admin-shell";
import { ScheduleContent } from "./schedule-content";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    reordered?: string;
    error?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  return (
    <AdminShell activeSection="schedule">
      <ScheduleContent
        saved={Boolean(params.saved)}
        deleted={Boolean(params.deleted)}
        reordered={Boolean(params.reordered)}
        error={params.error}
      />
    </AdminShell>
  );
}
