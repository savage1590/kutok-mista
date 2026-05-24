"use client";

import { useState } from"react";
import { loginAdmin } from"../actions";
import { useLocale } from"next-intl";

export default function AdminLoginPage() {
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const locale = useLocale();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 setError(null);
 
 try {
 const result = await loginAdmin(password, locale);
 if (result?.error) {
 setError(result.error);
 setIsLoading(false);
 }
 } catch (err) {
 setError("Помилка підключення до сервера");
 setIsLoading(false);
 }
 };

 return (
 <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 px-4">
 <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
 <div className="text-center mb-8">
 <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Адмін Панель</h1>
 <p className="text-gray-500">Введіть пароль для доступу до керування товарами.</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-sm font-semibold text-foreground mb-2"htmlFor="password">
 Секретний пароль
 </label>
 <input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-foreground focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
 placeholder="••••••••••••"
 required
 />
 </div>

 {error && (
 <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100">
 {error}
 </div>
)}

 <button
 type="submit"
 disabled={isLoading || !password}
 className="w-full py-4 bg-brand text-white rounded-xl font-bold tracking-wide hover:bg-brand-light hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
 >
 {isLoading ?"Перевірка...":"Увійти"}
 </button>
 </form>
 </div>
 </div>
);
}
