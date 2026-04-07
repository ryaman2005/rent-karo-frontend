import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2, Loader2, Zap, Lock, Users2 } from "lucide-react";

function GoogleButton({ onSuccess, onError, label = "Continue with Google" }) {
  const handleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "your-google-client-id-here.apps.googleusercontent.com") {
      onError("Google Client ID is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.");
      return;
    }
    const gis = window.google?.accounts?.oauth2;
    if (!gis) {
      onError("Google sign-in library failed to load. Refresh and try again.");
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
      className="btn btn-outline w-full rounded-3xl border-slate-700 text-slate-100 hover:border-slate-500"
    >
      <div className="inline-flex items-center justify-center gap-3">
        <svg width="18" height="18" viewBox="0 0 48 48" className="inline-block">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
        <span>{label}</span>
      </div>
    </button>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm ${
      isError
        ? "bg-red-500/10 border border-red-500/25 text-red-300"
        : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-200"
    }`}>
      {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {message}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("renter");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "error" }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveAndRedirect = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    showToast(mode === "login" ? "Welcome back! Redirecting..." : "Account created! Redirecting...", "success");
    setTimeout(() => navigate("/"), 1100);
  };

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
          name: form.name,
          email: form.email,
          password: form.password,
          role,
        });
        saveAndRedirect(res.data);
      } else {
        const res = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        saveAndRedirect(res.data);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    if (!response?.access_token) {
      showToast("Google sign-in was cancelled.");
      return;
    }
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setToast({ message: "", type: "error" });
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_16%)] pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <section className="hidden lg:flex flex-col justify-between rounded-[2rem] border border-slate-800/80 bg-slate-900/90 p-12 shadow-2xl shadow-black/20">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">rentKaro</p>
            <h1 className="text-5xl font-black tracking-tight text-white max-w-xl">
              A better way to rent and earn from the things you own.
            </h1>
            <p className="max-w-xl text-slate-400 leading-relaxed text-lg">
              Build trust with a clean rental dashboard, transparent listings, and simple communication with owners and renters.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 mb-3">
                <Zap size={18} />
              </div>
              <p className="font-semibold text-white mb-1">Quick rentals</p>
              <p className="text-slate-400 text-sm leading-relaxed">Search items, reserve instantly, and manage every booking from one place.</p>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 mb-3">
                <Lock size={18} />
              </div>
              <p className="font-semibold text-white mb-1">Safe deposits</p>
              <p className="text-slate-400 text-sm leading-relaxed">Payments and deposits are protected so you can rent without uncertainty.</p>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 mb-3">
                <Users2 size={18} />
              </div>
              <p className="font-semibold text-white mb-1">Clear communication</p>
              <p className="text-slate-400 text-sm leading-relaxed">Chat with owners and renters, confirm details, and stay organized.</p>
            </div>
          </div>

          <p className="text-slate-500 text-sm">The friendliest rental marketplace for communities and creatives.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-800/80 bg-slate-900/95 p-8 shadow-2xl shadow-black/20">
          <div className="grid gap-4 mb-8">
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/75 p-1">
              {[
                { key: "login", label: "Sign In", icon: <LogIn size={16} /> },
                { key: "signup", label: "Sign Up", icon: <UserPlus size={16} /> },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => switchMode(item.key)}
                  className={`rounded-3xl py-3 text-sm font-semibold transition ${
                    mode === item.key
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {mode === "login"
                  ? "Sign in to manage your rentals, listings, and messages."
                  : "Make your account and choose whether you want to rent or list items."}
              </p>
            </div>
          </div>

          {mode === "signup" && (
            <div className="grid gap-3 mb-6 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole("renter")}
                className={`rounded-3xl border px-4 py-4 text-left text-sm transition ${
                  role === "renter"
                    ? "border-indigo-500 bg-indigo-500/10 text-white"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                }`}
              >
                <p className="font-semibold">Rent items</p>
                <p className="text-slate-500 text-xs mt-1">Find and book verified rentals in minutes.</p>
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`rounded-3xl border px-4 py-4 text-left text-sm transition ${
                  role === "owner"
                    ? "border-emerald-500 bg-emerald-500/10 text-white"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                }`}
              >
                <p className="font-semibold">List items</p>
                <p className="text-slate-500 text-xs mt-1">Show your gear and earn with flexible rental plans.</p>
              </button>
            </div>
          )}

          <div className="space-y-4 mb-4">
            <GoogleButton onSuccess={handleGoogleSuccess} onError={(msg) => showToast(msg)} label={mode === "login" ? "Continue with Google" : "Sign up with Google"} />
            <div className="divider text-slate-600">Or continue with email</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label">
                  <span className="label-text text-slate-300 text-sm">Full name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="input input-bordered input-lg w-full bg-slate-950 text-white border-slate-700"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">
                <span className="label-text text-slate-300 text-sm">Email address</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered input-lg w-full bg-slate-950 text-white border-slate-700"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-slate-300 text-sm">Password</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="input input-bordered input-lg w-full pr-12 bg-slate-950 text-white border-slate-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="label">
                  <span className="label-text text-slate-300 text-sm">Confirm password</span>
                </label>
                <input
                  name="confirmPassword"
                  type={showPw ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input input-bordered input-lg w-full bg-slate-950 text-white border-slate-700"
                  required
                />
              </div>
            )}

            <Toast message={toast.message} type={toast.type} />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full rounded-3xl py-4 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
              ) : mode === "login" ? (
                <>Sign in</>
              ) : (
                <>Create account</>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                  Sign in
                </button>
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;
