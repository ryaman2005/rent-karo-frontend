import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Package, Tag, IndianRupee, Shield, Image as ImageIcon,
  CheckCircle2, Loader2, ChevronDown, ArrowRight, MapPin
} from "lucide-react";

const CATEGORIES = ["Tech", "Furniture", "Tools", "Gaming", "Kitchen", "Sports", "Books", "Other"];

function ListItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    deposit: "",
    category: "",
  });
  const [file, setFile] = useState(null);
  const [loc, setLoc] = useState({ lat: null, lng: null, address: "" });
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const detectLocation = () => {
    setLocLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let addressStr = loc.address;

        try {
          // Free reverse geocoding to get neighborhood name
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.data && res.data.address) {
            const a = res.data.address;
            // Prioritize neighborhood or suburb over full city name
            addressStr = a.neighbourhood || a.suburb || a.city_district || a.city || a.town || a.county || "";
          }
        } catch (err) {
          console.error("Failed to get address name", err);
        }

        setLoc({ lat, lng, address: addressStr });
        setLocLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please allow location access.");
        setLocLoading(false);
      }
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!file) {
      setError("Please select an image file.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("deposit", form.deposit);
      formData.append("category", form.category);
      formData.append("owner", user?._id);
      formData.append("image", file); // The actual file
      
      if (loc.lat && loc.lng) {
        formData.append("lat", loc.lat);
        formData.append("lng", loc.lng);
      }
      if (loc.address) {
        formData.append("address", loc.address);
      }

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess(true);
    } catch (err) {
      console.error("DEBUG FRONTEND:", err);
      setError(err.response?.data?.message || err.message || "Failed to list item.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 pt-20">
        <div className="text-center animate-fade-in max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 animate-pulse-ring">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Item Listed!</h2>
          <p className="text-gray-400 mb-8">
            Your item is now live on rentKaro. Renters can find it right away.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setSuccess(false); setForm({ name: "", price: "", deposit: "", category: "" }); setFile(null); setLoc({ lat: null, lng: null, address: "" }); }}
              className="btn-secondary"
            >
              List Another
            </button>
            <button
              onClick={() => navigate("/my-listings")}
              className="btn-primary flex items-center gap-2"
            >
              My Listings <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-28 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-2">
            List Your <span className="gradient-text">Item</span>
          </h1>
          <p className="text-gray-400">Fill in the details and start earning from your idle items.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-5 animate-fade-in delay-100"
          >
            {/* Name */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-2">
                <Package size={14} /> Item Name
              </label>
              <input
                name="name"
                placeholder="e.g. Sony 65-inch TV"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-2">
                <Tag size={14} /> Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-field appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Price + Deposit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-2">
                  <IndianRupee size={14} /> Monthly Rent
                </label>
                <input
                  name="price"
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.price}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-2">
                  <Shield size={14} /> Security Deposit
                </label>
                <input
                  name="deposit"
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.deposit}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin size={14} /> Item Location (Required for local search)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Neighborhood (e.g. Bandra West)"
                  value={loc.address}
                  onChange={(e) => setLoc({ ...loc, address: e.target.value })}
                  className="input-field flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  className={`px-4 rounded-xl flex items-center justify-center border transition-all ${
                    loc.lat && loc.lng 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-slate-800 border-slate-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {locLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-2">
                <ImageIcon size={14} /> Upload Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 file:transition-colors bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Listing...
                </>
              ) : (
                <>
                  <Package size={16} />
                  List Item
                </>
              )}
            </button>
          </form>

          {/* Image Preview */}
          <div className="lg:col-span-2 animate-fade-in delay-200">
            <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
              <ImageIcon size={14} /> Image Preview
            </p>
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="text-center text-gray-600">
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an image file<br/>to preview</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-300 space-y-1.5">
              <p className="font-semibold text-indigo-400">Tips for a great listing:</p>
              <p className="text-gray-400">• Use a clear, well-lit photo</p>
              <p className="text-gray-400">• Set a competitive price</p>
              <p className="text-gray-400">• Keep deposit reasonable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListItem;