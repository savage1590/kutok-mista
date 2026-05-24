"use server";

import { verifyAdminAccess } from "../../actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

import { PropertyOption } from "@/lib/types";

export async function createCategory(data: { slug: string; name_ua: string; name_en: string; properties_schema?: PropertyOption[] }) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin
    .from("categories")
    .insert([data]);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateCategory(id: string, data: { slug: string; name_ua: string; name_en: string; properties_schema?: PropertyOption[] }) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin
    .from("categories")
    .update(data)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteCategory(id: string) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) throw new Error("Unauthorized");

  // Supabase takes care of setting category_id to NULL in products table if foreign key is configured with ON DELETE SET NULL
  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
