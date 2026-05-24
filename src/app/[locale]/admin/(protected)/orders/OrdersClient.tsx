"use client";

import { useState } from "react";
import { updateOrderStatus } from "./actions";
import { Search, ChevronDown, Package } from "lucide-react";

type Order = any; // We can type this properly later

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const statuses = [
    { value: "all", label: "Всі" },
    { value: "new", label: "Нові" },
    { value: "processing", label: "В обробці" },
    { value: "paid", label: "Оплачені" },
    { value: "shipped", label: "Відправлені" },
    { value: "completed", label: "Виконані" },
    { value: "cancelled", label: "Скасовані" },
  ];

  const paymentStatuses = [
    { value: "pending", label: "Очікує" },
    { value: "paid", label: "Оплачено" },
    { value: "failed", label: "Помилка" },
  ];

  const statusColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200 focus:border-blue-500 hover:bg-blue-100",
    processing: "bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-500 hover:bg-purple-100",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500 hover:bg-emerald-100",
    shipped: "bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500 hover:bg-amber-100",
    completed: "bg-green-50 text-green-700 border-green-200 focus:border-green-500 hover:bg-green-100",
    cancelled: "bg-red-50 text-red-700 border-red-200 focus:border-red-500 hover:bg-red-100",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-orange-50 text-orange-700 border-orange-200 focus:border-orange-500 hover:bg-orange-100",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500 hover:bg-emerald-100",
    failed: "bg-red-50 text-red-700 border-red-200 focus:border-red-500 hover:bg-red-100",
  };

  const handleStatusChange = async (orderId: string, newStatus: string, currentPaymentStatus: string) => {
    setLoadingId(orderId);
    const res = await updateOrderStatus(orderId, newStatus, currentPaymentStatus);
    if (res.success) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  const handlePaymentStatusChange = async (orderId: string, currentStatus: string, newPaymentStatus: string) => {
    setLoadingId(orderId);
    const res = await updateOrderStatus(orderId, currentStatus, newPaymentStatus);
    if (res.success) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_phone.toLowerCase().includes(searchLower) ||
      order.customer_email.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Пошук за ім'ям, телефоном або ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand transition-colors text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {statuses.map(status => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status.value 
                  ? "bg-brand text-white shadow-sm shadow-brand/30" 
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Замовлень не знайдено</h3>
            <p className="text-gray-500">За вашими критеріями немає жодного замовлення.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{order.customer_name}</h3>
                    <span className="text-sm font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    <span>📞 {order.customer_phone}</span>
                    <span>✉️ {order.customer_email}</span>
                    <span className="font-medium text-gray-900">📍 {order.shipping_address}</span>
                  </div>
                  {order.customer_comment && (
                    <div className="mt-2 bg-yellow-50/50 border border-yellow-100 p-3 rounded-xl text-sm text-yellow-800">
                      <strong>Коментар клієнта:</strong> {order.customer_comment}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(order.created_at).toLocaleString('uk-UA')}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Статус замовлення</label>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value, order.payment_status)}
                        disabled={loadingId === order.id}
                        className={`w-full appearance-none border font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer disabled:opacity-50 transition-colors ${statusColors[order.status] || "bg-gray-50 border-gray-200 text-gray-900 focus:border-brand"}`}
                      >
                        {statuses.filter(s => s.value !== "all").map(s => (
                          <option key={s.value} value={s.value} className="bg-white text-gray-900">{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Оплата ({order.payment_method})</label>
                    <div className="relative">
                      <select
                        value={order.payment_status}
                        onChange={(e) => handlePaymentStatusChange(order.id, order.status, e.target.value)}
                        disabled={loadingId === order.id}
                        className={`w-full appearance-none border font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer disabled:opacity-50 transition-colors ${paymentStatusColors[order.payment_status] || "bg-gray-50 border-gray-200 text-gray-900 focus:border-brand"}`}
                      >
                        {paymentStatuses.map(s => (
                          <option key={s.value} value={s.value} className="bg-white text-gray-900">{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4">Товари ({order.order_items?.length || 0})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.product?.image_url && (
                          <img src={item.product.image_url} alt="product" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col py-0.5 justify-between flex-1">
                        <div>
                          <p className="font-bold text-sm leading-tight line-clamp-2">{item.product?.name_ua || 'Невідомий товар'}</p>
                          {item.selected_properties && Object.entries(item.selected_properties).length > 0 && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {Object.values(item.selected_properties).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-gray-500">{item.quantity} шт</span>
                          <span className="font-bold text-sm">{item.price_at_time} ₴</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Загальна сума:</span>
                <span className="text-2xl font-black">{order.total_amount} ₴</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
