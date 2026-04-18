import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import {
  ShieldCheck, ShieldX, User, Mail, Phone, Calendar,
  CheckCircle2, XCircle, Loader2, Clock, Eye, Package,
  AlertTriangle, Sparkles, MessageSquare
} from "lucide-react";
import ChatModal from "../components/ChatModal";
import { getSocket } from "../services/socketService";

/* ── Status badge ──────────────────────────────────────────── */
function StatusBadge({ status }) {
  const styles = {
    unverified: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    pending:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected:   "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const icons = {
    unverified: <AlertTriangle size={11} />,
    pending:    <Clock size={11} />,
    approved:   <CheckCircle2 size={11} />,
    rejected:   <XCircle size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[status] || styles.unverified}`}>
      {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ── KYC Review Card ───────────────────────────────────────── */
function KycCard({ user, onAction, onMessage }) {
  const [loading, setLoading] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return "";
    // Cloudinary can serve a PDF's first page as an image by changing the extension
    return url.replace(/\.pdf$/i, ".jpg");
  };

  const handle = async (status) => {
    setLoading(status);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/api/auth/kyc/${user._id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAction(user._id, status);
    } catch (err) {
      console.error("KYC action failed:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Image Lightbox */}
      {previewOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 cursor-pointer animate-fade-in"
          onClick={() => setPreviewOpen(false)}
        >
          <img
            src={getImageUrl(user.idDocumentUrl)}
            alt="ID Document preview"
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl border border-white/10"
          />
          {user.idDocumentUrl?.toLowerCase().endsWith('.pdf') && (
            <a 
              href={user.idDocumentUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-10 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors backdrop-blur-md border border-white/20"
            >
              Open Original PDF
            </a>
          )}
        </div>
      )}

      <div
        className="rounded-2xl border p-6 flex flex-col gap-4 animate-fade-in transition-all"
        style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm border"
              style={{ backgroundColor: "hsl(var(--primary))", borderColor: "hsl(var(--border))" }}
            >
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>{user.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                Submitted {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <StatusBadge status={user.idVerificationStatus} />
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            <Mail size={13} />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              <Phone size={13} />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        {/* ID Document Preview */}
        {user.idDocumentUrl && (
          <div
            className="relative rounded-xl overflow-hidden border cursor-pointer group"
            style={{ borderColor: "hsl(var(--border))", height: "140px" }}
            onClick={() => setPreviewOpen(true)}
          >
            <img
              src={getImageUrl(user.idDocumentUrl)}
              alt="ID Document"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                <Eye size={14} /> View Full Size
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 mt-1">
          <button
            onClick={() => handle("approved")}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 text-white"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            {loading === "approved" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {loading === "approved" ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => handle("rejected")}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
          >
            {loading === "rejected" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            {loading === "rejected" ? "Rejecting..." : "Reject"}
          </button>
          
          <button
            onClick={() => onMessage(user)}
            className="w-11 h-11 flex items-center justify-center rounded-xl border transition-all hover:bg-[hsl(var(--primary)/0.1)] active:scale-95"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--primary))" }}
            title="Message User"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main Admin Dashboard ──────────────────────────────────── */
function Admin() {
  const [pendingKyc, setPendingKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("kyc"); 
  const [chatUser, setChatUser] = useState(null);

  const fetchKyc = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/auth/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingKyc(res.data);
    } catch (err) {
      console.error("Failed to load KYC queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();

    const socket = getSocket();
    const handleNewKyc = () => {
      fetchKyc(); // Refresh list when new docs arrive
    };
    
    socket.on("new_kyc_submission", handleNewKyc);
    return () => socket.off("new_kyc_submission", handleNewKyc);
  }, []);

  const handleAction = (userId, newStatus) => {
    setPendingKyc(prev => prev.filter(u => u._id !== userId));
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-6" style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border"
            style={{ backgroundColor: "hsl(var(--primary)/0.1)", borderColor: "hsl(var(--border))" }}
          >
            <Sparkles size={22} className="text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
            <p style={{ color: "hsl(var(--muted-foreground))" }} className="text-sm mt-0.5">
              Manage KYC requests and platform listings
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <button
            onClick={() => setTab("kyc")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === "kyc"
                ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <ShieldCheck size={15} />
            KYC Requests
            {pendingKyc.length > 0 && (
              <span className="bg-[hsl(var(--primary))] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingKyc.length}
              </span>
            )}
          </button>
        </div>

        {/* KYC Tab */}
        {tab === "kyc" && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-[hsl(var(--primary))]" />
              </div>
            ) : pendingKyc.length === 0 ? (
              <div className="text-center py-24 animate-fade-in rounded-2xl border" style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}>
                <ShieldCheck size={64} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All clear!</h3>
                <p style={{ color: "hsl(var(--muted-foreground))" }} className="text-sm">
                  No pending KYC reviews at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingKyc.map(user => (
                  <KycCard 
                    key={user._id} 
                    user={user} 
                    onAction={handleAction} 
                    onMessage={(u) => setChatUser(u)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {chatUser && (
          <ChatModal targetUser={chatUser} onClose={() => setChatUser(null)} />
        )}
      </div>
    </div>
  );
}

export default Admin;