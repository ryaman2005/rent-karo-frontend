import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../config";
import {
  Bell, X, CheckCircle, XCircle, Clock, Package,
  User, Calendar, IndianRupee, ChevronRight
} from "lucide-react";

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    pending:   { label: "Pending",   cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    confirmed: { label: "Confirmed", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected:  { label: "Rejected",  cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ── Single notification card ── */
function RequestCard({ req, onAction }) {
  const [loading, setLoading] = useState(null); // "confirmed" | "rejected"
  const token = localStorage.getItem("token");

  const handle = async (status) => {
    setLoading(status);
    try {
      await axios.patch(
        `${API_URL}/api/rentals/${req.rentalId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAction(req.rentalId, status);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="rounded-2xl p-4 border transition-all duration-300"
      style={{ background: "rgba(10,15,30,0.9)", border: "1px solid rgba(99,102,241,0.15)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--border))] flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-[hsl(var(--primary))]" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">{req.productName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <User size={11} className="text-[hsl(var(--muted-foreground))]" />
              <p className="text-[hsl(var(--muted-foreground))] text-xs">{req.renter?.name}</p>
            </div>
          </div>
        </div>
        <StatusBadge status="pending" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(15,23,42,0.8)" }}>
          <div className="flex justify-center mb-1"><IndianRupee size={12} className="text-[hsl(var(--primary))]" /></div>
          <p className="text-[hsl(var(--primary))] font-bold text-sm">₹{req.price}</p>
          <p className="text-[hsl(var(--muted-foreground))] text-[10px]">/ month</p>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(15,23,42,0.8)" }}>
          <div className="flex justify-center mb-1"><Calendar size={12} className="text-violet-400" /></div>
          <p className="text-violet-400 font-bold text-sm">{req.duration}mo</p>
          <p className="text-[hsl(var(--muted-foreground))] text-[10px]">duration</p>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(15,23,42,0.8)" }}>
          <div className="flex justify-center mb-1"><IndianRupee size={12} className="text-sky-400" /></div>
          <p className="text-sky-400 font-bold text-sm">₹{req.deposit}</p>
          <p className="text-[hsl(var(--muted-foreground))] text-[10px]">deposit</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handle("confirmed")}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
            color: "#fff",
          }}
        >
          <CheckCircle size={14} />
          {loading === "confirmed" ? "Confirming..." : "Confirm"}
        </button>
        <button
          onClick={() => handle("rejected")}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
        >
          <XCircle size={14} />
          {loading === "rejected" ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Main NotificationPanel ─────────────── */
function NotificationPanel({ requests, onAction, onClose }) {
  return (
    <div
      className="animate-slide-down absolute right-0 top-full mt-2 w-96 rounded-2xl z-50 flex flex-col overflow-hidden"
      style={{
        background: "rgba(6,10,20,0.97)",
        border: "1px solid rgba(99,102,241,0.2)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
        backdropFilter: "blur(20px)",
        maxHeight: "520px",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[hsl(var(--border))]/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-[hsl(var(--primary))]" />
          <span className="text-white font-bold text-sm">Rental Requests</span>
          {requests.length > 0 && (
            <span className="text-xs bg-[hsl(var(--primary))] text-white px-2 py-0.5 rounded-full font-semibold">
              {requests.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-white transition p-1 rounded-lg hover:bg-[hsl(var(--muted))]">
          <X size={15} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.8)" }}>
              <Bell size={20} className="text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm font-medium">No pending requests</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1">New rental requests will appear here.</p>
          </div>
        ) : (
          requests.map((req) => (
            <RequestCard key={req.rentalId} req={req} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
