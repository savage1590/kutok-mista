import { Link } from "@/i18n/routing";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Plus } from "lucide-react";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Fetch products using admin client
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*, product_images(image_url, is_primary)")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Товари</h1>
          <p className="text-gray-500 mt-1">Керуйте асортиментом вашого магазину</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-full font-bold hover:bg-brand-light transition-all shadow-md">
          <Plus className="w-5 h-5"/>
          Додати товар
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          Помилка завантаження товарів: {error.message}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Товар</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                <th className="px-6 py-4 font-medium">Ціна</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Немає товарів. Додайте свій перший товар!
                  </td>
                </tr>
              ) : (
                products?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {product.product_images?.[0]?.image_url ? (
                            <img src={product.product_images[0].image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{product.name_ua}</div>
                          <div className="text-sm text-gray-500">{product.name_en}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{product.type}</td>
                    <td className="px-6 py-4 font-medium">{product.price} ₴</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.stock_status === 'in_stock' 
                          ? 'bg-green-100 text-green-700 ' 
                          : 'bg-red-100 text-red-700 '
                      }`}>
                        {product.stock_status === 'in_stock' ? 'В наявності' : 'Немає'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-brand hover:underline font-medium text-sm">
                        Редагувати
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
