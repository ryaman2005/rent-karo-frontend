import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import {
  User, Shield, MapPin, Package, Calendar, Award, CheckCircle2, AlertTriangle, ArrowLeft
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import Card3D from "../components/Card3D";

export default function OwnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const [userRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/user/${id}`),
          axios.get(`${API_URL}/api/products/my-listings/${id}`)
        ]);
        setOwner(userRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">The profile you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2">Go Back</button>
      </div>
    );
  }

  const trustScore = (() => {
    let s = 20;
    if (owner.idVerificationStatus === "approved") s += 50;
    else if (owner.idVerificationStatus === "pending") s += 20;
    if (products.length > 0) s += 10;
    return Math.min(s, 100);
  })();

  const initials = owner.name ? owner.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "U";
  const joinDate = new Date(owner.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-8" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 animate-fade-in">
            <div className="rounded-2xl border p-8 text-center bg-[hsl(var(--card))] shadow-sm" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="relative inline-block mb-4">
                {owner.avatar ? (
                  <img src={owner.avatar} alt={owner.name} className="w-24 h-24 rounded-2xl object-cover border-2" style={{ borderColor: "hsl(var(--border))" }} />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto font-black text-3xl text-white shadow-md bg-[hsl(var(--primary))]" >
                    {initials}
                  </div>
                )}
                {owner.idVerificationStatus === "approved" && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified ID">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{owner.name}</h1>
              <p className="text-[hsl(var(--primary))] text-sm font-semibold uppercase tracking-wide mt-1">{owner.role}</p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1.5 bg-[hsl(var(--muted))] px-3 py-1.5 rounded-lg border border-[hsl(var(--border))]">
                  <MapPin size={12} /> {owner.city ? `${owner.city}, ${owner.state}` : "Location hidden"}
                </span>
                <span className="flex items-center gap-1.5 bg-[hsl(var(--muted))] px-3 py-1.5 rounded-lg border border-[hsl(var(--border))]">
                  <Calendar size={12} /> Joined {joinDate}
                </span>
              </div>

              {/* Trust Score */}
              <div className="mt-8 text-left border-t pt-6" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold flex items-center gap-1.5 text-[hsl(var(--foreground))]"><Award size={16} className="text-amber-500"/> Trust Score</span>
                  <span className="text-sm font-black" style={{ color: trustScore >= 80 ? "#10b981" : trustScore >= 50 ? "#f59e0b" : "#ef4444" }}>{trustScore}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${trustScore}%`, backgroundColor: trustScore >= 80 ? "#10b981" : trustScore >= 50 ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>
            </div>

            {owner.bio && (
              <div className="rounded-2xl border p-6 bg-[hsl(var(--card))] shadow-sm" style={{ borderColor: "hsl(var(--border))" }}>
                <h3 className="font-bold text-[hsl(var(--foreground))] mb-3 text-sm tracking-wide uppercase">About</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{owner.bio}</p>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 animate-fade-in delay-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[hsl(var(--foreground))] flex items-center gap-2">
                <Package size={24} className="text-[hsl(var(--primary))]" /> Active Listings ({products.length})
              </h2>
            </div>
            
            {products.length === 0 ? (
              <div className="rounded-2xl border p-12 text-center bg-[hsl(var(--card))] border-dashed flex flex-col items-center" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center mb-4">
                  <Package size={28} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-1">No items listed</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">This user hasn't listed any items for rent yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
