"use server";

import { verifyAdminAccess } from "../../actions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveProduct(formData: FormData, productId?: string) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) throw new Error("Unauthorized");

  const type = formData.get("type") as "apparel" | "artifact";
  
  // Base properties
  const category_id = formData.get("category_id") as string;
  const productData: any = {
    name_ua: formData.get("name_ua") as string,
    name_en: formData.get("name_en") as string,
    description_ua: formData.get("description_ua") as string,
    description_en: formData.get("description_en") as string,
    price: parseInt(formData.get("price") as string, 10),
    type,
    stock_status: formData.get("stock_status") as string,
    is_on_demand: formData.get("is_on_demand") === "on",
    properties: {} as any,
  };

  if (category_id) {
    productData.category_id = category_id;
  } else {
    productData.category_id = null;
  }

  const properties: any = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("prop_")) {
      const propName = key.replace("prop_", "");
      // formData.getAll gets all checked values for this name
      const values = formData.getAll(key) as string[];
      if (values.length > 0) {
        properties[propName] = values;
      }
    }
  }
  const size_chart_id = formData.get("size_chart_id") as string;
  if (size_chart_id) {
    properties.size_chart_id = size_chart_id;
  }
  
  productData.properties = properties;

  let newProductId = productId;

  if (productId) {
    // Update existing
    const { error } = await supabaseAdmin
      .from("products")
      .update(productData)
      .eq("id", productId);
    
    if (error) throw new Error(error.message);
  } else {
    // Create new
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    newProductId = data.id;
  }

  // Handle Image Upload if provided
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${newProductId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from("product-images")
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw new Error("Error uploading image: " + uploadError.message);

    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from("product-images")
      .getPublicUrl(fileName);

    // Link image to product
    await supabaseAdmin
      .from("product_images")
      .insert({
        product_id: newProductId,
        image_url: publicUrlData.publicUrl,
        is_primary: true
      });
  }

  revalidatePath("/", "layout");
  redirect("/ua/admin");
}

export async function deleteProduct(productId: string) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/", "layout");
}
