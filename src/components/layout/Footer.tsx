import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Headphones, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function Footer() {
  const locale = await getLocale();
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const tFooter = await getTranslations({ locale, namespace: "Footer" });

  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "contacts")
    .single();

  const contacts = data?.value || {};

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-foreground mt-auto font-sans">
      <div className="container mx-auto px-4 py-12">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-12">
          
          {/* Phones */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <Headphones className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">{tFooter("phones")}</span>
            </div>
            <div className="flex flex-col gap-2 font-medium text-gray-800 text-center md:text-left">
              {contacts.phone1 && (
                <a href={`tel:${contacts.phone1.replace(/\D/g, '')}`} className="hover:text-brand transition-colors">{contacts.phone1}</a>
              )}
              {contacts.phone2 && (
                <a href={`tel:${contacts.phone2.replace(/\D/g, '')}`} className="hover:text-brand transition-colors">{contacts.phone2}</a>
              )}
            </div>
          </div>

          {/* Logo - Centered */}
          <div className="flex justify-center order-first md:order-none mb-6 md:mb-0">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo-vertical.svg" 
                alt="Kutok Mista Logo" 
                width={200} 
                height={200} 
                className="h-24 md:h-32 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center gap-2 mb-4 text-gray-500 md:justify-end">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">{tFooter("socials")}</span>
            </div>
            <div className="flex gap-3 md:justify-end">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:text-brand hover:border-brand/30 hover:bg-blue-50 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {contacts.instagram && (
                <a href={contacts.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:text-brand hover:border-brand/30 hover:bg-blue-50 transition-colors">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              <a href="https://t.me/kutokmista_bot" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:text-brand hover:border-brand/30 hover:bg-blue-50 transition-colors">
                <Send className="w-5 h-5 ml-[-2px]" />
              </a>
            </div>
          </div>
          
        </div>

        <div className="w-full h-px bg-gray-200 mb-12"></div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-6">{tFooter("info")}</h3>
            <nav className="flex flex-col gap-3 text-sm text-gray-700">
              <Link href="/" className="hover:text-brand transition-colors w-fit">{tNav("home")}</Link>
              <Link href="/products" className="hover:text-brand transition-colors w-fit">{tNav("catalog")}</Link>
              <Link href="/about" className="hover:text-brand transition-colors w-fit">{tNav("about")}</Link>
              <Link href="/contact" className="hover:text-brand transition-colors w-fit">{tNav("contact")}</Link>
              <Link href="/wishlist" className="hover:text-brand transition-colors w-fit">{tNav("wishlist")}</Link>
            </nav>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-6">{tFooter("contacts")}</h3>
            <div className="flex flex-col gap-4 text-sm text-gray-700">
              {contacts.email && (
                <a href={`mailto:${contacts.email}`} className="hover:text-brand transition-colors underline underline-offset-4 text-foreground">{contacts.email}</a>
              )}
              <p className="text-gray-500">{locale === 'en' ? contacts.hours_en : contacts.hours_ua}</p>
              
              <div className="flex gap-2 mt-2">
                <div className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 text-xs font-bold shadow-sm">VISA</div>
                <div className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 text-xs font-bold shadow-sm">MasterCard</div>
                <div className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 text-xs font-bold shadow-sm">Apple Pay</div>
              </div>
            </div>
          </div>

          {/* Messengers */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-6">{tFooter("messengers")}</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              {contacts.telegram && (
                <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand transition-colors w-fit">
                  <Send className="w-4 h-4" /> Telegram
                </a>
              )}
              {contacts.viber && (
                <a href={contacts.viber} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
                  <Image src="/icons/viber.svg" alt="Viber" width={16} height={16} />
                  Viber
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-400 mt-12 pt-8 border-t border-gray-200">
          KUTOK MISTA © {new Date().getFullYear()}
        </div>

      </div>
    </footer>
  );
}
