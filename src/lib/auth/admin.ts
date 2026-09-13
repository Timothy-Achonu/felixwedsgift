import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  email: string;
};

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("admin_members")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return null;
  }

  return { id: user.id, email: user.email };
}

export async function requireAdmin() {
  const admin = await getAdminIdentity();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
