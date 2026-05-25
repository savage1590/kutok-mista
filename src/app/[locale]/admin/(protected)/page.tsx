import { getStatistics } from "./statistics-actions";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Статистика | Kutok Admin",
};

export default async function AdminDashboardPage() {
  const initialData = await getStatistics("30days");

  return (
    <main className="flex-1 p-6 lg:p-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Аналітика та Статистика</h1>
          <p className="text-gray-500">Огляд показників магазину та звіт по продажах.</p>
        </div>
        
        <DashboardClient initialData={initialData} />
      </div>
    </main>
  );
}
