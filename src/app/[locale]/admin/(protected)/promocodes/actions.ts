"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function getPromoCodes() {
  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function savePromoCode(promoData: any) {
  if (promoData.id) {
    const { id, ...updateData } = promoData;
    const { error } = await supabaseAdmin
      .from("promo_codes")
      .update(updateData)
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin
      .from("promo_codes")
      .insert(promoData);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/[locale]/admin/(protected)/promocodes", "page");
  return { success: true };
}

export async function deletePromoCode(id: string) {
  const { error } = await supabaseAdmin
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/[locale]/admin/(protected)/promocodes", "page");
  return { success: true };
}

export async function togglePromoCodeStatus(id: string, is_active: boolean) {
  const { error } = await supabaseAdmin
    .from("promo_codes")
    .update({ is_active })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/(protected)/promocodes", "page");
  return { success: true };
}
