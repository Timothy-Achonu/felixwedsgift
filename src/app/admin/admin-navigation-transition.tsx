"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type AdminSectionId =
  | "overview"
  | "details"
  | "schedule"
  | "page-images"
  | "photos";

type AdminNavigationTransition = {
  isPending: boolean;
  pendingSection: AdminSectionId | null;
  navigate: (href: string, section: AdminSectionId) => void;
};

const AdminNavigationTransitionContext =
  createContext<AdminNavigationTransition | null>(null);

export function AdminNavigationTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingSection, setPendingSection] = useOptimistic<AdminSectionId | null>(
    null,
  );

  const navigate = useCallback(
    (href: string, section: AdminSectionId) => {
      startTransition(() => {
        setPendingSection(section);
        router.push(href);
      });
    },
    [router, setPendingSection, startTransition],
  );

  const value = useMemo(
    () => ({ isPending, pendingSection, navigate }),
    [isPending, navigate, pendingSection],
  );

  return (
    <AdminNavigationTransitionContext.Provider value={value}>
      {children}
    </AdminNavigationTransitionContext.Provider>
  );
}

export function useAdminNavigationTransition() {
  return useContext(AdminNavigationTransitionContext);
}
