import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import { Search, Package, X, ArrowRight, MapPin, Loader2, Map, List } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import Card3D from "../components/Card3D";
import ProductCard from "../components/ProductCard";
import CinematicText from "../components/CinematicText";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default leaflet marker icon (broken with Vite bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const primaryIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Recenter map on location change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 13, { animate: true });
  }, [lat, lng]);
  return null;
}

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
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
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

  // Items with location data for the map
  const mappable = filtered.filter(p => p.location?.coordinates?.length === 2);

  return (
    <div ref={pageRef} className="min-h-screen pt-28 pb-20 px-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="mb-10 relative">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 animate-fade-in" style={{ color: 'hsl(var(--primary))' }}>Marketplace</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 font-display" style={{ color: 'hsl(var(--foreground))' }}>
            Browse{" "}
            <span style={{ color: 'hsl(var(--primary))' }}>Rentals</span>
          </h1>
          <p className="text-base sm:text-lg animate-fade-in delay-200" style={{ color: 'hsl(var(--muted-foreground))' }}>
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

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Location toggle */}
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
              {loc.active ? "Local (5km) ✓" : "Near Me"}
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

            <div className="w-px h-6 mx-1" style={{ backgroundColor: 'hsl(var(--border))' }} />

            {/* View Mode Toggle */}
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'hsl(var(--border))' }}>
              <button
                onClick={() => setViewMode("grid")}
                className="px-3 py-2 text-sm flex items-center gap-1.5 transition-all"
                style={{
                  backgroundColor: viewMode === "grid" ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                  color: viewMode === "grid" ? '#fff' : 'hsl(var(--muted-foreground))',
                }}
              >
                <List size={14} /> Grid
              </button>
              <button
                onClick={() => setViewMode("map")}
                className="px-3 py-2 text-sm flex items-center gap-1.5 transition-all"
                style={{
                  backgroundColor: viewMode === "map" ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                  color: viewMode === "map" ? '#fff' : 'hsl(var(--muted-foreground))',
                }}
              >
                <Map size={14} /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs sm:text-sm mb-6 animate-fade-in" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>{filtered.length}</span>{" "}
            {filtered.length === 1 ? "item" : "items"} found
            {search && (
              <> for "<span style={{ color: 'hsl(var(--foreground))' }}>{search}</span>"</>
            )}
          </p>
        )}

        {/* ── MAP VIEW ── */}
        {viewMode === "map" && !loading && (
          <div className="animate-fade-in">
            {!loc.active ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border py-20 mb-8 text-center"
                style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
              >
                <MapPin size={48} className="mb-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>Enable location for the map</h3>
                <p className="text-sm mb-5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Click "Near Me" to allow location access and see items plotted on the map.
                </p>
                <button onClick={detectLocation} className="btn-primary flex items-center gap-2">
                  <MapPin size={14} /> Enable Location
                </button>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border mb-8 h-[350px] md:h-[500px]" style={{ borderColor: 'hsl(var(--border))' }}>
                <MapContainer
                  center={[loc.lat, loc.lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap lat={loc.lat} lng={loc.lng} />

                  {/* User location */}
                  <Marker position={[loc.lat, loc.lng]} icon={userIcon}>
                    <Popup>📍 You are here</Popup>
                  </Marker>

                  {/* 5km radius circle */}
                  <Circle
                    center={[loc.lat, loc.lng]}
                    radius={5000}
                    pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))', fillOpacity: 0.06, weight: 1.5 }}
                  />

                  {/* Product markers */}
                  {mappable.map(p => (
                    <Marker
                      key={p._id}
                      position={[p.location.coordinates[1], p.location.coordinates[0]]}
                      icon={primaryIcon}
                    >
                      <Popup>
                        <div className="text-sm font-bold mb-1">{p.name}</div>
                        <div className="text-xs text-gray-600">₹{p.price}/mo · ₹{p.deposit} deposit</div>
                        <a
                          href={`/product/${p._id}`}
                          className="block mt-2 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          View Details →
                        </a>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {/* Also show grid below map */}
            {mappable.length === 0 && loc.active && (
              <p className="text-center text-sm py-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                No items with location data found within 5km.
              </p>
            )}
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <>
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
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Browse;
