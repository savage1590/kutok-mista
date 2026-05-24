import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CollectionsClient from "./CollectionsClient";

export default async function AdminCollectionsPage() {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "collections")
    .single();

  const collections = data?.value || [];

  return (
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Колекції</h1>
          <p className="text-gray-500 mt-1">Керування колекціями товарів (капсули, лімітовані серії тощо)</p>
        </div>

        <CollectionsClient initialCollections={collections as any[]} />
      </main>
  );
}
