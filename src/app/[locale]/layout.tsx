import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isUa = locale === "ua";
  
  return {
    metadataBase: new URL("https://www.kutok-mista.com.ua"),
    title: {
      template: "%s | Kutok Mista",
      default: isUa ? "Kutok Mista | Урбаністична естетика" : "Kutok Mista | Urban Aesthetics",
    },
    description: isUa 
      ? "Магазин урбаністичного одягу та 3D-артефактів. Унікальний дизайн, рефлективні елементи та стиль міста." 
      : "Store of urban apparel and 3D artifacts. Unique design, reflective elements, and city style.",
    keywords: isUa 
      ? ["одяг", "футболки", "урбан", "стрітвір", "Kutok Mista", "3D друк", "сувеніри", "худі", "Харків"]
      : ["apparel", "t-shirts", "urban", "streetwear", "Kutok Mista", "3D printing", "souvenirs", "hoodies", "Kharkiv"],
    openGraph: {
      type: "website",
      locale: "uk_UA",
      url: `https://www.kutok-mista.com.ua`,
      siteName: "Kutok Mista",
      title: "Kutok Mista | Урбаністична естетика",
      description: "Магазин урбаністичного одягу та 3D-артефактів. Унікальний дизайн, рефлективні елементи та стиль міста.",
      images: [
        {
          url: "https://www.kutok-mista.com.ua/logo.png",
          width: 800,
          height: 600,
          alt: "Kutok Mista Logo",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Kutok Mista | Урбаністична естетика",
      description: "Магазин урбаністичного одягу та 3D-артефактів.",
      images: ["https://www.kutok-mista.com.ua/logo.png"],
    },
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
              }
            }} 
          />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
