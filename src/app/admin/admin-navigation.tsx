"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { adminStyles } from "./admin-styles";

const sections = [
  { id: "overview", label: "Overview", href: "/admin" },
  { id: "photos", label: "Photos", href: "/admin/photos" },
  { id: "details", label: "Wedding details", href: "/admin/details" },
  { id: "page-images", label: "Page images", href: "/admin/page-images" },
  { id: "schedule", label: "Schedule", href: "/admin/schedule" },
] as const;

type SectionId = (typeof sections)[number]["id"];

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

  return <NavigationLinks key={pathname} initialSection={routeSection} />;
}

function NavigationLinks({ initialSection }: { initialSection: SectionId }) {
  const [selected, setSelected] = useState<SectionId>(initialSection);

  return (
    <nav className={adminStyles.sidebarNav} aria-label="Workspace sections">
      {sections.map(({ id, label, href }) => (
        <Link
          key={id}
          className={`${adminStyles.navLink} ${selected === id ? adminStyles.navActive : ""}`}
          href={href}
          aria-current={selected === id ? "page" : undefined}
          onClick={(event) => {
            if (
              event.button === 0 &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.shiftKey &&
              !event.altKey
            ) {
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
