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
    sku: formData.get("sku") as string || null,
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

  // Save collection IDs
  const collectionIds = formData.getAll("collection_id") as string[];
  if (collectionIds.length > 0) {
    properties.collection_ids = collectionIds;
  }
  
  // Save image fit preference
  const imageFit = formData.get("image_fit") as string;
  if (imageFit) {
    properties.image_fit = imageFit;
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

  // Handle multiple Image Uploads
  const imageFiles = formData.getAll("images") as File[];
  if (imageFiles && imageFiles.length > 0) {
    // Check if product already has a primary image
    const { data: existingImages } = await supabaseAdmin
      .from("product_images")
      .select("id")
      .eq("product_id", newProductId)
      .eq("is_primary", true);
      
    let hasPrimary = existingImages && existingImages.length > 0;

    for (const imageFile of imageFiles) {
      if (imageFile.size === 0) continue;

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${newProductId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
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

      // First uploaded image is primary if there was no primary image
      const isPrimary = !hasPrimary;
      hasPrimary = true; // after first successful upload, it has a primary

      await supabaseAdmin
        .from("product_images")
        .insert({
          product_id: newProductId,
          image_url: publicUrlData.publicUrl,
          is_primary: isPrimary
        });
    }
  }

  revalidatePath("/", "layout");
  return newProductId;
}

export async function deleteProduct(productId: string) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) {
    return { success: false, error: "Неавторизований доступ" };
  }

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    if (error.code === '23503') { // Foreign key constraint violation
      return {
        success: false,
        error: "Цей товар присутній в існуючих замовленнях. Його не можна видалити, щоб не порушити історію продажів. Будь ласка, просто змініть його статус на 'Немає в наявності'."
      };
    }
    return { success: false, error: error.message };
  }
  
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProductImage(imageId: string, imageUrl: string) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) throw new Error("Unauthorized");

  // Extract filename from URL (everything after the last slash)
  const fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

  // 1. Delete from Supabase Storage
  if (fileName) {
    await supabaseAdmin.storage.from("product-images").remove([fileName]);
  }

  // 2. Delete from Database
  const { error } = await supabaseAdmin
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function setPrimaryImage(productId: string, imageId: string) {
  const isAuthorized = await verifyAdminAccess();
  if (!isAuthorized) throw new Error("Unauthorized");

  // 1. Unset all primary for this product
  await supabaseAdmin
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  // 2. Set the selected image as primary
  const { error } = await supabaseAdmin
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
