import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import { Search, SlidersHorizontal, Package, X, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import Card3D from "../components/Card3D";
import CinematicText from "../components/CinematicText";

const CATEGORIES = ["All", "Tech", "Furniture", "Tools", "Gaming", "Kitchen"];

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
      <div className="h-48 w-full" style={{ backgroundColor: 'hsl(var(--border))' }} />
      <div className="p-5 space-y-3">
        <div className="h-5 w-2/3 rounded" style={{ backgroundColor: 'hsl(var(--border))' }} />
        <div className="h-4 w-1/3 rounded" style={{ backgroundColor: 'hsl(var(--border))' }} />
        <div className="h-4 w-1/2 rounded" style={{ backgroundColor: 'hsl(var(--border))' }} />
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
    if (loc.active) { setLoc({ ...loc, active: false }); return; }
    setLocLoading(true);
    if (!navigator.geolocation) { alert("Geolocation is not supported by your browser"); setLocLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, active: true }); setLocLoading(false); },
      () => { alert("Unable to retrieve your location. Please allow location access."); setLocLoading(false); }
    );
  };

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/api/products`;
    if (loc.active && loc.lat && loc.lng) url += `?lat=${loc.lat}&lng=${loc.lng}&radius=5`;
    axios.get(url)
      .then((res) => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [loc.active, loc.lat, loc.lng]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || (p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <div ref={pageRef} className="min-h-screen pt-28 pb-20 px-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="mb-12 relative">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 animate-fade-in" style={{ color: 'hsl(var(--primary))' }}>Marketplace</p>
          <h1 className="text-5xl md:text-6xl font-black mb-3 font-display" style={{ color: 'hsl(var(--foreground))' }}>
            Browse{" "}
            <span style={{ color: 'hsl(var(--primary))' }}>Rentals</span>
          </h1>
          <p className="text-lg animate-fade-in delay-200" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Find exactly what you need, on your terms.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in delay-100">
          {/* Search input */}
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 transition"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Location + Category Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={detectLocation}
              disabled={locLoading}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 border"
              style={
                loc.active
                  ? { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#86efac' }
                  : { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }
              }
            >
              {locLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
              {loc.active ? "Local (5km)" : "Local Only"}
            </button>

            <div className="w-px h-6 mx-1" style={{ backgroundColor: 'hsl(var(--border))' }} />

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border"
                style={
                  activeCategory === cat
                    ? {
                        backgroundColor: 'hsl(var(--primary))',
                        color: '#fff',
                        borderColor: 'hsl(var(--primary))',
                        boxShadow: '0 4px 14px hsl(var(--primary) / 0.3)',
                        transform: 'scale(1.05)',
                      }
                    : {
                        backgroundColor: 'hsl(var(--secondary))',
                        color: 'hsl(var(--muted-foreground))',
                        borderColor: 'hsl(var(--border))',
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm mb-8 animate-fade-in" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>{filtered.length}</span>{" "}
            {filtered.length === 1 ? "item" : "items"}
            {search && (
              <> for "<span style={{ color: 'hsl(var(--foreground))' }}>{search}</span>"</>
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
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center border"
              style={{ backgroundColor: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
            >
              <Package size={36} style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>No items found</h3>
            <p className="mb-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
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
                <Card3D intensity={4}>
                  <div
                    data-reveal
                    data-delay={`${(i % 8) * 60}`}
                    className="reveal rounded-2xl overflow-hidden group h-full flex flex-col border transition-all duration-200"
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden h-48 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.category && (
                        <span
                          className="absolute top-3 left-3 text-xs font-bold text-white px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: 'hsl(var(--primary))' }}
                        >
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h2
                        className="font-bold mb-2 line-clamp-1 transition-colors duration-200"
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {product.name}
                      </h2>
                      <div className="flex items-end gap-1 mb-1">
                        <span className="font-black text-xl" style={{ color: 'hsl(var(--primary))' }}>₹{product.price}</span>
                        <span className="text-xs mb-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>/mo</span>
                      </div>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>₹{product.deposit} deposit</p>
                      <div className="mt-auto pt-4">
                        <div
                          className="flex items-center text-xs font-semibold gap-1 group-hover:gap-2 transition-all duration-200"
                          style={{ color: 'hsl(var(--primary))' }}
                        >
                          View Details <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Browse;
