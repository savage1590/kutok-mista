import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ContactsClient from "./ContactsClient";

export default async function AdminContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch current contacts settings
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "contacts")
    .single();

  const initialContacts = data?.value || {};

  return (
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Контакти</h1>
          <p className="text-gray-500 mt-1">Керуйте контактною інформацією на сайті</p>
        </div>
        <ContactsClient initialContacts={initialContacts} />
      </main>
  );
}
