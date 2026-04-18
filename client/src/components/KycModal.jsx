import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { ShieldCheck, Upload, X, Loader2, CheckCircle2, Clock, AlertTriangle, FileImage } from "lucide-react";

function KycModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a valid ID document.");
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("idDocument", file);
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/auth/kyc`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSubmitted(true);
      // Update local user cache
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      u.idVerificationStatus = "pending";
      localStorage.setItem("user", JSON.stringify(u));
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center px-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-2xl animate-fade-in relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition"
        >
          <X size={20} />
        </button>

        {submitted ? (
          /* ── Success State ── */
          <div className="text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">
              ID Submitted!
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your document is now under review. You'll be able to rent items once an admin approves your ID — usually within 24 hours.
            </p>
            <button onClick={onClose} className="btn-primary w-full py-3">
              Got it!
            </button>
          </div>
        ) : (
          /* ── Upload Form ── */
          <>
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'hsl(var(--primary)/0.08)', border: '1px solid hsl(var(--primary)/0.2)' }}
              >
                <ShieldCheck size={22} style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  ID Verification Required
                </h3>
                <p className="text-slate-500 text-xs">
                  One-time verification to protect our community
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-800 leading-relaxed">
                Upload a government-issued ID (Aadhar Card, PAN Card, Passport, or Driver's License) to unlock renting on rentKaro.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* File Drop Zone */}
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium">
                  ID Document
                </label>
                <label
                  htmlFor="kyc-file"
                  className="flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all group"
                  style={{
                    borderColor: preview ? "hsl(var(--primary))" : "#cbd5e1", // slate-300
                    backgroundColor: preview ? "hsl(var(--primary)/0.04)" : "#f8fafc", // slate-50
                  }}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
                  ) : (
                    <div className="text-center">
                      <FileImage size={32} className="text-slate-400 mx-auto mb-2 group-hover:scale-110 transition cursor-pointer" />
                      <p className="text-sm text-slate-500 group-hover:text-slate-900 transition font-medium">
                        Click to upload
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPG, PNG, WEBP or PDF
                      </p>
                    </div>
                  )}
                  <input
                    id="kyc-file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <p className="text-xs mt-2 flex items-center gap-1.5 font-medium" style={{ color: 'hsl(var(--primary))' }}>
                    <CheckCircle2 size={12} /> {file.name}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/8 border border-red-500/20 px-4 py-3 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Uploading securely...</>
                ) : (
                  <><Upload size={16} /> Submit for Verification</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default KycModal;
