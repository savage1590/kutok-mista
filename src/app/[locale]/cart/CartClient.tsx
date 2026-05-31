"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { Link, useRouter } from "@/i18n/routing";
import { Trash2, Plus, Minus } from "lucide-react";
import { processOrder } from "./actions";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { NovaPoshtaCitySelect } from "@/components/checkout/NovaPoshtaCitySelect";
import { NovaPoshtaWarehouseSelect } from "@/components/checkout/NovaPoshtaWarehouseSelect";

export default function CartClient({ locale }: { locale: string }) {
  const t = useTranslations("Cart");
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  
  // Checkout form state
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [deliveryType, setDeliveryType] = useState<"branch" | "locker">("branch");
  const [city, setCity] = useState("");
  const [cityRef, setCityRef] = useState("");
  const [branch, setBranch] = useState("");
  const [comment, setComment] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [step1Error, setStep1Error] = useState("");
  const [step2Error, setStep2Error] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-12 text-center">{t('loading')}</div>;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src="/logo-icon.svg" alt="Kutok Mista Logo Watermark" className="w-64 md:w-96 h-auto" />
        </div>
        <h2 className="text-3xl font-bold mb-6 relative z-10">{t('empty')}</h2>
        <Link href="/products" className="bg-brand text-white px-10 py-4 rounded-full font-bold relative z-10 shadow-lg hover:bg-brand-light transition-colors text-lg">
          {t('goCatalog')}
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Step 1
    if (!lastName.trim() || !firstName.trim() || !email.trim() || !phone.trim()) {
      setStep1Error(locale === 'ua' ? "Будь ласка, заповніть всі обов'язкові поля" : "Please fill in all required fields");
      toast.error(locale === 'ua' ? "Будь ласка, заповніть всі обов'язкові поля" : "Please fill in all required fields");
      setActiveStep(1);
      return;
    }

    // Validate Step 2
    if (!city.trim() || !branch.trim()) {
      setStep2Error(locale === 'ua' ? "Будь ласка, заповніть всі обов'язкові поля в Доставці" : "Please fill in all required shipping fields");
      toast.error(locale === 'ua' ? "Будь ласка, заповніть всі обов'язкові поля в Доставці" : "Please fill in all required shipping fields");
      setActiveStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${lastName} ${firstName} ${middleName}`.trim();
      const fullAddress = `м. ${city}, відділення/поштомат: ${branch}`;

      const orderData = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        customerComment: comment,
        shippingAddress: fullAddress,
        paymentMethod: paymentMethod,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedProperties: item.selectedProperties
        }))
      };

      const result = await processOrder(orderData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 3. Clear cart
      clearCart();
      
      // 4. Handle LiqPay Redirect
      if (result.liqpayData) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.style.display = 'none';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = result.liqpayData.data;
        form.appendChild(dataInput);

        const signatureInput = document.createElement('input');
        signatureInput.type = 'hidden';
        signatureInput.name = 'signature';
        signatureInput.value = result.liqpayData.signature;
        form.appendChild(signatureInput);

        document.body.appendChild(form);
        form.submit();
        return; // wait for redirect
      }

      // 5. Normal redirect for cash_on_delivery or full_payment
      router.push(`/thank-you?order_num=${result.orderNumber}`);
      
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(error instanceof Error ? error.message : t('errorAlert'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Cart Items */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <h1 className="text-3xl font-bold border-b pb-4">{t('checkoutTitle')}</h1>
        {items.map((item) => {
          const productName = locale === "ua" ? item.product.name_ua : item.product.name_en;
          return (
            <div key={item.id} className="flex gap-4 border border-gray-100 p-4 rounded-2xl shadow-sm bg-white">
              <div className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.image_url && (
                  <img src={item.product.image_url} alt={productName} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-col flex-1 py-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{productName}</h3>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-3">
                  {item.selectedProperties && Object.entries(item.selectedProperties).map(([key, val]) => (
                    <span key={key} className="bg-gray-100 px-2 py-0.5 rounded-md text-xs">{val}</span>
                  ))}
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <div className="font-bold text-lg">{item.product.price} ₴</div>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="text-gray-600 hover:text-brand"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-600 hover:text-brand"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Form */}
      <div className="bg-gray-50 p-8 rounded-3xl h-fit sticky top-24">
        <h2 className="text-2xl font-bold mb-6">{t('subtotal')}</h2>
        
        <div className="flex justify-between items-center mb-6 text-lg">
          <span className="text-gray-600">{t('total')}:</span>
          <span className="font-bold text-2xl">{subtotal} ₴</span>
        </div>

        <form onSubmit={handleCheckout} className="flex flex-col gap-4">
          
          {/* Step 1: Контактні данні */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button 
              type="button" 
              onClick={() => setActiveStep(1)}
              className="w-full flex items-center justify-between p-4 font-bold text-left bg-gray-50/50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${activeStep >= 1 ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
                {t('step1Title')}
              </div>
            </button>
            {activeStep === 1 && (
              <div className="p-4 flex flex-col gap-3 border-t border-gray-100">
                <input required placeholder={`${t('lastName')} *`} value={lastName} onChange={e => {setLastName(e.target.value); setStep1Error("");}} className={`w-full px-4 py-3 rounded-xl border ${step1Error && !lastName.trim() ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-brand outline-none transition-colors`} />
                <input required placeholder={`${t('firstName')} *`} value={firstName} onChange={e => {setFirstName(e.target.value); setStep1Error("");}} className={`w-full px-4 py-3 rounded-xl border ${step1Error && !firstName.trim() ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-brand outline-none transition-colors`} />
                <input placeholder={t('middleName')} value={middleName} onChange={e => setMiddleName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none transition-colors" />
                <input type="email" required placeholder={`${t('email')} *`} value={email} onChange={e => {setEmail(e.target.value); setStep1Error("");}} className={`w-full px-4 py-3 rounded-xl border ${step1Error && !email.trim() ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-brand outline-none transition-colors`} />
                <input type="tel" required placeholder={`${t('phone')} *`} value={phone} onChange={e => {setPhone(e.target.value); setStep1Error("");}} className={`w-full px-4 py-3 rounded-xl border ${step1Error && !phone.trim() ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:border-brand outline-none transition-colors`} />
                
                {step1Error && <p className="text-red-500 text-sm font-medium mt-1">{step1Error}</p>}
                
                <button type="button" onClick={() => { 
                  if(lastName.trim() && firstName.trim() && email.trim() && phone.trim()) {
                    setStep1Error("");
                    setActiveStep(2);
                  } else {
                    setStep1Error(locale === 'ua' ? "Будь ласка, заповніть всі обов'язкові поля з зірочкою (*)" : "Please fill in all required fields with (*)");
                    toast.error(locale === 'ua' ? "Будь ласка, заповніть всі обов'язкові поля" : "Please fill in all required fields");
                  }
                }} className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold mt-2 transition-colors">
                  {t('next')}
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Доставка */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button 
              type="button" 
              onClick={() => {
                if (lastName.trim() && firstName.trim() && email.trim() && phone.trim()) {
                  setActiveStep(2);
                } else {
                  toast.error(locale === 'ua' ? "Спочатку заповніть Контактні дані" : "Please fill in Contact details first");
                  setActiveStep(1);
                }
              }}
              className="w-full flex items-center justify-between p-4 font-bold text-left bg-gray-50/50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${activeStep >= 2 ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                {t('step2Title')}
              </div>
            </button>
            {activeStep === 2 && (
              <div className="p-4 flex flex-col gap-4 border-t border-gray-100">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => { setDeliveryType("branch"); setBranch(""); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${deliveryType === "branch" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Відділення
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setDeliveryType("locker"); setBranch(""); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${deliveryType === "locker" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Поштомат
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <NovaPoshtaCitySelect 
                    value={city}
                    onChange={(cityName, newCityRef) => {
                      setCity(cityName);
                      setCityRef(newCityRef);
                      setBranch(""); // reset branch when city changes
                      setStep2Error("");
                    }}
                    placeholder={`${t('city')} *`}
                    hasError={!!step2Error && !city.trim()}
                  />

                  <NovaPoshtaWarehouseSelect 
                    cityRef={cityRef}
                    value={branch}
                    onChange={(warehouseName) => {
                      setBranch(warehouseName);
                      setStep2Error("");
                    }}
                    placeholder={`${t('branch')} *`}
                    hasError={!!step2Error && !branch.trim()}
                    isLockerOnly={deliveryType === "locker"}
                  />
                </div>

                <textarea placeholder={locale === "ua" ? "Коментар до замовлення (необов'язково)" : "Order comment (optional)"} value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none transition-colors resize-none" />
                
                {step2Error && <p className="text-red-500 text-sm font-medium mt-1">{step2Error}</p>}
                
                <button type="button" onClick={() => { 
                  if(city.trim() && branch.trim()) {
                    setStep2Error("");
                    setActiveStep(3);
                  } else {
                    setStep2Error(locale === 'ua' ? "Будь ласка, вкажіть місто та відділення з зірочкою (*)" : "Please fill in city and branch with (*)");
                    toast.error(locale === 'ua' ? "Будь ласка, вкажіть місто та відділення" : "Please fill in city and branch");
                  }
                }} className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold mt-2 transition-colors">
                  {t('next')}
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Оплата */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button 
              type="button" 
              onClick={() => {
                if (!lastName.trim() || !firstName.trim() || !email.trim() || !phone.trim()) {
                  toast.error(locale === 'ua' ? "Спочатку заповніть Контактні дані" : "Please fill in Contact details first");
                  setActiveStep(1);
                } else if (!city.trim() || !branch.trim()) {
                  toast.error(locale === 'ua' ? "Спочатку заповніть дані Доставки" : "Please fill in Shipping details first");
                  setActiveStep(2);
                } else {
                  setActiveStep(3);
                }
              }}
              className="w-full flex items-center justify-between p-4 font-bold text-left bg-gray-50/50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${activeStep >= 3 ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
                {t('step3Title')}
              </div>
            </button>
            {activeStep === 3 && (
              <div className="p-4 flex flex-col gap-3 border-t border-gray-100">
                
                {/* Hidden integrations for future use */}
                {/* 
                <label className="hidden items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="monopay" checked={paymentMethod === 'monopay'} onChange={e => setPaymentMethod(e.target.value)} className="accent-brand" />
                  <span>MonoPay</span>
                </label>
                */}
                
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="liqpay" checked={paymentMethod === 'liqpay'} onChange={e => setPaymentMethod(e.target.value)} className="accent-brand" />
                  <span className="font-semibold text-foreground">Онлайн-оплата (LiqPay)</span>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={e => setPaymentMethod(e.target.value)} className="accent-brand mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{t('cashOnDelivery')}</span>
                    <span className="text-xs text-gray-500 mt-1">{t('cashCommission')}</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="full_payment" checked={paymentMethod === 'full_payment'} onChange={e => setPaymentMethod(e.target.value)} className="accent-brand" />
                  <span className="font-semibold text-foreground">{t('fullPayment')}</span>
                </label>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="mt-4 w-full py-4 bg-brand text-white rounded-xl font-bold text-lg hover:bg-brand-light transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-brand/20"
                >
                  {isSubmitting ? t('processing') : t('placeOrder')}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
