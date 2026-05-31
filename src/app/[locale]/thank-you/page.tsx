import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage({ searchParams }: { searchParams: { order_id?: string } }) {
  // In a real scenario, you can fetch order details using the order_id if needed
  
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Дякуємо за ваше замовлення!
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Ваше замовлення успішно створено. Якщо ви обрали оплату через LiqPay і платіж пройшов успішно, статус вашого замовлення оновлено автоматично. Найближчим часом ми зв'яжемось з вами для підтвердження.
        </p>

        {searchParams?.order_id && (
          <p className="text-sm text-gray-500 mb-8 font-mono bg-gray-100 py-2 px-4 rounded-lg inline-block">
            Номер замовлення: #{searchParams.order_id.slice(0, 8)}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-brand text-white font-medium rounded-full hover:bg-brand/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-brand/25"
          >
            На головну
          </Link>
          <Link 
            href="/products"
            className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 border border-gray-200 font-medium rounded-full hover:bg-gray-50 transition-all"
          >
            У каталог
          </Link>
        </div>
      </div>
    </main>
  );
}
