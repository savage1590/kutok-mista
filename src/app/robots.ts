import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/ua/admin/', '/en/admin/', '/ua/cart/', '/en/cart/'],
    },
    sitemap: 'https://www.kutok-mista.com.ua/sitemap.xml',
  }
}
