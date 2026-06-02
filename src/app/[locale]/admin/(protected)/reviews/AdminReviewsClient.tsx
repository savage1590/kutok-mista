"use client";

import { useState } from "react";
import { Save, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
import { saveReviews } from "../../settings-actions";

export default function AdminReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleDelete = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: currentStatus === 'approved' ? 'pending' : 'approved' } : r));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    const result = await saveReviews(reviews);
    setMessage(result.error
      ? { type: "error", text: `Помилка: ${result.error}` }
      : { type: "success", text: "Зміни збережено!" }
    );
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-gray-500">
          Всього відгуків: {reviews.length} (На модерації: {reviews.filter(r => r.status === 'pending').length})
        </div>

        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-light transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Збереження..." : "Зберегти зміни"}
          </button>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Немає відгуків.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={`p-5 rounded-xl border ${review.status === 'pending' ? 'bg-yellow-50/50 border-yellow-200' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{review.author_name}</h4>
                    <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('uk-UA')}</span>
                    {review.status === 'pending' && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded font-medium">Новий (на модерації)</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm">{review.text}</p>
                  <p className="text-xs text-gray-400 mt-2 font-mono">ID Товару: {review.product_id}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleStatusToggle(review.id, review.status)}
                    className={`p-2 rounded-lg transition-colors ${review.status === 'approved' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                    title={review.status === 'approved' ? 'Сховати' : 'Опублікувати'}
                  >
                    {review.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(review.id)}
                    className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Видалити"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
