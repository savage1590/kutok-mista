"use client";

import { useState } from "react";
import { Star, MessageCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ReviewsClient({ productId, initialReviews, locale }: { productId: string, initialReviews: any[], locale: string }) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  
  const isUa = locale === "ua";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          authorName: name,
          text,
          rating
        })
      });

      if (!res.ok) throw new Error("Failed");
      
      toast.success(isUa ? "Відгук відправлено на модерацію!" : "Review submitted for moderation!");
      setIsOpen(false);
      setName("");
      setText("");
      setRating(5);
    } catch (error) {
      toast.error(isUa ? "Помилка відправки" : "Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {isUa ? "Немає відгуків" : "No reviews yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {isUa ? "Станьте першим, хто залишить відгук про цей товар!" : "Be the first to review this product!"}
          </p>
          <button 
            onClick={() => setIsOpen(true)}
            className="px-6 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl font-medium hover:border-brand hover:text-brand transition-colors"
          >
            {isUa ? "Написати відгук" : "Write a review"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r, idx) => (
            <div key={idx} className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900">{r.author_name}</h4>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString(isUa ? 'uk-UA' : 'en-US')}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                {r.text}
              </p>
            </div>
          ))}
          
          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
             <button 
                onClick={() => setIsOpen(true)}
                className="px-8 py-3 bg-brand text-white shadow-sm rounded-xl font-bold hover:bg-brand-light transition-colors"
              >
                {isUa ? "Написати відгук" : "Write a review"}
              </button>
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 md:p-8 max-w-2xl mx-auto mt-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">
            {isUa ? "Новий відгук" : "New Review"}
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isUa ? "Рейтинг" : "Rating"}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isUa ? "Ваше ім'я" : "Your name"}
              </label>
              <input 
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                placeholder={isUa ? "Наприклад: Олександр" : "e.g. Alex"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isUa ? "Ваш відгук" : "Your review"}
              </label>
              <textarea 
                required
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors min-h-[120px] resize-y"
                placeholder={isUa ? "Розкажіть про свої враження..." : "Share your thoughts..."}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {isUa ? "Скасувати" : "Cancel"}
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-light transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isUa ? "Відправити" : "Submit"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
