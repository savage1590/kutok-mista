import { useTranslations } from "next-intl";
import { Truck, Palette, Scissors, ShieldCheck } from "lucide-react";

export default function HomeAdvantages() {
  const t = useTranslations("Home");

  const advantages = [
    {
      icon: <Truck className="w-8 h-8 text-brand" />,
      textKey: "adv1"
    },
    {
      icon: <Palette className="w-8 h-8 text-brand" />,
      textKey: "adv2"
    },
    {
      icon: <Scissors className="w-8 h-8 text-brand" />,
      textKey: "adv3"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand" />,
      textKey: "adv4"
    }
  ];

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto">
          {advantages.map((adv, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-brand/10 group-hover:scale-110 transition-all duration-300">
                {adv.icon}
              </div>
              <p className="font-semibold text-gray-800 text-sm md:text-base leading-snug">
                {t(adv.textKey as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
