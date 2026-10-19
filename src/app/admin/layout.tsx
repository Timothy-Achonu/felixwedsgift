import type { Metadata } from "next";

import { AdminNavigationTransitionProvider } from "./admin-navigation-transition";
import { AdminQueryProvider } from "./admin-query-provider";

export const metadata: Metadata = {
  title: "Admin | Felix & Gift",
  description: "Manage the Felix & Gift wedding website.",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminQueryProvider>
      <AdminNavigationTransitionProvider>
        {children}
      </AdminNavigationTransitionProvider>
    </AdminQueryProvider>
  );
}
