import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/admin";

import { logout } from "./actions";
import { adminStyles } from "./admin-styles";

type ActiveSection = "overview" | "details" | "schedule";

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
      <header className={adminStyles.header}>
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
        <div className={adminStyles.headerActions}>
          <span className={adminStyles.user}>{admin.email}</span>
          <form action={logout}>
            <button className={adminStyles.logoutButton} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className={adminStyles.shell}>
        <aside className={adminStyles.sidebar} aria-label="Admin navigation">
          <p className={adminStyles.eyebrow}>Workspace</p>
          <nav className={adminStyles.sidebarNav}>
            <Link
              className={`${adminStyles.navLink} ${activeSection === "overview" ? adminStyles.navActive : ""}`}
              href="/admin"
              aria-current={activeSection === "overview" ? "page" : undefined}
            >
              Overview
            </Link>
            <span
              className={`${adminStyles.navLink} ${adminStyles.navDisabled}`}
            >
              Photos
            </span>
            <Link
              className={`${adminStyles.navLink} ${activeSection === "details" ? adminStyles.navActive : ""}`}
              href="/admin/details"
              aria-current={activeSection === "details" ? "page" : undefined}
            >
              Wedding details
            </Link>
            <Link
              className={`${adminStyles.navLink} ${activeSection === "schedule" ? adminStyles.navActive : ""}`}
              href="/admin/schedule"
              aria-current={activeSection === "schedule" ? "page" : undefined}
            >
              Schedule
            </Link>
          </nav>
          <Link className={adminStyles.returnLink} href="/">
            <ArrowLeft aria-hidden="true" size={15} />
            Public website
          </Link>
        </aside>
        {children}
      </div>
    </main>
  );
}
