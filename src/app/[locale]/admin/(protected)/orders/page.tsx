import { getOrders, getFastOrders } from "./actions";
import OrdersClient from "./OrdersClient";

export const metadata = {
  title: "Замовлення | Kutok Admin",
};

export default async function OrdersPage() {
  const [orders, fastOrders] = await Promise.all([
    getOrders(),
    getFastOrders()
  ]);

  return (
    <main className="flex-1 p-6 lg:p-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Замовлення</h1>
          <p className="text-gray-500">Керування замовленнями клієнтів та їх статусами.</p>
        </div>
        <OrdersClient initialOrders={orders} initialFastOrders={fastOrders} />
      </div>
    </main>
  );
}
