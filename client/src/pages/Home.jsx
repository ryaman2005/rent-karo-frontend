import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import {
  ArrowRight, Package, Zap, Shield, ChevronRight, Sparkles,
  CheckCircle, Search, LayoutGrid, Wrench, Gamepad2, UtensilsCrossed,
  Users, MapPin, BadgeCheck, TrendingUp, Clock, RotateCcw, Star
} from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useParallax } from "../hooks/useParallax";
import { useMagneticCursor } from "../hooks/useMagneticCursor";
import CinematicText from "../components/CinematicText";
import ParticleField from "../components/ParticleField";
import Card3D from "../components/Card3D";
import ProductCard from "../components/ProductCard";

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[hsl(var(--border))]/60" style={{ backgroundColor: 'hsl(var(--muted))' }}>
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
  { value: "500+", label: "Items Listed",    icon: <Package   size={20} className="text-[hsl(var(--primary))]" /> },
  { value: "1.2K+", label: "Active Renters", icon: <Users     size={20} className="text-violet-400" /> },
  { value: "15+",  label: "Cities Covered",  icon: <MapPin    size={20} className="text-sky-400"    /> },
  { value: "₹0",   label: "Hidden Charges",  icon: <BadgeCheck size={20} className="text-emerald-400" /> },
];

const HOW_IT_WORKS = [
  {
    icon: <Search className="w-6 h-6 text-[hsl(var(--primary))]" />,
    title: "Browse & Discover",
    desc: "Search hundreds of verified listings across categories — tech, furniture, tools, and more.",
    step: "01",
    accent: "blue",
    border: "border-[hsl(var(--primary)/0.3)]/15 hover:border-[hsl(var(--border))]",
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
  { icon: <BadgeCheck size={18} className="text-[hsl(var(--primary))]" />, title: "Secure Payments", desc: "Deposits and payments are handled safely." },
  { icon: <Clock size={18} className="text-violet-400" />, title: "Flexible Duration", desc: "Rent for a month or a year — completely up to you." },
  { icon: <TrendingUp size={18} className="text-sky-400" />, title: "Best Market Price", desc: "Competitive pricing across all categories." },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const ctaRef = useRef(null);

  // Cinematic hooks
  const parallax = useParallax(0.015);
  useMagneticCursor(ctaRef, 0.25);

  useScrollReveal(pageRef, [loading]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/products`)
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
    <div ref={pageRef} className="min-h-screen text-[hsl(var(--foreground))] overflow-x-hidden bg-[hsl(var(--secondary))]">

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-32 overflow-hidden parallax-hero">

        {/* Particle field */}
        <ParticleField count={80} color="99,102,241" speed={0.2} />

        {/* Background mesh — parallax layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="parallax-layer animate-orb1 absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(var(--primary))]/6 blur-[120px]"
            style={{ transform: `translate(${parallax.x * 2}px, ${parallax.y * 2}px)` }}
          />
          <div
            className="parallax-layer animate-orb2 absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]"
            style={{ transform: `translate(${parallax.x * -1.5}px, ${parallax.y * -1.5}px)` }}
          />
          <div
            className="parallax-layer animate-orb3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-sky-600/4 blur-[80px]"
            style={{ transform: `translate(${parallax.x * 1}px, ${parallax.y * 1}px)` }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Ambient dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="ambient-dot"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}

        {/* Badge */}
        <div className="animate-fade-in delay-100 inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full mb-10 cursor-default font-medium"
          style={{ background: 'hsl(var(--primary) / 0.08)', border: '1px solid hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
          <Star size={12} className="fill-current" />
          India's Premier Rental Marketplace
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-8xl font-black leading-[1.05] tracking-tight max-w-5xl animate-fade-in font-display" style={{ color: 'hsl(var(--foreground))' }}>
          <CinematicText text="Rent Smarter." stagger={40} delay={200} />
          <br />
          <span style={{ color: 'hsl(var(--primary))' }}>
            <CinematicText text="Live Better." stagger={40} delay={600} />
          </span>
        </h1>

        <p className="animate-fade-in delay-300 mt-7 max-w-2xl text-xl leading-relaxed font-light" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Access furniture, gadgets, tools and appliances on{" "}
          <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>flexible monthly plans</span>.
          No ownership burden. No long-term lock-in.
        </p>

        {/* CTAs with magnetic effect */}
        <div className="animate-fade-in delay-400 flex flex-wrap gap-4 mt-12 justify-center">
          <div ref={ctaRef} className="magnetic-btn">
            <button onClick={() => navigate("/browse")} className="btn-primary flex items-center gap-2 text-base px-9 py-4 text-white">
              <span>Browse Listings</span>
              <ArrowRight size={18} />
            </button>
          </div>
          <button onClick={() => navigate("/list-item")} className="btn-secondary flex items-center gap-2 text-base px-9 py-4">
            List Your Items
          </button>
        </div>

        {/* Premium Stats */}
        <div className="animate-fade-in delay-600 mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-4xl">
          {STATS.map((stat, i) => {
            const getIconColor = (index) => {
              const colors = ['var(--primary)', '139 65% 60%', '200 95% 45%', '160 65% 45%'];
              return colors[index] || colors[0];
            };
            const iconColor = getIconColor(i);
            
            return (
              <div
                key={stat.label}
                className="group relative rounded-3xl p-6 text-center cursor-default transition-all duration-500 hover:-translate-y-2 bg-white"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(0,0,0,0.05)',
                }}
              >
                {/* Subtle Hover Glow Background */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `linear-gradient(180deg, transparent, hsl(${iconColor} / 0.03)` }}
                />

                {/* Icon Container */}
                <div 
                  className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ 
                    backgroundColor: `hsl(${iconColor} / 0.1)`,
                    border: `1px solid hsl(${iconColor} / 0.2)`
                  }}
                >
                  <div className="transition-transform duration-500 group-hover:scale-110">
                    {stat.icon}
                  </div>
                </div>

                {/* Typography */}
                <div className="relative z-10">
                  <p 
                    className="text-4xl font-black tracking-tight mb-1 transition-all duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, hsl(var(--foreground)), hsl(${iconColor}))`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[hsl(var(--muted-foreground))] text-xs font-semibold tracking-wide uppercase transition-colors duration-300">
                    {stat.label}
                  </p>
                </div>
                
                {/* Underglow line */}
                <div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 rounded-t-full transition-all duration-500 group-hover:w-1/2 opacity-0 group-hover:opacity-100"
                  style={{ backgroundColor: `hsl(${iconColor})` }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CINEMATIC DIVIDER ── */}
      <div className="cinematic-divider" />

      {/* ── MARQUEE TICKER ── */}
      <div className="relative py-4 border-y border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))]">
        <div className="flex animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-2 px-7 text-[hsl(var(--muted-foreground))] text-sm font-medium whitespace-nowrap">
              <span className="text-[hsl(var(--primary))]">{item.icon}</span>
              {item.text}
              <span className="w-px h-4 bg-slate-200 ml-4 flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <p data-reveal className="reveal text-[hsl(var(--primary))] text-xs font-bold tracking-widest uppercase mb-3">
              Simple Process
            </p>
            <h2 data-reveal data-delay="100" className="reveal text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              How <span className="gradient-text">rentKaro</span> Works
            </h2>
            <p data-reveal data-delay="200" className="reveal text-[hsl(var(--muted-foreground))] max-w-md mx-auto text-sm sm:text-base">
              From browsing to returning — seamless at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[38px] left-[18%] right-[18%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

            {HOW_IT_WORKS.map((item, i) => (
              <Card3D key={item.step} intensity={4}>
                <div
                  data-reveal data-delay={`${i * 120}`}
                  className={`reveal rounded-2xl p-8 bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm hover:shadow-md transition-all duration-300 group cursor-default relative overflow-hidden`}
                >
                  <span className="absolute top-5 right-6 text-5xl font-black text-slate-100 select-none font-mono">
                    {item.step}
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--border))] group-hover:scale-110 transition-transform duration-300"
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-[hsl(var(--foreground))]">{item.title}</h3>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="py-16 px-6 bg-[hsl(var(--card))] border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div data-reveal className="reveal grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-5 border border-slate-100 hover:border-[hsl(var(--border))] hover:shadow-sm transition-all duration-200 group bg-[hsl(var(--secondary))]"
              >
                <div className="mb-3">{item.icon}</div>
                <p className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">{item.title}</p>
                <p className="text-[hsl(var(--muted-foreground))] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CINEMATIC DIVIDER ── */}
      <div className="cinematic-divider" />

      {/* ── FEATURED RENTALS ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)" }} />

        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p data-reveal className="reveal text-[hsl(var(--primary))] text-xs font-bold tracking-widest uppercase mb-3">
              Marketplace
            </p>
            <h2 data-reveal data-delay="100" className="reveal text-3xl sm:text-4xl md:text-5xl font-black mb-3">
              Featured <span className="gradient-text">Listings</span>
            </h2>
            <p data-reveal data-delay="200" className="reveal text-[hsl(var(--muted-foreground))] mb-8 md:mb-12 text-sm md:text-base">
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
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                }`}
                style={
                  activeCategory === cat
                    ? {
                        backgroundColor: 'hsl(var(--primary))',
                        boxShadow: '0 4px 14px hsl(var(--primary) / 0.35)',
                        border: "1px solid hsl(var(--primary))",
                      }
                    : { backgroundColor: "hsl(var(--secondary))" }
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
              <Package size={52} className="text-[hsl(var(--secondary-foreground))] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[hsl(var(--muted-foreground))]">No items in this category</h3>
              <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
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

      {/* ── PREMIUM BOTTOM CTA ── */}
      <section className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
        {/* Dynamic Background Gradient */}
        <div 
          className="absolute inset-0 z-0" 
          style={{ 
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(350, 80%, 65%) 100%)' 
          }} 
        />

        {/* Decorative Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Floating Glass Orbs for Depth */}
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-rose-400/30 rounded-full blur-3xl pointer-events-none" />
        
        {/* Decorative Floating Elements */}
        <div className="absolute top-20 right-[15%] w-24 h-24 bg-white/5 border border-white/20 rounded-2xl rotate-12 backdrop-blur-md animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-24 left-[15%] w-16 h-16 bg-white/5 border border-white/10 rounded-full -rotate-12 backdrop-blur-md animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-[10%] w-8 h-8 rounded-full border-2 border-white/20 animate-pulse" />
        <div className="absolute top-1/4 right-[20%] w-4 h-4 rounded-full bg-white/40 animate-ping" style={{ animationDuration: '3s' }} />

        {/* Content Container */}
        <div data-reveal className="reveal relative z-10 max-w-4xl mx-auto">
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-20 text-center shadow-2xl relative overflow-hidden">
            {/* Subtle inner corner glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-white shadow-lg shadow-black/5 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
              <Sparkles size={28} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white font-display tracking-tight leading-tight drop-shadow-sm">
              Ready to get started?
            </h2>
            
            <p className="mb-12 max-w-xl mx-auto text-lg md:text-xl leading-relaxed text-white/90 font-medium tracking-wide">
              Join thousands of renters and owners on rentKaro. Start renting or earning today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button 
                onClick={() => navigate("/browse")} 
                className="bg-white font-bold px-10 py-4 rounded-xl hover:bg-slate-50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-xl shadow-black/10 group" 
                style={{ color: 'hsl(var(--primary))' }}
              >
                <span>Browse Listings</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate("/list-item")} 
                className="bg-white/10 backdrop-blur-md border px-10 py-4 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-base text-white font-bold w-full sm:w-auto"
                style={{ borderColor: 'rgba(255,255,255,0.4)' }}
              >
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