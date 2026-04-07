import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Package, X, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import SectionHeader from "../components/SectionHeader";

const CATEGORIES = ["All", "Tech", "Furniture", "Tools", "Gaming", "Kitchen"];

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800/80" style={{ background: "#0a0f1a" }}>
      <div className="skeleton h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}

function Browse() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loc, setLoc] = useState({ lat: null, lng: null, active: false });
  const [locLoading, setLocLoading] = useState(false);
  const pageRef = useRef(null);

  useScrollReveal(pageRef, [loading, loc.active]);

  const detectLocation = () => {
    if (loc.active) {
      // Toggle off
      setLoc({ ...loc, active: false });
      return;
    }
    setLocLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, active: true });
        setLocLoading(false);
      },
      (err) => {
        alert("Unable to retrieve your location. Please allow location access.");
        setLocLoading(false);
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    let url = "/api/products";
    if (loc.active && loc.lat && loc.lng) {
      url += `?lat=${loc.lat}&lng=${loc.lng}&radius=5`; // 5KM strict radius
    }
    api
      .get(url)
      .then((res) => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [loc.active, loc.lat, loc.lng]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeCategory === "All" ||
      (p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <div ref={pageRef} className="min-h-screen text-white pt-28 pb-20 px-6" style={{ background: "#020917" }}>
      <div className="max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="mb-12 animate-fade-in relative">
          <div className="absolute -top-20 -left-10 w-72 h-72 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />
          <SectionHeader
            eyebrow="Marketplace"
            title={<>Browse <span className="gradient-text">Rentals</span></>}
            description="Find exactly what you need, on your terms."
            centered={false}
          />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in delay-100">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search for items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 pr-10 text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={detectLocation}
              disabled={locLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                loc.active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 scale-105"
                  : "bg-slate-800/70 text-slate-400 hover:bg-slate-700/70 hover:text-white border border-slate-700/60"
              }`}
            >
              {locLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
              {loc.active ? "Local (5km)" : "Local Only"}
            </button>
            <div className="w-px h-6 bg-slate-800 mx-1"></div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "text-white scale-105"
                    : "bg-slate-800/70 text-slate-400 hover:bg-slate-700/70 hover:text-white border border-slate-700/60"
                }`}
                style={
                  activeCategory === cat
                    ? {
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        boxShadow: "0 0 16px rgba(99,102,241,0.4)",
                        border: "1px solid rgba(99,102,241,0.4)",
                      }
                    : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-slate-500 text-sm mb-8 animate-fade-in">
            <span className="text-indigo-400 font-semibold">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "item" : "items"}
            {search && (
              <> for "<span className="text-white">{search}</span>"</>
            )}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28 animate-fade-in">
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
            >
              <Package size={36} className="text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">No items found</h3>
            <p className="text-slate-600 mb-8">
              {search ? `Try a different keyword.` : "No items in this category yet."}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="btn-secondary text-sm flex items-center gap-2 mx-auto">
                <X size={14} /> Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <Link key={product._id} to={`/product/${product._id}`}>
                <div
                  data-reveal
                  data-delay={`${(i % 8) * 60}`}
                  className="reveal border-gradient rounded-2xl overflow-hidden card-hover group h-full flex flex-col"
                  style={{ background: "linear-gradient(145deg, #0d1526, #0a0f1a)", border: "1px solid rgba(20,30,50,1)" }}
                >
                  <div className="relative overflow-hidden h-48 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-500" />
                    {product.category && (
                      <span className="absolute top-3 left-3 text-xs font-bold bg-indigo-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-indigo-400/20">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-bold mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors duration-300">
                      {product.name}
                    </h2>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-indigo-400 font-black text-xl">₹{product.price}</span>
                      <span className="text-slate-500 text-xs mb-0.5">/mo</span>
                    </div>
                    <p className="text-slate-600 text-xs">₹{product.deposit} deposit</p>
                    <div className="mt-auto pt-4">
                      <div className="flex items-center text-xs text-indigo-400 font-semibold group-hover:gap-2 gap-1 transition-all duration-200">
                        View Details <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Browse;