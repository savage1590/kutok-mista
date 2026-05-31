"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin } from "lucide-react";

interface City {
  ref: string;
  name: string;
  deliveryCityRef: string;
}

interface NovaPoshtaCitySelectProps {
  value: string;
  onChange: (cityName: string, cityRef: string) => void;
  placeholder: string;
  hasError?: boolean;
}

export function NovaPoshtaCitySelect({ value, onChange, placeholder, hasError }: NovaPoshtaCitySelectProps) {
  const [query, setQuery] = useState(value);
  const [cities, setCities] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value with local query if it changes externally
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

  useEffect(() => {
    const fetchCities = async () => {
      if (!query || query.length < 2) {
        setCities([]);
        return;
      }
      
      // Don't fetch if the query exactly matches the selected value
      if (query === value) return;

      setIsLoading(true);
      try {
        const res = await fetch("/api/novaposhta/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchString: query })
        });
        const data = await res.json();
        if (data.cities) {
          setCities(data.cities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCities, 500);
    return () => clearTimeout(debounceTimer);
  }, [query, value]);

  const handleSelect = (city: City) => {
    setQuery(city.name);
    onChange(city.name, city.ref);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") {
              onChange("", "");
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-10 py-3 rounded-xl border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-brand outline-none transition-colors`}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && query.length >= 2 && cities.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto">
          {cities.map((city) => (
            <li
              key={city.ref}
              onClick={() => handleSelect(city)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
            >
              {city.name}
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && query.length >= 2 && cities.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
          Місто не знайдено
        </div>
      )}
    </div>
  );
}
