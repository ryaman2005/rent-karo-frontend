import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { Trash2, Package, Plus, AlertCircle, Loader2 } from "lucide-react";
import CinematicText from "../components/CinematicText";
import Card3D from "../components/Card3D";

function MyListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/products/my-listings/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const deleteProduct = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setConfirmId(null);
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-6" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-extrabold mb-1 animate-fade-in">
              <CinematicText text="My " stagger={30} delay={100} />
              <span className="gradient-text">
                <CinematicText text="Listings" stagger={30} delay={200} />
              </span>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-sm animate-fade-in delay-200">
              {products.length} item{products.length !== 1 ? "s" : ""} listed
            </p>
          </div>
          <button
            onClick={() => navigate("/list-item")}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
                <div className="skeleton h-52 w-full" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-2/3 rounded" />
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <Package size={64} className="text-[hsl(var(--secondary-foreground))] mx-auto mb-5" />
            <h3 className="text-2xl font-semibold text-[hsl(var(--muted-foreground))] mb-2">No listings yet</h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">Start earning by listing your first item.</p>
            <button
              onClick={() => navigate("/list-item")}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              List an Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card3D key={product._id} intensity={5}>
              <div
                className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))] hover:border-[hsl(var(--border))] transition-all duration-500 group animate-fade-in"
              >
                <div className="relative overflow-hidden h-52">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  {product.category && (
                    <span className="absolute top-3 left-3 text-xs font-semibold bg-[hsl(var(--primary))]/80 backdrop-blur-sm  px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold mb-1">{product.name}</h2>
                  <p className="text-[hsl(var(--primary))] font-semibold">
                    ₹{product.price}
                    <span className="text-[hsl(var(--muted-foreground))] text-xs font-normal">/mo</span>
                  </p>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm">₹{product.deposit} deposit</p>

                  {/* Delete inline confirm */}
                  {confirmId === product._id ? (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
                        <AlertCircle size={14} />
                        Delete this listing?
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="btn-secondary flex-1 py-2 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          disabled={deletingId === product._id}
                          className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                        >
                          {deletingId === product._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(product._id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl bg-[hsl(var(--muted))] hover:bg-red-600/20 hover:text-red-400 border border-[hsl(var(--border))] hover:border-red-500/30 text-[hsl(var(--muted-foreground))] transition-all duration-200"
                    >
                      <Trash2 size={14} />
                      Delete Listing
                    </button>
                  )}
                </div>
                </div>
              </Card3D>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListings;