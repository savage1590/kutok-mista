"use client";

import { useState } from "react";
import { getStatistics } from "./statistics-actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, ShoppingBag, Package, TrendingUp, Download } from "lucide-react";
import * as XLSX from "xlsx";

type Period = "7days" | "30days" | "month" | "all";

export default function DashboardClient({ initialData }: { initialData: any }) {
  const [period, setPeriod] = useState<Period>("30days");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = async (newPeriod: Period) => {
    setPeriod(newPeriod);
    setLoading(true);
    const newData = await getStatistics(newPeriod);
    if (newData) {
      setData(newData);
    }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (!data || !data.rawOrdersForExport || data.rawOrdersForExport.length === 0) {
      alert("Немає даних для експорту.");
      return;
    }

    // Prepare data for Excel
    const wsData = data.rawOrdersForExport.map((order: any) => ({
      "ID Замовлення": order.id,
      "Дата": order.date,
      "Сума (₴)": order.total_amount,
      "Статус": order.status,
      "Оплата": order.payment_status
    }));

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Замовлення");
    
    // Generate file and trigger download
    XLSX.writeFile(workbook, `Статистика_Замовлень_${period}.xlsx`);
  };

  if (!data) return null;

  const { kpi, chartData, statusData, topProducts } = data;

  const kpiCards = [
    { title: "Загальний дохід", value: `${kpi.totalRevenue} ₴`, icon: <DollarSign className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-50", text: "text-emerald-700" },
    { title: "Всього замовлень", value: kpi.totalOrders, icon: <ShoppingBag className="w-6 h-6 text-brand" />, bg: "bg-brand/10", text: "text-brand" },
    { title: "Середній чек", value: `${kpi.averageCheck} ₴`, icon: <TrendingUp className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50", text: "text-blue-700" },
    { title: "Продано товарів", value: kpi.totalItemsSold, icon: <Package className="w-6 h-6 text-purple-600" />, bg: "bg-purple-50", text: "text-purple-700" },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {[
            { value: "7days", label: "За 7 днів" },
            { value: "30days", label: "За 30 днів" },
            { value: "month", label: "Цей місяць" },
            { value: "all", label: "За весь час" },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value as Period)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                period === p.value 
                  ? "bg-brand text-white shadow-sm shadow-brand/30" 
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Експорт в Excel
        </button>
      </div>

      {loading && (
        <div className="text-brand font-medium text-center">Оновлення даних...</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Динаміка доходів</h3>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={3} dot={{ r: 4, fill: "#111" }} activeDot={{ r: 6 }} name="Дохід (₴)" />
                  <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Немає даних за цей період</div>
            )}
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Статуси замовлень</h3>
          <p className="text-sm text-gray-500 mb-6">Загальний розподіл замовлень</p>
          <div className="flex-1 w-full min-h-[250px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Немає даних</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Хіти продажів (Топ-10)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Місце</th>
                <th className="px-6 py-4 font-medium">Товар</th>
                <th className="px-6 py-4 font-medium text-right">Продано шт.</th>
                <th className="px-6 py-4 font-medium text-right">Сума (₴)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Немає проданих товарів за вибраний період.
                  </td>
                </tr>
              ) : (
                topProducts.map((product: any, index: number) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-700">
                      {product.quantitySold}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600">
                      {product.revenue}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
