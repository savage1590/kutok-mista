import WishlistClient from "./WishlistClient";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <main className="flex-1 bg-white min-h-[calc(100vh-4rem)]">
      <WishlistClient locale={locale} />
    </main>
  );
}
