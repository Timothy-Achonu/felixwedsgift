import type { Metadata } from "next";

import { AdminQueryProvider } from "./admin-query-provider";

export const metadata: Metadata = {
  title: "Admin | Felix & Gift",
  description: "Manage the Felix & Gift wedding website.",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminQueryProvider>{children}</AdminQueryProvider>;
}
