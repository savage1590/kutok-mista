import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.kutok-mista.com.ua'
  const locales = ['ua', 'en']
  
  // Default routes
  const staticRoutes = [
    '',
    '/products',
    '/cart',
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add static routes for each locale
  for (const locale of locales) {
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      })
    }
  }

  // Fetch all products
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, slug, updated_at')

  if (products) {
    for (const product of products) {
      const productIdentifier = product.slug || product.id
      for (const locale of locales) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/products/${productIdentifier}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        })
      }
    }
  }

  return sitemapEntries
}
