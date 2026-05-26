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

export const metadata: Metadata = {
  title: "Kutok Mista | Urban Aesthetics",
  description: "Minimalist apparel and 3D-printed artifacts.",
};

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
