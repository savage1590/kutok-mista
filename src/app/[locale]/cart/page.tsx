import CartClient from "./CartClient";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <CartClient locale={locale} />
    </main>
  );
}
