import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2, Loader2, Sparkles, Zap, Lock, Users2, ShoppingBag, Store, Home as HomeIcon } from "lucide-react";
import ParticleField from "../components/ParticleField";
import CinematicText from "../components/CinematicText";

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
      className={`relative flex-1 rounded-2xl p-5 text-left transition-all duration-300 active:scale-95 border-[1.5px] ${
        active 
          ? "border-[hsl(var(--primary)_/_0.55)] bg-[hsl(var(--primary)_/_0.08)] shadow-[0_0_20px_hsl(var(--primary)_/_0.15)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)_/_0.3)] shadow-sm"
      }`}
    >
      {active && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center shadow-md">
          <CheckCircle2 size={12} className="text-white" />
        </span>
      )}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${
          active 
            ? "border-[hsl(var(--primary)_/_0.3)] bg-[hsl(var(--primary)_/_0.15)]" 
            : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
        }`}
      >
        {icon}
      </div>
      <p className={`font-bold text-sm mb-1 ${active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]"}`}>{title}</p>
      <p className="text-[hsl(var(--muted-foreground))] text-xs leading-relaxed">{desc}</p>

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
  const [signupStep, setSignupStep] = useState(1); // 1 = Core, 2 = OTP, 3 = Terms
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", termsAccepted: false });

  const showToast = (msg, type = "error") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: "", type: "error" }), 4000);
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

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
        const res = await axios.post(`${API_URL}/api/auth/register`, {
          name: form.name, email: form.email, password: form.password, role,
        });
        showToast("OTP sent! (If it doesn't arrive, use fallback: 123456)", "success");
        setSignupStep(2);
      } else {
        const res = await axios.post(`${API_URL}/api/auth/login`, {
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

  /* ── Advance OTP ── */
  const handleOtpNext = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return showToast("Please enter the 6-digit OTP");
    setSignupStep(3);
  };

  /* ── Terms Verification ── */
  const handleTermsSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone) return showToast("Please enter your phone number");
    if (!form.termsAccepted) return showToast("Please accept the Terms & Conditions");

    setLoading(true);
    setToast({ message: "", type: "error" });

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        otp,
        phone: form.phone,
        termsAccepted: form.termsAccepted,
      });
      saveAndRedirect(res.data);
    } catch (err) {
      showToast(err?.response?.data?.message || "Invalid OTP or validation failed. Please try again.");
      if (err?.response?.data?.message?.toLowerCase().includes("otp")) {
        setSignupStep(2); // Rewind to OTP if it was the OTP that failed
      }
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

      const res = await axios.post(`${API_URL}/api/auth/google`, {
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
    setForm({ name: "", email: "", password: "", confirmPassword: "", phone: "", termsAccepted: false });
    setSignupStep(1);
    setOtp("");
  };

  return (
    <div className="min-h-screen flex" style={{ color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--background))' }}>

      {/* ── Left Branding Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-14 relative overflow-hidden"
        style={{
          background: 'hsl(var(--primary))',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-[80px] pointer-events-none" />
        <div className="absolute top-10 right-0 w-60 h-60 rounded-full bg-white/8 blur-[60px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white">rentKaro</span>
        </div>

        {/* Tagline */}
        <div>
          <h2 className="text-5xl font-black mb-5 leading-tight text-white font-display">
            The smarter<br />way to{" "}
            <span className="text-white/80">rent.</span>
          </h2>
          <p className="text-white/75 leading-relaxed max-w-xs">
            Join thousands of renters and owners who live smarter with rentKaro.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-4">
            {[
              { icon: <Zap size={16} className="text-white" />, text: "Instant booking, no paperwork" },
              { icon: <Lock size={16} className="text-white" />, text: "100% refundable deposits" },
              { icon: <Users2 size={16} className="text-white" />, text: "Verified renters and owners" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/15">
                  {f.icon}
                </div>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-xs">© 2026 rentKaro. All rights reserved.</p>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary))' }}>
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold" style={{ color: 'hsl(var(--foreground))' }}>rentKaro</span>
          </div>

          {/* Mode Toggle */}
          <div
            className="flex rounded-2xl p-1 mb-8 border"
            style={{ backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))' }}
          >
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                style={
                  mode === m
                    ? {
                        backgroundColor: 'hsl(var(--primary))',
                        boxShadow: '0 4px 14px hsl(var(--primary) / 0.35)',
                        color: '#fff',
                      }
                    : { color: 'hsl(var(--muted-foreground))' }
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
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              {mode === "login"
                ? "Sign in to access your rentals and listings."
                : "Join rentKaro — choose how you want to participate."}
            </p>
          </div>

          {/* ── Role Picker (signup only) ── */}
          {mode === "signup" && (
            <div className="mb-6">
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 font-medium">I want to...</p>
              <div className="flex gap-3">
                <RoleCard
                  role="renter"
                  icon={<ShoppingBag size={26} className="text-[hsl(var(--primary))]" />}
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
          {(mode === "login" || signupStep === 1) && (
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={(msg) => showToast(msg)}
              label={mode === "login" ? "Sign in with Google" : "Sign up with Google"}
            />
          )}

          {/* Divider */}
          {(mode === "login" || signupStep === 1) && (
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-[hsl(var(--muted))]" />
              <span className="text-[hsl(var(--muted-foreground))] text-xs font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-[hsl(var(--muted))]" />
            </div>
          )}

          {/* ── Form ── */}
          <form 
            onSubmit={
              mode === "login" || signupStep === 1 
                ? handleSubmit 
                : signupStep === 2 ? handleOtpNext : handleTermsSubmit
            } 
            className="space-y-4"
          >
            {mode === "signup" && signupStep === 3 ? (
              <div className="animate-fade-in space-y-4">
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                  <div className="mt-1">
                    <input
                      name="termsAccepted"
                      type="checkbox"
                      id="terms"
                      checked={form.termsAccepted}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-[hsl(var(--primary))] border-gray-300 focus:ring-[hsl(var(--primary))]"
                      required
                    />
                  </div>
                  <label htmlFor="terms" className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed cursor-pointer">
                    I agree to the <span className="text-[hsl(var(--primary))] font-semibold hover:underline">Terms of Service</span> and <span className="text-[hsl(var(--primary))] font-semibold hover:underline">Privacy Policy</span>. I understand I am legally responsible for the items I rent or list.
                  </label>
                </div>
              </div>
            ) : mode === "signup" && signupStep === 2 ? (
              <div className="animate-fade-in space-y-4">
                <div className="p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm text-center mb-4">
                  <span className="text-[hsl(var(--muted-foreground))]">We sent a verification code to</span><br/>
                  <strong className="text-[hsl(var(--foreground))]">{form.email}</strong>
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium text-center">Enter 6-digit OTP</label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono h-14"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                {mode === "signup" && signupStep === 1 && (
                  <div>
                    <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Full Name</label>
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
              <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Email</label>
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
              <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Password</label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--muted-foreground))] transition"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5 block font-medium">Confirm Password</label>
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
            </>
            )}

            <Toast message={toast.message} type={toast.type} />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {
                  mode === "login" ? "Signing in..." : 
                  signupStep === 1 ? "Sending OTP..." : "Creating account..."
                }</>
              ) : mode === "login" ? (
                <><LogIn size={16} /> Sign In</>
              ) : signupStep === 1 ? (
                <><UserPlus size={16} /> Send OTP</>
              ) : signupStep === 2 ? (
                <>Next <Zap size={16}/></>
              ) : (
                <><CheckCircle2 size={16} /> Complete Account</>
              )}
            </button>
          </form>

          {/* Footer link */}
          {mode === "signup" && signupStep > 1 ? (
            <p className="text-center text-[hsl(var(--muted-foreground))] text-sm mt-6">
              Need to make a change?{" "}
              <button 
                type="button" 
                onClick={() => setSignupStep(signupStep - 1)} 
                className="text-[hsl(var(--primary))] hover:underline font-semibold transition"
              >
                Go back
              </button>
            </p>
          ) : (
            <p className="text-center text-[hsl(var(--muted-foreground))] text-sm mt-6">
              {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] font-semibold transition">
                  Sign Up
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] font-semibold transition">
                  Sign In
                </button>
              </>
            )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;