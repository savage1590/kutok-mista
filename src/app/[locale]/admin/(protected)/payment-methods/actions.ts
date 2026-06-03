"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { verifyAdminAccess } from "../../actions";

export async function savePaymentMethods(formData: FormData) {
  try {
    const isAuthorized = await verifyAdminAccess();
    if (!isAuthorized) throw new Error("Unauthorized");

    const methodsJson = formData.get("methods") as string;
    if (!methodsJson) throw new Error("No data provided");

    const methods = JSON.parse(methodsJson);

    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ key: "payment_methods", value: methods });

    if (error) throw error;

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save payment methods:", error);
    return { success: false, error: error.message };
  }
}
