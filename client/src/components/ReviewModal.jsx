import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { X, Star, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { StarRating } from "./ReviewSection";

export default function ReviewModal({ item, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // We need targetUserId and productId
  // In MyRentals, item (rental) has productId and owner (id or object)
  const productId = item.productId;
  const targetUserId = typeof item.owner === "object" ? item.owner._id : item.owner;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/reviews`,
        { targetUserId, productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      alert("Failed to post review: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Thank You!</h3>
            <p className="text-slate-500 text-sm">
              Your review helps the rentKaro community stay safe and trust-worthy.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-1 text-slate-900">Rate your experience</h3>
              <p className="text-sm text-slate-500">
                How was the <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>{item.productName}</span>?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Overall Rating
                </label>
                <div className="flex justify-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <StarRating rating={rating} setRating={setRating} interactive size={32} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Share more details
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all h-32 resize-none text-slate-900 placeholder:text-slate-400"
                  placeholder="How was the item condition? Was the owner helpful?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} />
                    Post Review
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
