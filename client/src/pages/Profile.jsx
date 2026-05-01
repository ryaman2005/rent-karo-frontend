import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import {
  User, Shield, Activity, LogOut, Edit2, Save, X,
  CheckCircle2, Clock, AlertTriangle, Upload, FileImage,
  Package, ShoppingBag, MessageSquare, Award, ChevronRight,
  MapPin, Phone, Mail, Loader2
} from "lucide-react";

const TABS = [
  { id: "general", label: "General Info", icon: User },
  { id: "security", label: "Security & KYC", icon: Shield },
  { id: "activity", label: "My Activity", icon: Activity },
];

function TrustBar({ score }) {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">Trust Score</span>
        <span className="text-sm font-black" style={{ color }}>{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function KycBadge({ status }) {
  const map = {
    approved: { label: "Verified", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2 },
    pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Clock },
    rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)",  icon: AlertTriangle },
    unverified:{ label:"Unverified",color:"#94a3b8", bg:"rgba(148,163,184,0.1)", icon: AlertTriangle },
  };
  const m = map[status] || map.unverified;
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: m.color, backgroundColor: m.bg }}>
      <Icon size={11} /> {m.label}
    </span>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]     = useState(() => { try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; } });
  const [tab, setTab]       = useState("general");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [form, setForm]     = useState({ name: user?.name || "", phone: user?.phone || "", bio: user?.bio || "", street: user?.street || "", city: user?.city || "", state: user?.state || "", pin: user?.pin || "" });
  const [counts, setCounts] = useState({ listings: 0, rentals: 0 });

  // KYC state
  const [kycFile, setKycFile]       = useState(null);
  const [kycPreview, setKycPreview] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError]     = useState("");
  const [kycSuccess, setKycSuccess] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const token = localStorage.getItem("token");
    // fetch listing count
    axios.get(`${API_URL}/api/products/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCounts(c => ({ ...c, listings: r.data.length }))).catch(() => {});
    // fetch rental count
    axios.get(`${API_URL}/api/rentals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCounts(c => ({ ...c, rentals: r.data.length }))).catch(() => {});
  }, []);

  if (!user) return null;

  const trustScore = (() => {
    let s = 20;
    if (user.idVerificationStatus === "approved") s += 50;
    else if (user.idVerificationStatus === "pending") s += 20;
    if (user.email) s += 20;
    if (user.phone) s += 10;
    return Math.min(s, 100);
  })();

  const handleSave = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(`${API_URL}/api/auth/profile`, form, { headers: { Authorization: `Bearer ${token}` } });
      const updated = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setEditing(false);
      setSaveMsg("Profile updated!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      setSaveMsg(e?.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  const handleKycFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setKycFile(f); setKycPreview(URL.createObjectURL(f)); setKycError("");
  };

  const handleKycSubmit = async () => {
    if (!kycFile) { setKycError("Please select a document."); return; }
    setKycLoading(true); setKycError("");
    try {
      const fd = new FormData(); fd.append("idDocument", kycFile);
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/auth/kyc`, fd, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      const updated = { ...user, idVerificationStatus: "pending" };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated); setKycSuccess(true);
    } catch (e) { setKycError(e?.response?.data?.message || "Upload failed."); }
    finally { setKycLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "U";

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8" style={{ backgroundColor: "hsl(var(--secondary))" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Sidebar ── */}
          <aside className="w-full md:w-72 flex-shrink-0 space-y-4">

            {/* Profile Card */}
            <div className="rounded-2xl border p-6 text-center" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <div className="relative inline-block">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-2 mx-auto" style={{ borderColor: "hsl(var(--border))" }} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto font-black text-2xl text-white shadow-md" style={{ backgroundColor: "hsl(var(--primary))" }}>
                    {initials}
                  </div>
                )}
              </div>
              <h2 className="mt-3 font-bold text-lg" style={{ color: "hsl(var(--foreground))" }}>{user.name}</h2>
              <p className="text-xs mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{user.email}</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: "hsl(var(--primary)/0.1)", color: "hsl(var(--primary))" }}>{user.role}</span>
                <KycBadge status={user.idVerificationStatus || "unverified"} />
              </div>
              <TrustBar score={trustScore} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "LISTINGS", value: counts.listings }, { label: "RENTALS", value: counts.rentals }].map(s => (
                <div key={s.label} className="rounded-2xl border p-4 text-center" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                  <p className="text-2xl font-black" style={{ color: "hsl(var(--foreground))" }}>{s.value}</p>
                  <p className="text-[10px] font-semibold tracking-widest mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Nav Tabs */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              {TABS.map(t => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-left transition-all"
                    style={{
                      backgroundColor: active ? "hsl(var(--primary))" : "transparent",
                      color: active ? "#fff" : "hsl(var(--foreground))",
                      borderBottom: "1px solid hsl(var(--border))",
                    }}
                  >
                    <Icon size={16} /> {t.label}
                  </button>
                );
              })}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-left transition-all hover:bg-red-50" style={{ color: "hsl(var(--primary))" }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">

            {/* ── General Info ── */}
            {tab === "general" && (
              <div className="rounded-2xl border p-6 md:p-8" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Personal Profile</h2>
                    <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Your public identity on Rent Karo.</p>
                  </div>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-all hover:bg-[hsl(var(--muted))]" style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                      <Edit2 size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(false); setSaveMsg(""); }} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border" style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                        <X size={14} />
                      </button>
                      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2 text-white">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                      </button>
                    </div>
                  )}
                </div>

                {saveMsg && <p className="text-sm mb-4 px-3 py-2 rounded-xl" style={{ backgroundColor: "hsl(var(--primary)/0.08)", color: "hsl(var(--primary))" }}>{saveMsg}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "FULL NAME", key: "name", icon: User },
                    { label: "PHONE NUMBER", key: "phone", icon: Phone },
                  ].map(({ label, key, icon: Icon }) => (
                    <div key={key}>
                      <label className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</label>
                      {editing ? (
                        <input className="input-field" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={label.toLowerCase()} />
                      ) : (
                        <p className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "hsl(var(--secondary))", color: form[key] ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
                          {form[key] || <span className="opacity-50">—</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="text-[10px] font-semibold tracking-widest block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>BIO / ABOUT ME</label>
                  {editing ? (
                    <textarea rows={3} className="input-field resize-none" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell potential renters/owners about yourself..." />
                  ) : (
                    <p className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "hsl(var(--secondary))", color: form.bio ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
                      {form.bio || <span className="opacity-50">Tell potential renters/owners about yourself...</span>}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <p className="flex items-center gap-1.5 text-sm font-semibold mb-3" style={{ color: "hsl(var(--foreground))" }}>
                    <MapPin size={14} style={{ color: "hsl(var(--primary))" }} /> Permanent Address
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Street / Colony", key: "street" },
                      { label: "City", key: "city" },
                      { label: "State", key: "state" },
                      { label: "PIN Code", key: "pin" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        {editing ? (
                          <input className="input-field" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={label} />
                        ) : (
                          <p className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "hsl(var(--secondary))", color: form[key] ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
                            {form[key] || <span className="opacity-50">{label}</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                  <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>PREFERRED CONTACT</p>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: "hsl(var(--secondary))" }}>
                    <Mail size={14} style={{ color: "hsl(var(--primary))" }} />
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{user.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security & KYC ── */}
            {tab === "security" && (
              <div className="rounded-2xl border p-6 md:p-8" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                <h2 className="text-xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>Security & Verification</h2>
                <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Verified users get higher trust scores and can rent items without restrictions.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>Email Verified</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Your email address is confirmed.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: user.idVerificationStatus === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)" }}>
                      <Shield size={20} className={user.idVerificationStatus === "approved" ? "text-emerald-500" : "text-amber-500"} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>Government ID</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Status: <span className="capitalize font-medium">{user.idVerificationStatus || "Unverified"}</span></p>
                    </div>
                  </div>
                </div>

                {user.idVerificationStatus === "approved" ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: "hsl(var(--foreground))" }}>Identity Verified</h3>
                    <p className="text-sm text-center" style={{ color: "hsl(var(--muted-foreground))" }}>Your government ID has been approved. You can rent items freely.</p>
                  </div>
                ) : user.idVerificationStatus === "pending" || kycSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(245,158,11,0.1)" }}>
                      <Clock size={32} className="text-amber-500" />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: "hsl(var(--foreground))" }}>Under Review</h3>
                    <p className="text-sm text-center" style={{ color: "hsl(var(--muted-foreground))" }}>Your document is being reviewed by our team. Usually within 24 hours.</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-2xl p-6 text-center" style={{ borderColor: "hsl(var(--primary)/0.3)", backgroundColor: "hsl(var(--primary)/0.02)" }}>
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary)/0.08)" }}>
                      <Shield size={28} style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <h3 className="font-bold text-base mb-1" style={{ color: "hsl(var(--foreground))" }}>Government ID Verification</h3>
                    <p className="text-xs mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>Upload Aadhar Card, PAN Card, or Passport. Min size 50KB. Stored securely on Cloudinary.</p>

                    <label htmlFor="kyc-upload" className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all" style={{ borderColor: kycFile ? "hsl(var(--primary))" : "hsl(var(--border))", backgroundColor: kycFile ? "hsl(var(--primary)/0.04)" : "hsl(var(--secondary))" }}>
                      {kycPreview ? (
                        <img src={kycPreview} className="h-full w-full object-contain rounded-lg p-2" alt="preview" />
                      ) : (
                        <div className="text-center">
                          <Upload size={24} className="mx-auto mb-2" style={{ color: "hsl(var(--muted-foreground))" }} />
                          <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>Click to select document</p>
                          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>JPG, PNG or PDF</p>
                        </div>
                      )}
                      <input id="kyc-upload" type="file" accept="image/*,.pdf" onChange={handleKycFile} className="hidden" />
                    </label>

                    {kycError && <p className="text-xs text-red-500 mt-2">{kycError}</p>}

                    <button onClick={handleKycSubmit} disabled={kycLoading || !kycFile} className="btn-primary mt-4 w-full py-3 flex items-center justify-center gap-2 text-sm text-white disabled:opacity-50">
                      {kycLoading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Upload size={15} /> Submit for Verification</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── My Activity ── */}
            {tab === "activity" && (
              <div className="rounded-2xl border p-6 md:p-8" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                <h2 className="text-xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>My Activity</h2>
                <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Quick access to your rentals and listings.</p>

                <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
                  {[
                    { icon: Package,      label: "My Listings",   sub: `${counts.listings} items listed`,  path: "/my-listings", color: "#6366f1" },
                    { icon: ShoppingBag,  label: "My Rentals",    sub: `${counts.rentals} active rentals`,  path: "/my-rentals",  color: "#10b981" },
                    { icon: MessageSquare,label: "Inbox & Chats", sub: "Message owners or renters",         path: "/inbox",       color: "#f59e0b" },
                    { icon: Award,        label: "Trust Badges",  sub: "Earn badges for reliable behaviour.", path: null, color: "#a855f7", comingSoon: true },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => item.path && navigate(item.path)}
                        disabled={!item.path}
                        className="w-full flex items-center gap-4 py-5 text-left transition-all hover:bg-[hsl(var(--secondary))] px-3 rounded-xl disabled:cursor-default group"
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}18` }}>
                          <Icon size={20} style={{ color: item.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>{item.label}</p>
                          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{item.sub}</p>
                        </div>
                        {item.comingSoon ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "hsl(var(--primary)/0.1)", color: "hsl(var(--primary))" }}>COMING SOON</span>
                        ) : (
                          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" style={{ color: "hsl(var(--muted-foreground))" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}