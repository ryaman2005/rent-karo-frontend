import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2, Loader2, Sparkles, Zap, Lock, Users2, ShoppingBag, Store, Home as HomeIcon } from "lucide-react";

/* ── Google Sign-In Button (uses Google Identity Services) ── */
function GoogleButton({ onSuccess, onError, label = "Continue with Google" }) {
  const handleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "your-google-client-id-here.apps.googleusercontent.com") {
      onError("Google Client ID is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.");
      return;
    }
    const gis = window.google?.accounts?.oauth2;
    if (!gis) {
      onError("Google sign-in library failed to load. Please refresh the page.");
      return;
    }
    const client = gis.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: onSuccess,
      error_callback: () => onError("Google sign-in was cancelled or failed."),
    });
    client.requestAccessToken();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
      style={{
        background: "rgba(15,23,50,0.7)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      }}
    >
      {/* Google Icon */}
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      {label}
    </button>
  );
}

/* ── Role Card ── */
function RoleCard({ role, icon, title, desc, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex-1 rounded-2xl p-5 text-left transition-all duration-300 active:scale-95"
      style={{
        background: active
          ? "linear-gradient(135deg, rgba(79,70,229,0.18), rgba(124,58,237,0.12))"
          : "rgba(10,15,30,0.6)",
        border: active
          ? "1.5px solid rgba(99,102,241,0.55)"
          : "1.5px solid rgba(30,41,59,0.9)",
        boxShadow: active
          ? "0 0 20px rgba(99,102,241,0.15), inset 0 0 20px rgba(99,102,241,0.04)"
          : "none",
      }}
    >
      {active && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
          <CheckCircle2 size={12} className="text-white" />
        </span>
      )}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: active ? "rgba(99,102,241,0.15)" : "rgba(15,23,42,0.8)",
          border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(30,41,59,0.8)",
        }}
      >
        {icon}
      </div>
      <p className={`font-bold text-sm mb-1 ${active ? "text-indigo-300" : "text-slate-300"}`}>{title}</p>
      <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>

    </button>
  );
}

/* ── Toast ── */
function Toast({ message, type }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm toast-enter ${
      isError
        ? "bg-red-500/10 border border-red-500/25 text-red-400"
        : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
    }`}>
      {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
      {message}
    </div>
  );
}

/* ─────────────── Main Component ─────────────── */
function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [role, setRole] = useState("renter");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const showToast = (msg, type = "error") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: "", type: "error" }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveAndRedirect = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    showToast(mode === "login" ? "Welcome back! Redirecting..." : "Account created! Redirecting...", "success");
    setTimeout(() => navigate("/"), 1100);
  };

  /* ── Email/Password submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: "", type: "error" });

    try {
      if (mode === "signup") {
        if (form.password !== form.confirmPassword) {
          showToast("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          showToast("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        const res = await api.post("/api/auth/register", {
          name: form.name, email: form.email, password: form.password, role,
        });
        saveAndRedirect(res.data);
      } else {
        const res = await api.post("/api/auth/login", {
          email: form.email, password: form.password,
        });
        saveAndRedirect(res.data);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Google OAuth callback ── */
  const handleGoogleSuccess = async (response) => {
    if (!response?.access_token) {
      showToast("Google sign-in was cancelled.");
      return;
    }
    setLoading(true);
    try {
      // Fetch user info with the access token
      const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${response.access_token}` },
      });
      if (!infoRes.ok) throw new Error("Failed to fetch Google user info");
      const info = await infoRes.json();

      const res = await api.post("/api/auth/google", {
        googleId: info.sub,
        name: info.name,
        email: info.email,
        avatar: info.picture,
        role: mode === "signup" ? role : undefined,
      });
      saveAndRedirect(res.data);
    } catch (err) {
      showToast("Google sign-in failed. Please try again.");
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setToast({ message: "", type: "error" });
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen flex text-white" style={{ background: "#020917" }}>

      {/* ── Left Branding Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-14 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0a0f1e, #080d1a)",
          borderRight: "1px solid rgba(99,102,241,0.1)",
        }}
      >
        {/* Orbs */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/8 blur-[80px] animate-orb1 pointer-events-none" />
        <div className="absolute top-10 right-0 w-60 h-60 rounded-full bg-purple-600/8 blur-[60px] animate-orb2 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold gradient-text">rentKaro</span>
        </div>

        {/* Tagline */}
        <div className="animate-float">
          <h2 className="text-5xl font-black mb-5 leading-tight">
            The smarter<br />way to{" "}
            <span className="text-shimmer">rent.</span>
          </h2>
          <p className="text-slate-400 leading-relaxed max-w-xs">
            Join thousands of renters and owners who live smarter with rentKaro.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-4">
            {[ 
            { icon: <Zap size={16} className="text-indigo-400" />, text: "Instant booking, no paperwork" },
            { icon: <Lock size={16} className="text-indigo-400" />, text: "100% refundable deposits" },
            { icon: <Users2 size={16} className="text-indigo-400" />, text: "Verified renters and owners" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                {f.icon}
              </div>
              <span className="text-slate-400 text-sm">{f.text}</span>
            </div>
          ))}
          </div>
        </div>

        <p className="text-slate-700 text-xs">© 2026 rentKaro. All rights reserved.</p>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold gradient-text">rentKaro</span>
          </div>

          {/* Mode Toggle */}
          <div
            className="flex rounded-2xl p-1 mb-8"
            style={{ background: "rgba(10,15,30,0.8)", border: "1px solid rgba(30,41,59,0.8)" }}
          >
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                style={
                  mode === m
                    ? {
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                        color: "#fff",
                      }
                    : { color: "#64748b" }
                }
              >
                {m === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-3xl font-black mb-1">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === "login"
                ? "Sign in to access your rentals and listings."
                : "Join rentKaro — choose how you want to participate."}
            </p>
          </div>

          {/* ── Role Picker (signup only) ── */}
          {mode === "signup" && (
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-3 font-medium">I want to...</p>
              <div className="flex gap-3">
                <RoleCard
                  role="renter"
                  icon={<ShoppingBag size={26} className="text-indigo-400" />}
                  title="Rent items"
                  desc="Browse and rent items from owners near you."
                  active={role === "renter"}
                  onClick={() => setRole("renter")}
                />
                <RoleCard
                  role="owner"
                  icon={<Store size={26} className="text-violet-400" />}
                  title="List items"
                  desc="Earn money by listing your unused items for rent."
                  active={role === "owner"}
                  onClick={() => setRole("owner")}
                />
              </div>
            </div>
          )}

          {/* ── Google Sign In ── */}
          <GoogleButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => showToast(msg)}
            label={mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          />

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Aryaman Bohra"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type={showPw ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            )}

            <Toast message={toast.message} type={toast.type} />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
              ) : mode === "login" ? (
                <><LogIn size={16} /> Sign In</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-slate-500 text-sm mt-6">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                  Sign Up
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;