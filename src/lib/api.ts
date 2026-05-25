import { supabase } from "./supabase";
import { Product } from "./types";
import { MOCK_PRODUCTS } from "./mockData";

export interface ProductFilters {
  category?: string; // comma-separated slugs e.g. "tshirts,hoodies"
  collection?: string; // comma-separated collection ids
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: string; // 'price_asc', 'price_desc', 'newest'
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_ua');
  
  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  // Parse multi-category slugs
  const categorySlugs = filters?.category ? filters.category.split(',').filter(Boolean) : [];
  const hasCategory = categorySlugs.length > 0;

  const selectQuery = hasCategory
    ? `*, categories!inner(*), product_images(image_url, is_primary)`
    : `*, categories(*), product_images(image_url, is_primary)`;

  let query = supabase
    .from('products')
    .select(selectQuery);

  if (hasCategory) {
    if (categorySlugs.length === 1) {
      query = query.eq('categories.slug', categorySlugs[0]);
    } else {
      query = query.in('categories.slug', categorySlugs);
    }
  }

  if (filters?.min_price !== undefined) {
    query = query.gte('price', filters.min_price);
  }

  if (filters?.max_price !== undefined) {
    query = query.lte('price', filters.max_price);
  }

  if (filters?.in_stock) {
    query = query.eq('stock_status', 'in_stock');
  }

  if (filters?.sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (filters?.sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    console.warn("Failed to fetch products from Supabase or no products found. Using mock data.", error);
    if (!filters) {
      return MOCK_PRODUCTS;
    }
    return [];
  }

  // Transform the joined data to match the Product interface
  let products = data.map((item: any) => {
    const images = item.product_images as any[];
    const primaryImage = images?.find(img => img.is_primary)?.image_url 
      || images?.[0]?.image_url 
      || undefined;

    return {
      ...item,
      image_url: primaryImage
    };
  });

  // Filter by collection client-side (collection_ids stored in properties)
  if (filters?.collection) {
    const collectionIds = filters.collection.split(',').filter(Boolean);
    products = products.filter(p => {
      const productCollections: string[] = p.properties?.collection_ids || [];
      return collectionIds.some(cId => productCollections.includes(cId));
    });
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(*),
      product_images (
        id,
        image_url,
        is_primary
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.warn(`Failed to fetch product ${id} from Supabase. Falling back to mock data.`, error);
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }

  const images = data.product_images as any[];
  const primaryImage = images?.find(img => img.is_primary)?.image_url 
    || images?.[0]?.image_url 
    || undefined;

  return {
    ...data,
    image_url: primaryImage,
    images: images
  };
}
