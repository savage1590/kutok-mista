"use client";

import PaymentMethodsSettings, { PaymentMethod } from "@/components/admin/PaymentMethodsSettings";
import { savePaymentMethods } from "./actions";

export default function PaymentMethodsClient({ initialMethods }: { initialMethods: PaymentMethod[] }) {
  const handleSave = async (methods: PaymentMethod[]) => {
    const formData = new FormData();
    formData.append("methods", JSON.stringify(methods));
    
    const result = await savePaymentMethods(formData);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  return <PaymentMethodsSettings initialMethods={initialMethods} onSave={handleSave} />;
}
