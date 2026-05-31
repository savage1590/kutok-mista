"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Package, Loader2 } from "lucide-react";

interface Warehouse {
  ref: string;
  name: string;
  typeRef: string;
  isLocker: boolean;
}

interface NovaPoshtaWarehouseSelectProps {
  cityRef: string;
  value: string;
  onChange: (warehouseName: string) => void;
  placeholder: string;
  hasError?: boolean;
  isLockerOnly: boolean;
}

export function NovaPoshtaWarehouseSelect({ cityRef, value, onChange, placeholder, hasError, isLockerOnly }: NovaPoshtaWarehouseSelectProps) {
  const [query, setQuery] = useState(value);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch ALL warehouses for the city when cityRef changes
  useEffect(() => {
    let isMounted = true;
    const fetchWarehouses = async () => {
      if (!cityRef) {
        setWarehouses([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/novaposhta/warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cityRef })
        });
        const data = await res.json();
        if (data.warehouses && isMounted) {
          setWarehouses(data.warehouses);
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWarehouses();
    return () => { isMounted = false; };
  }, [cityRef]);

  // Filter warehouses based on user query and locker preference
  const filteredWarehouses = useMemo(() => {
    let filtered = warehouses;
    
    // Filter by type (Locker vs Branch)
    if (isLockerOnly) {
      filtered = filtered.filter(w => w.isLocker);
    } else {
      filtered = filtered.filter(w => !w.isLocker);
    }

    // Filter by search query
    if (query && query !== value) {
      const q = query.toLowerCase();
      filtered = filtered.filter(w => w.name.toLowerCase().includes(q));
    }

    return filtered.slice(0, 50); // Limit to 50 for performance
  }, [warehouses, query, value, isLockerOnly]);

  const handleSelect = (warehouse: Warehouse) => {
    setQuery(warehouse.name);
    onChange(warehouse.name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") {
              onChange("");
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={!cityRef || isLoading}
          className={`w-full pl-12 pr-10 py-3 rounded-xl border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-brand outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && cityRef && !isLoading && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredWarehouses.length > 0 ? (
            filteredWarehouses.map((warehouse) => (
              <li
                key={warehouse.ref}
                onClick={() => handleSelect(warehouse)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
              >
                {warehouse.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-gray-500 text-center">
              Нічого не знайдено
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
