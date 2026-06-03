import CartClient from "./CartClient";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ua" ? "Кошик" : "Cart",
    robots: {
      index: false,
      follow: false,
    }
  };
}
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "payment_methods")
    .single();

  const paymentMethods = data?.value || [];
  
  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <CartClient locale={locale} paymentMethods={paymentMethods} />
    </main>
  );
}
