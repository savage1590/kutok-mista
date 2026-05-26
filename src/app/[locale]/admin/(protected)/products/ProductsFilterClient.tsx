"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Search } from "lucide-react";

export default function ProductsFilterClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentType = searchParams.get("type") || "";
  const currentStatus = searchParams.get("status") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // basic debounce
    setTimeout(() => {
      router.push(pathname + "?" + createQueryString("search", e.target.value));
    }, 500);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Пошук за назвою або артикулом..."
          value={searchTerm}
          onChange={(e) => {
             setSearchTerm(e.target.value);
             // We can do it on blur or simple timeout. Let's do a simple inline debounce or form submit
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(pathname + "?" + createQueryString("search", searchTerm));
            }
          }}
          onBlur={() => {
             router.push(pathname + "?" + createQueryString("search", searchTerm));
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
        />
      </div>
      
      <div className="flex gap-4">
        <select
          value={currentType}
          onChange={(e) => router.push(pathname + "?" + createQueryString("type", e.target.value))}
          className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
        >
          <option value="">Всі типи</option>
          <option value="apparel">Одяг</option>
          <option value="artifact">Артефакти</option>
          <option value="souvenir">Сувеніри</option>
        </select>

        <select
          value={currentStatus}
          onChange={(e) => router.push(pathname + "?" + createQueryString("status", e.target.value))}
          className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
        >
          <option value="">Всі статуси</option>
          <option value="in_stock">В наявності</option>
          <option value="out_of_stock">Немає</option>
        </select>
      </div>
    </div>
  );
}
