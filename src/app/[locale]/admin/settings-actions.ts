"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdminAccess } from "@/app/[locale]/admin/actions";

export async function saveBanners(banners: unknown[]) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "home_banners", value: banners });

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveFeatured(productIds: string[]) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "home_featured", value: productIds });

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveContacts(contacts: Record<string, string>) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "contacts", value: contacts });

  if (error) return { error: error.message };
  return { success: true };
}
