import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowRight, Package, Zap, Shield, ChevronRight, Sparkles,
  CheckCircle, Search, LayoutGrid, Wrench, Gamepad2, UtensilsCrossed,
  Users, MapPin, BadgeCheck, TrendingUp, Clock, RotateCcw, Star
} from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import SectionHeader from "../components/SectionHeader";

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800/60" style={{ background: "#0a0f1a" }}>
      <div className="skeleton h-60 w-full" />
      <div className="p-6 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-11 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

/* ── Marquee items — text only, no emoji ── */
const MARQUEE_ITEMS = [
  { icon: <BadgeCheck size={14} />, text: "Zero hidden fees" },
  { icon: <Package size={14} />, text: "500+ verified items" },
  { icon: <Shield size={14} />, text: "Secure deposits" },
  { icon: <Zap size={14} />, text: "Instant booking" },
  { icon: <Gamepad2 size={14} />, text: "Gaming gear" },
  { icon: <LayoutGrid size={14} />, text: "Home furniture" },
  { icon: <Search size={14} />, text: "Tech gadgets" },
  { icon: <Wrench size={14} />, text: "Professional tools" },
  { icon: <UtensilsCrossed size={14} />, text: "Kitchen appliances" },
  { icon: <RotateCcw size={14} />, text: "Easy returns" },
];

const CATEGORIES = ["All", "Tech", "Furniture", "Tools", "Gaming", "Kitchen"];

const STATS = [
  { value: "500+", label: "Items Listed",    icon: <Package   size={20} className="text-indigo-400" /> },
  { value: "1.2K+", label: "Active Renters", icon: <Users     size={20} className="text-violet-400" /> },
  { value: "15+",  label: "Cities Covered",  icon: <MapPin    size={20} className="text-sky-400"    /> },
  { value: "₹0",   label: "Hidden Charges",  icon: <BadgeCheck size={20} className="text-emerald-400" /> },
];

const HOW_IT_WORKS = [
  {
    icon: <Search className="w-6 h-6 text-indigo-400" />,
    title: "Browse & Discover",
    desc: "Search hundreds of verified listings across categories — tech, furniture, tools, and more.",
    step: "01",
    accent: "indigo",
    border: "border-indigo-500/15 hover:border-indigo-500/40",
    bg: "rgba(79,70,229,0.06)",
    glow: "rgba(99,102,241,0.25)",
  },
  {
    icon: <BadgeCheck className="w-6 h-6 text-violet-400" />,
    title: "Book Instantly",
    desc: "Reserve any item in seconds. Flexible monthly plans with no long-term commitment required.",
    step: "02",
    accent: "violet",
    border: "border-violet-500/15 hover:border-violet-500/40",
    bg: "rgba(124,58,237,0.06)",
    glow: "rgba(167,139,250,0.25)",
  },
  {
    icon: <RotateCcw className="w-6 h-6 text-sky-400" />,
    title: "Return with Ease",
    desc: "Return anytime, no questions asked. Your security deposit is 100% refundable.",
    step: "03",
    accent: "sky",
    border: "border-sky-500/15 hover:border-sky-500/40",
    bg: "rgba(14,165,233,0.06)",
    glow: "rgba(56,189,248,0.25)",
  },
];

const TRUST_ITEMS = [
  { icon: <Shield size={18} className="text-emerald-400" />, title: "Verified Listings", desc: "Every item is reviewed and verified before going live." },
  { icon: <BadgeCheck size={18} className="text-indigo-400" />, title: "Secure Payments", desc: "Deposits and payments are handled safely." },
  { icon: <Clock size={18} className="text-violet-400" />, title: "Flexible Duration", desc: "Rent for a month or a year — completely up to you." },
  { icon: <TrendingUp size={18} className="text-sky-400" />, title: "Best Market Price", desc: "Competitive pricing across all categories." },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useScrollReveal(pageRef, [loading]);

  useEffect(() => {
    api
      .get("/api/products")
      .then((res) => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (p) => p.category && p.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div ref={pageRef} className="min-h-screen text-white overflow-x-hidden" style={{ background: "#020917" }}>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-32 overflow-hidden">

        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-orb1 absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/6 blur-[120px]" />
          <div className="animate-orb2 absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
          <div className="animate-orb3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-sky-600/4 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Badge */}
        <div className="animate-fade-in delay-100 inline-flex items-center gap-2 text-indigo-300 text-sm px-5 py-2.5 rounded-full mb-10 cursor-default"
          style={{ background: "rgba(79,70,229,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Star size={12} className="fill-indigo-400 text-indigo-400" />
          India's Premier Rental Marketplace
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in delay-200 text-6xl md:text-8xl font-black leading-[1.05] tracking-tight max-w-5xl">
          Rent Smarter.
          <br />
          <span className="text-shimmer">Live Better.</span>
        </h1>

        <p className="animate-fade-in delay-300 mt-7 text-slate-400 max-w-2xl text-xl leading-relaxed font-light">
          Access furniture, gadgets, tools and appliances on{" "}
          <span className="text-white font-medium">flexible monthly plans</span>.
          No ownership burden. No long-term lock-in.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in delay-400 flex flex-wrap gap-4 mt-12 justify-center">
          <button onClick={() => navigate("/browse")} className="btn-primary flex items-center gap-2 text-base px-9 py-4 text-white">
            <span>Browse Listings</span>
            <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate("/list-item")} className="btn-secondary flex items-center gap-2 text-base px-9 py-4">
            List Your Items
          </button>
        </div>

        {/* Stats */}
        <div className="animate-fade-in delay-600 mt-24 grid grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-3xl">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-5 text-center cursor-default group hover:border-indigo-500/20 transition-colors animate-border-pulse"
              style={{ animationDelay: `${i * 0.7}s` }}
            >
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-3xl font-black gradient-text">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="relative py-4 border-y border-slate-800/40 overflow-hidden" style={{ background: "rgba(10,15,30,0.5)" }}>
        <div className="flex animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-2 px-7 text-slate-500 text-sm font-medium whitespace-nowrap">
              <span className="text-indigo-500">{item.icon}</span>
              {item.text}
              <span className="w-px h-4 bg-slate-700/80 ml-4 flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionHeader
              eyebrow="Simple Process"
              title={<>How <span className="gradient-text">rentKaro</span> Works</>}
              description="From browsing to returning — seamless at every step."
              centered
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[38px] left-[18%] right-[18%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                data-reveal data-delay={`${i * 120}`}
                className={`reveal-scale reveal rounded-2xl p-8 border transition-all duration-500 group cursor-default relative overflow-hidden ${item.border}`}
                style={{ background: item.bg + ", #0a0f1a" }}
              >
                <span className="absolute top-5 right-6 text-5xl font-black text-slate-800/50 select-none group-hover:text-slate-700/50 transition-colors font-mono">
                  {item.step}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: item.bg, border: `1px solid ${item.glow.replace("0.25", "0.3")}`, boxShadow: `0 0 16px ${item.glow}` }}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="py-16 px-6" style={{ background: "rgba(8,12,25,0.6)" }}>
        <div className="max-w-5xl mx-auto">
          <div data-reveal className="reveal grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-5 border border-slate-800/60 hover:border-slate-700/60 transition-colors group"
                style={{ background: "rgba(10,15,30,0.8)" }}
              >
                <div className="mb-3">{item.icon}</div>
                <p className="font-semibold text-sm text-slate-200 mb-1">{item.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED RENTALS ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)" }} />

        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p data-reveal className="reveal text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
              Marketplace
            </p>
            <h2 data-reveal data-delay="100" className="reveal text-4xl md:text-5xl font-black mb-3">
              Featured <span className="gradient-text">Listings</span>
            </h2>
            <p data-reveal data-delay="200" className="reveal text-slate-400 mb-12 text-base">
              Handpicked items available to rent today.
            </p>
          </div>

          {/* Category Filter */}
          <div data-reveal data-delay="300" className="reveal flex justify-center gap-3 mb-12 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "text-white scale-105"
                    : "text-slate-400 hover:text-white border border-slate-700/60 hover:border-slate-600"
                }`}
                style={
                  activeCategory === cat
                    ? {
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        boxShadow: "0 0 20px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.4)",
                        border: "1px solid rgba(99,102,241,0.5)",
                      }
                    : { background: "rgba(15,23,42,0.6)" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <Package size={52} className="text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400">No items in this category</h3>
              <p className="text-slate-600 mt-2 text-sm">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, i) => (
                <div
                  key={product._id}
                  data-reveal data-delay={`${i * 80}`}
                  className="reveal border-gradient rounded-2xl overflow-hidden card-hover group cursor-pointer"
                  style={{ background: "linear-gradient(160deg, #0d1526, #080e1a)", border: "1px solid rgba(20,30,50,1)" }}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={product.image} alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080e1a] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-500" />
                    {product.category && (
                      <span className="absolute top-4 left-4 text-xs font-semibold backdrop-blur-md text-white px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(79,70,229,0.85)", border: "1px solid rgba(99,102,241,0.4)" }}>
                        {product.category}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-300 transition-colors duration-300 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-indigo-400 font-black text-2xl">₹{product.price}</span>
                      <span className="text-slate-500 text-sm mb-0.5">/month</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                      <span className="text-slate-400">₹{product.deposit}</span> refundable deposit
                    </p>
                    <button
                      className="mt-5 w-full btn-primary flex items-center justify-center gap-2 text-white text-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
                    >
                      <span>View Details</span>
                      <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="text-center mt-14">
              <button onClick={() => navigate("/browse")} className="btn-secondary flex items-center gap-2 mx-auto">
                View All Listings
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/5 blur-[80px] rounded-full animate-glow-pulse" />
        </div>
        <div data-reveal className="reveal max-w-3xl mx-auto text-center animated-border p-px rounded-3xl">
          <div className="rounded-3xl px-10 py-16" style={{ background: "#060b18" }}>
            <div className="w-12 h-12 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Sparkles size={22} className="text-indigo-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to get started?
            </h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Join thousands of renters and owners on rentKaro. Start renting or earning today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={() => navigate("/browse")} className="btn-primary flex items-center gap-2 px-10 py-4 text-base text-white">
                <span>Browse Listings</span>
                <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate("/list-item")} className="btn-secondary flex items-center gap-2 px-10 py-4 text-base">
                List Your Items
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;