"use client";

import type { ReactNode } from "react";

import { AdminRouteSkeleton } from "./admin-skeleton";
import {
  useAdminNavigationTransition,
  type AdminSectionId,
} from "./admin-navigation-transition";

export function AdminSectionContent({
  activeSection,
  children,
}: {
  activeSection: AdminSectionId;
  children: ReactNode;
}) {
  const navigation = useAdminNavigationTransition();

  if (
    navigation?.isPending &&
    navigation.pendingSection &&
    navigation.pendingSection !== activeSection
  ) {
    return <AdminRouteSkeleton kind={navigation.pendingSection} />;
  }

  return children;
}
