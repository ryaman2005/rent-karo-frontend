import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { ArrowLeft, Tag, IndianRupee, Shield, CheckCircle2, X, Loader2, Calendar, MapPin, User } from "lucide-react";
import KycModal from "../components/KycModal";
import ReviewSection from "../components/ReviewSection";

function SkeletonDetail() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-6 flex justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="max-w-4xl w-full">
        <div className="skeleton h-6 w-24 rounded mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="skeleton h-80 w-full rounded-2xl" />
          <div className="space-y-4 pt-4">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-6 w-1/3 rounded" />
            <div className="skeleton h-5 w-1/2 rounded" />
            <div className="skeleton h-5 w-1/4 rounded" />
            <div className="skeleton h-14 w-full rounded-xl mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ product, onConfirm, onCancel, loading }) {
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(getTodayString());
  
  // Set default end date to tomorrow
  const getTomorrowString = () => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split("T")[0];
  };
  const [endDate, setEndDate] = useState(getTomorrowString());

  const mPrice = parseInt(product.price || 0);
  const dep = parseInt(product.deposit || 0);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (s >= e) return 0;
    return Math.max(0, Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)));
  };

  const days = calculateDays(startDate, endDate);
  const totalRent = Math.round((mPrice / 30) * days);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl border p-8 max-w-md w-full shadow-xl animate-fade-in"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold">Confirm Rental</h3>
          <button onClick={onCancel} className="transition" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <X size={20} />
          </button>
        </div>

        <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
          You're about to rent <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{product.name}</span>.
        </p>

        {/* Duration Picker */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
              <Calendar size={14} className="text-[hsl(var(--primary))]" /> Start Date
            </label>
            <input
              type="date"
              min={getTodayString()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors border"
              style={{ backgroundColor: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
              End Date
            </label>
            <input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors border"
              style={{ backgroundColor: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
          </div>
        </div>

        <div className="bg-[hsl(var(--muted))] rounded-xl p-4 mb-6 space-y-3 border border-[hsl(var(--border))]/50">
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Est. Rent ({days} days)</span>
            <span className="font-semibold text-[hsl(var(--primary))]">₹{totalRent}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Security Deposit</span>
            <span className="font-semibold text-[hsl(var(--muted-foreground))]">₹{dep}</span>
          </div>
          <div className="border-t border-[hsl(var(--border))] pt-3 flex justify-between text-sm items-end">
            <div>
              <span className="block mb-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Total Due Today</span>
            </div>
            <span className="font-bold text-lg" style={{ color: 'hsl(var(--foreground))' }}>
              ₹{totalRent + dep}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 py-3"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(startDate, endDate)}
            disabled={loading || days === 0}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Processing...</>
            ) : (
              "Confirm Rent"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [renting, setRenting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showKycModal, setShowKycModal] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!product) return <SkeletonDetail />;

  const handleRent = async (startDate, endDate) => {
    setRenting(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/rentals`,
        { 
          productId: product._id,
          productName: product.name, 
          price: product.price, 
          deposit: product.deposit,
          startDate,
          endDate 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message === "KYC_REQUIRED") {
        setShowModal(false);
        setShowKycModal(true);
      } else {
        setErrorMsg(err?.response?.data?.message || "Failed to submit request.");
      }
    } finally {
      setRenting(false);
    }
  };

  return (
    <>
      {showKycModal && (
        <KycModal
          onClose={() => setShowKycModal(false)}
          onSuccess={() => setShowKycModal(false)}
        />
      )}

      {showModal && (
        <ConfirmModal
          product={product}
          onConfirm={handleRent}
          onCancel={() => setShowModal(false)}
          loading={renting}
        />
      )}

      <div className="min-h-screen pt-28 pb-16 px-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="max-w-4xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition mb-8 text-sm group"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Toast and Error Handling */}
          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-500 px-5 py-4 rounded-xl animate-fade-in">
              <X size={20} />
              <div>
                <p className="font-semibold">Request Failed</p>
                <p className="text-sm opacity-80">{errorMsg}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-4 rounded-xl animate-fade-in">
              <CheckCircle2 size={20} />
              <div>
                <p className="font-semibold">Rental Requested!</p>
                <p className="text-sm text-emerald-500/80">You can view it in My Rentals.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-10">

            {/* Image — Cinematic reveal */}
            <div className="rounded-2xl overflow-hidden h-80 md:h-auto cinematic-image-reveal">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between animate-fade-in">
              <div>
                {product.category && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] border border-[hsl(var(--border))] px-3 py-1 rounded-full mb-4">
                    <Tag size={11} />
                    {product.category}
                  </span>
                )}

                <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{product.name}</h1>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs mb-1">
                      <IndianRupee size={12} /> Monthly Rent
                    </div>
                    <p className="text-2xl font-bold text-[hsl(var(--primary))]">₹{product.price}</p>
                    <p className="text-[hsl(var(--muted-foreground))] text-xs">per month</p>
                  </div>
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs mb-1">
                      <Shield size={12} /> Security Deposit
                    </div>
                    <p className="text-2xl font-bold">₹{product.deposit}</p>
                    <p className="text-[hsl(var(--muted-foreground))] text-xs">refundable</p>
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  {["Flexible monthly billing", "Cancel anytime", "Deposit fully refundable"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* Owner Card */}
                {product.owner && (
                  <div className="bg-[hsl(var(--card))]/50 border border-[hsl(var(--border))] rounded-2xl p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center overflow-hidden border border-[hsl(var(--border))]">
                        {product.owner.avatar ? (
                          <img src={product.owner.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-[hsl(var(--muted-foreground))]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>Owner: {product.owner.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>Trusted Lender</p>
                      </div>
                    </div>
                    {product.address && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 uppercase tracking-wider font-semibold">Location</span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <MapPin size={12} />
                          {product.address}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="btn-primary w-full py-4 text-lg"
              >
                Rent Now
              </button>
            </div>
          </div>

          {/* Review Section */}
          <ReviewSection productId={product._id} targetUserId={product.owner?._id} />
        </div>
      </div>
    </>
  );
}

export default ProductDetails;