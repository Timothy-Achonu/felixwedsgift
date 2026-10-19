"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { adminStyles } from "./admin-styles";
import {
  useAdminNavigationTransition,
  type AdminSectionId,
} from "./admin-navigation-transition";

const sections = [
  { id: "overview", label: "Overview", href: "/admin" },
  { id: "photos", label: "Photos", href: "/admin/photos" },
  { id: "details", label: "Wedding details", href: "/admin/details" },
  { id: "page-images", label: "Page images", href: "/admin/page-images" },
  { id: "schedule", label: "Schedule", href: "/admin/schedule" },
] as const;

type SectionId = AdminSectionId;

function sectionFromPath(pathname: string): SectionId {
  const section = sections.find(
    ({ href }) => href !== "/admin" && pathname.startsWith(href),
  );
  return section?.id ?? "overview";
}

export function AdminNavigation({
  activeSection,
}: {
  activeSection: SectionId;
}) {
  const pathname = usePathname();
  const routeSection = pathname ? sectionFromPath(pathname) : activeSection;
  const navigation = useAdminNavigationTransition();
  const selectedSection =
    navigation?.isPending && navigation.pendingSection
      ? navigation.pendingSection
      : routeSection;

  return (
    <NavigationLinks
      key={pathname}
      initialSection={routeSection}
      selectedSection={selectedSection}
      onNavigate={navigation?.navigate}
      pathname={pathname}
    />
  );
}

function NavigationLinks({
  initialSection,
  selectedSection,
  onNavigate,
  pathname,
}: {
  initialSection: SectionId;
  selectedSection: SectionId;
  onNavigate?: (href: string, section: SectionId) => void;
  pathname: string | null;
}) {
  const [selected, setSelected] = useState<SectionId>(initialSection);
  const activeSection = onNavigate ? selectedSection : selected;

  return (
    <nav className={adminStyles.sidebarNav} aria-label="Workspace sections">
      {sections.map(({ id, label, href }) => (
        <Link
          key={id}
          className={`${adminStyles.navLink} ${activeSection === id ? adminStyles.navActive : ""}`}
          href={href}
          aria-current={activeSection === id ? "page" : undefined}
          onClick={(event) => {
            if (
              event.button === 0 &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.shiftKey &&
              !event.altKey
            ) {
              if (onNavigate && pathname !== href) {
                event.preventDefault();
                onNavigate(href, id);
                return;
              }

              setSelected(id);
            }
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
