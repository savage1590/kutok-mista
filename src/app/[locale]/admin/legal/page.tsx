import { supabase } from "@/lib/supabase";
import LegalPagesSettings from "@/components/admin/LegalPagesSettings";

export const revalidate = 0;

export default async function AdminLegalPages() {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "legal_pages")
    .single();

  const legalPages = (data?.value || []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Правова інформація</h1>
        <p className="text-sm text-gray-500 mt-1">
          Керування юридичними документами на сайті (Оферта, Політика конфіденційності тощо)
        </p>
      </div>

      <LegalPagesSettings initialData={legalPages} />
    </div>
  );
}
