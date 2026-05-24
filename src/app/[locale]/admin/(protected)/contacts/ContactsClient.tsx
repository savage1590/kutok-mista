"use client";

import { useState } from "react";
import { saveContacts } from "../../settings-actions";
import { Save } from "lucide-react";

type ContactsData = {
  phone1?: string;
  phone2?: string;
  email?: string;
  telegram?: string;
  viber?: string;
  instagram?: string;
  hours_ua?: string;
  hours_en?: string;
};

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function ContactsClient({ initialContacts }: { initialContacts: ContactsData }) {
  const [contacts, setContacts] = useState<ContactsData>(initialContacts);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContacts({ ...contacts, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await saveContacts(contacts as Record<string, string>);
    setMessage(result.error
      ? { type: "error", text: `Помилка: ${result.error}` }
      : { type: "success", text: "Контакти збережено!" }
    );
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-5">
      {/* Phones */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">📞 Телефони</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Основний телефон</label>
            <input type="text" name="phone1" value={contacts.phone1 || ""} onChange={handleChange} className={inputCls} placeholder="+38 (000) 000-00-00" />
          </div>
          <div>
            <label className={labelCls}>Додатковий телефон</label>
            <input type="text" name="phone2" value={contacts.phone2 || ""} onChange={handleChange} className={inputCls} placeholder="+38 (000) 000-00-00" />
          </div>
        </div>
      </div>

      {/* Socials & Email */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">🌐 Мережі та Email</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" name="email" value={contacts.email || ""} onChange={handleChange} className={inputCls} placeholder="info@kutok-mista.com.ua" />
          </div>
          <div>
            <label className={labelCls}>Instagram (посилання)</label>
            <input type="text" name="instagram" value={contacts.instagram || ""} onChange={handleChange} className={inputCls} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className={labelCls}>Telegram (посилання)</label>
            <input type="text" name="telegram" value={contacts.telegram || ""} onChange={handleChange} className={inputCls} placeholder="https://t.me/username" />
          </div>
          <div>
            <label className={labelCls}>Viber (посилання)</label>
            <input type="text" name="viber" value={contacts.viber || ""} onChange={handleChange} className={inputCls} placeholder="viber://chat?number=..." />
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">🕐 Графік роботи</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Українською</label>
            <input type="text" name="hours_ua" value={contacts.hours_ua || ""} onChange={handleChange} className={inputCls} placeholder="Пн–Пт: 10:00–19:00" />
          </div>
          <div>
            <label className={labelCls}>English</label>
            <input type="text" name="hours_en" value={contacts.hours_en || ""} onChange={handleChange} className={inputCls} placeholder="Mon–Fri: 10:00–19:00" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        {message ? (
          <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </span>
        ) : <div />}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-light transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Збереження..." : "Зберегти зміни"}
        </button>
      </div>
    </form>
  );
}
