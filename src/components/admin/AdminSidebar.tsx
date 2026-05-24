"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { LogOut, Package, Tag, ShoppingBag, Image, Star, Phone, Menu, X, LayoutGrid } from "lucide-react";
import { useLocale } from "next-intl";
import { logoutAdmin } from "@/app/[locale]/admin/actions";

export default function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/admin", icon: <Package className="w-5 h-5" />, label: "Товари", exact: true },
    { href: "/admin/categories", icon: <Tag className="w-5 h-5" />, label: "Категорії" },
    { href: "/admin/banners", icon: <Image className="w-5 h-5" />, label: "Гол. Банери" },
    { href: "/admin/featured", icon: <Star className="w-5 h-5" />, label: "Гол. Хіти продажу" },
    { href: "/admin/home-categories", icon: <LayoutGrid className="w-5 h-5" />, label: "Гол. Категорії" },
    { href: "/admin/contacts", icon: <Phone className="w-5 h-5" />, label: "Контакти" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <h2 className="text-base font-black text-gray-900 tracking-tight leading-none">Kutok Admin</h2>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed md:relative top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 flex-shrink-0 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Close Button Mobile */}
        <button 
          onClick={() => setIsOpen(false)} 
          className="md:hidden absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      {/* Brand */}
      <div className="flex items-center gap-3 pb-2">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
          <span className="text-white font-black text-sm">K</span>
        </div>
        <div>
          <h2 className="text-base font-black text-gray-900 tracking-tight leading-none">Kutok Admin</h2>
          <p className="text-xs text-gray-400 mt-0.5">Керування магазином</p>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand text-white shadow-sm shadow-brand/30"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/admin/orders")
              ? "bg-brand text-white shadow-sm shadow-brand/30"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          Замовлення
        </Link>
      </nav>

      <div className="h-px bg-gray-100" />

      {/* Logout */}
      <form action={() => logoutAdmin(locale)}>
        <button
          type="submit"
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Вийти
        </button>
      </form>
      </aside>
    </>
  );
}
