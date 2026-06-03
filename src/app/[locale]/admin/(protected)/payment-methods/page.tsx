import { supabase } from "@/lib/supabase";
import PaymentMethodsClient from "./PaymentMethodsClient";
import { PaymentMethod } from "@/components/admin/PaymentMethodsSettings";

export default async function PaymentMethodsPage() {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "payment_methods")
    .single();

  const methods: PaymentMethod[] = data?.value || [];

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto w-full">
      <PaymentMethodsClient initialMethods={methods} />
    </div>
  );
}
