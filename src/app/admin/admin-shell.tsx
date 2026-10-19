import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { requireAdmin } from "@/lib/auth/admin";

import { logout } from "./actions";
import { adminStyles } from "./admin-styles";
import { AdminNavigation } from "./admin-navigation";
import { AdminSectionContent } from "./admin-section-content";

type ActiveSection =
  "overview" | "details" | "schedule" | "page-images" | "photos";

export async function AdminShell({
  activeSection,
  children,
}: {
  activeSection: ActiveSection;
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <main className={adminStyles.page}>
      <div className={adminStyles.shell}>
        <aside className={adminStyles.sidebar} aria-label="Admin navigation">
          <div className={adminStyles.sidebarHeader}>
            <Link
              className={adminStyles.brand}
              href="/admin"
              aria-label="Admin overview"
            >
              <span className={adminStyles.brandMonogram}>
                F <em className="text-wedding-blue">&amp;</em> G
              </span>
              <span className={adminStyles.brandLabel}>Studio</span>
            </Link>
          </div>

          <p className={adminStyles.eyebrow}>Workspace</p>
          <AdminNavigation activeSection={activeSection} />
          <div className={adminStyles.sidebarFooter}>
            <div className={adminStyles.headerActions}>
              <span className={adminStyles.user}>{admin.email}</span>
              <form action={logout}>
                <button className={adminStyles.logoutButton} type="submit">
                  Sign out
                </button>
              </form>
            </div>
            <Link className={adminStyles.returnLink} href="/">
              <ArrowLeft aria-hidden="true" size={15} />
              Public website
            </Link>
          </div>
        </aside>
        <AdminSectionContent activeSection={activeSection}>
          {children}
        </AdminSectionContent>
      </div>
      <Toaster />
    </main>
  );
}
