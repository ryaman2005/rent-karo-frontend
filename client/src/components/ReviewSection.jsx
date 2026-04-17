import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Star, StarHalf, MessageSquare, User, Clock } from "lucide-react";

export function StarRating({ rating, setRating, interactive = false, size = 18 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform active:scale-90`}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <Star
            size={size}
            className={`${
              (hover || rating) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-[hsl(var(--muted-foreground))] opacity-30"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, targetUserId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/reviews/product/${productId}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/reviews`,
        { targetUserId, productId, rating: newRating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add new review to local state with current user info
      const user = JSON.parse(localStorage.getItem("user"));
      setReviews([{ ...res.data, reviewer: user }, ...reviews]);
      setShowForm(false);
      setComment("");
      setNewRating(5);
    } catch (err) {
      alert("Failed to post review. You might need to be logged in.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-16 border-t pt-10" style={{ borderColor: 'hsl(var(--border))' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare size={22} className="text-[hsl(var(--primary))]" /> 
            Reviews 
            <span className="text-[hsl(var(--muted-foreground))] font-medium text-lg">({reviews.length})</span>
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(avgRating)} size={16} />
              <span className="text-sm font-bold">{avgRating} / 5.0</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-secondary px-6 text-sm"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 bg-[hsl(var(--card))] p-6 rounded-2xl border border-[hsl(var(--border))] animate-fade-in">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[hsl(var(--muted-foreground))]">Rating</label>
            <StarRating rating={newRating} setRating={setNewRating} interactive size={24} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[hsl(var(--muted-foreground))]">Comment</label>
            <textarea
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all h-32"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {submitting ? "Posting..." : "Post Review"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-[hsl(var(--muted))/0.5] rounded-2xl border border-dashed border-[hsl(var(--border))]">
          <p className="text-[hsl(var(--muted-foreground))]">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((r, i) => (
            <div key={r._id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] overflow-hidden flex-shrink-0 border border-[hsl(var(--border))]">
                  {r.reviewer?.avatar ? (
                    <img src={r.reviewer.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--primary)/0.1)]">
                      <User size={20} className="text-[hsl(var(--primary))]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm">{r.reviewer?.name || "Unknown User"}</h4>
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-[10px]">
                      <Clock size={10} />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <StarRating rating={r.rating} size={14} />
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {r.comment}
                  </p>
                </div>
              </div>
              {i < reviews.length - 1 && <div className="h-px w-full mt-6" style={{ backgroundColor: 'hsl(var(--border))/0.5' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
