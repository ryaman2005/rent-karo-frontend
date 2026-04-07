import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { ArrowLeft, Tag, IndianRupee, Shield, CheckCircle2, X, Loader2, Calendar, MapPin, User } from "lucide-react";

function SkeletonDetail() {
  return (
    <div className="min-h-screen text-white pt-28 pb-16 px-6 flex justify-center" style={{ background: "#020917" }}>
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
  const [duration, setDuration] = useState(1);
  const mPrice = parseInt(product.price || 0);
  const dep = parseInt(product.deposit || 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4 animate-fade-in">
      <div
        className="border border-slate-700/80 rounded-2xl p-8 max-w-md w-full shadow-2xl cinematic-fade-up"
        style={{ background: "linear-gradient(160deg, #0d1526, #080e1a)", boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)" }}
      >
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-xl font-bold">Confirm Rental</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 mb-6">
          You're about to rent <span className="text-white font-semibold">{product.name}</span>.
        </p>

        {/* Duration Picker */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Calendar size={14} className="text-indigo-400" /> Rental Duration
          </label>
          <div className="relative">
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Month{i > 0 ? "s" : ""}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <span className="text-xs">▼</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-4 mb-6 space-y-3 border border-slate-700/50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Monthly Rent</span>
            <span className="font-semibold text-indigo-400">₹{mPrice}/mo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Security Deposit</span>
            <span className="font-semibold text-slate-300">₹{dep}</span>
          </div>
          <div className="border-t border-slate-700 pt-3 flex justify-between text-sm items-end">
            <div>
              <span className="text-gray-400 block mb-0.5">Total Due Today</span>
              <span className="text-[10px] text-slate-500">(Rent × {duration}) + Deposit</span>
            </div>
            <span className="font-bold text-white text-lg">
              ₹{(mPrice * duration) + dep}
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
            onClick={() => onConfirm(duration)}
            disabled={loading}
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

  useEffect(() => {
    axios
      .get(`${API_URL}/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!product) return <SkeletonDetail />;

  const handleRent = async (duration) => {
    setRenting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/rentals`,
        { 
          productId: product._id,
          productName: product.name, 
          price: product.price, 
          deposit: product.deposit,
          duration 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.log(err);
    } finally {
      setRenting(false);
    }
  };

  return (
    <>
      {showModal && (
        <ConfirmModal
          product={product}
          onConfirm={handleRent}
          onCancel={() => setShowModal(false)}
          loading={renting}
        />
      )}

      <div className="min-h-screen text-white pt-28 pb-16 px-6" style={{ background: "#020917" }}>
        <div className="max-w-4xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Success Toast */}
          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-4 rounded-xl animate-fade-in">
              <CheckCircle2 size={20} />
              <div>
                <p className="font-semibold">Rental Confirmed!</p>
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
            <div className="flex flex-col justify-between cinematic-fade-up">
              <div>
                {product.category && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full mb-4">
                    <Tag size={11} />
                    {product.category}
                  </span>
                )}

                <h1 className="text-4xl font-extrabold mb-4">{product.name}</h1>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <IndianRupee size={12} /> Monthly Rent
                    </div>
                    <p className="text-2xl font-bold text-indigo-400">₹{product.price}</p>
                    <p className="text-gray-600 text-xs">per month</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Shield size={12} /> Security Deposit
                    </div>
                    <p className="text-2xl font-bold">₹{product.deposit}</p>
                    <p className="text-gray-600 text-xs">refundable</p>
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  {["Flexible monthly billing", "Cancel anytime", "Deposit fully refundable"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* Owner Card */}
                {product.owner && (
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                        {product.owner.avatar ? (
                          <img src={product.owner.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Owner: {product.owner.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Trusted Lender</p>
                      </div>
                    </div>
                    {product.address && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Location</span>
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
        </div>
      </div>
    </>
  );
}

export default ProductDetails;