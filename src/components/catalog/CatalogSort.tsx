"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CatalogSort({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-500 whitespace-nowrap">
        {locale === "ua" ? "Сортування:" : "Sort by:"}
      </label>
      <select 
        value={currentSort} 
        onChange={handleSortChange}
        className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors cursor-pointer"
      >
        <option value="newest">{locale === "ua" ? "Спочатку нові" : "Newest"}</option>
        <option value="price_asc">{locale === "ua" ? "Від дешевих до дорогих" : "Price: Low to High"}</option>
        <option value="price_desc">{locale === "ua" ? "Від дорогих до дешевих" : "Price: High to Low"}</option>
      </select>
    </div>
  );
}
