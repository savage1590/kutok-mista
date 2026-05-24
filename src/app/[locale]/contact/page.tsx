import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Headphones, Mail, Clock, Send, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: `${t("title")} | Kutok Mista`,
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "contacts")
    .single();

  const contacts = data?.value || {};

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-brand transition-colors">
          {locale === "ua" ? "Головна" : "Home"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t("title")}</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 uppercase">
        {t("title")}
      </h1>
      
      <p className="text-lg text-gray-600 mb-12 max-w-2xl leading-relaxed">
        {t("intro")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white border border-gray-200 p-8 md:p-12 shadow-sm rounded-lg">
        
        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Headphones className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">{t("phonesLabel")}</h3>
            </div>
            <div className="flex flex-col gap-1 text-lg font-medium text-foreground">
              {contacts.phone1 && (
                <a href={`tel:${contacts.phone1.replace(/\D/g, '')}`} className="hover:text-brand transition-colors">{contacts.phone1}</a>
              )}
              {contacts.phone2 && (
                <a href={`tel:${contacts.phone2.replace(/\D/g, '')}`} className="hover:text-brand transition-colors">{contacts.phone2}</a>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Mail className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">{t("emailLabel")}</h3>
            </div>
            {contacts.email && (
              <a href={`mailto:${contacts.email}`} className="text-lg font-medium hover:text-brand transition-colors underline underline-offset-4 text-foreground">
                {contacts.email}
              </a>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Clock className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">{t("hoursLabel")}</h3>
            </div>
            <p className="text-lg font-medium text-foreground">
              {locale === 'en' ? contacts.hours_en : contacts.hours_ua}
            </p>
          </div>
        </div>

        {/* Messengers & Socials */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <MessageSquareIcon className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">{t("messengersLabel")}</h3>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {contacts.telegram && (
                <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-fit px-6 py-3 bg-blue-50 text-brand rounded-full hover:bg-brand hover:text-white transition-all border border-blue-100 shadow-sm">
                  <Send className="w-5 h-5" />
                  <span className="font-medium">Telegram</span>
                </a>
              )}
              {contacts.viber && (
                <a href={contacts.viber} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-fit px-6 py-3 bg-purple-50 rounded-full hover:bg-purple-600 hover:text-white transition-all border border-purple-100 shadow-sm group">
                  <Image src="/icons/viber.svg" alt="Viber" width={20} height={20} className="group-hover:brightness-0 group-hover:invert transition-all" />
                  <span className="font-medium text-purple-600 group-hover:text-white transition-colors">Viber</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MessageSquareIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
