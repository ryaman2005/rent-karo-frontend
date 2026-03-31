import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, Clock, XCircle, PackageCheck, MessageCircle } from "lucide-react";
import { getSocket } from "../services/socketService";
import ChatModal from "../components/ChatModal";

function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [chatRental, setChatRental] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/rentals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRentals(res.data);
      } catch (err) {
        console.log("Error fetching rentals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();

    const socket = getSocket();
    const handleStatusUpdate = (data) => {
      setRentals(prev =>
        prev.map(rental =>
          rental._id === data.rentalId ? { ...rental, status: data.status } : rental
        )
      );
    };

    socket.on("rental_status_update", handleStatusUpdate);
    return () => socket.off("rental_status_update", handleStatusUpdate);
  }, []);

  const handleReturn = async (id) => {
    setReturningId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/rentals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals((prev) => prev.filter((item) => item._id !== id));
      setConfirmId(null);
    } catch (err) {
      console.log("Return failed", err);
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-28 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold mb-1">
              My <span className="gradient-text">Rentals</span>
            </h1>
            <p className="text-gray-400 text-sm">
              {rentals.length} active rental{rentals.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="skeleton h-5 w-2/3 rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-10 w-full rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <ShoppingBag size={64} className="text-slate-700 mx-auto mb-5" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">No active rentals</h3>
            <p className="text-gray-600 mb-8">Browse available items and start renting today.</p>
            <button
              onClick={() => navigate("/browse")}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              Browse Rentals
              <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((item) => (
              <div
                key={item._id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 animate-fade-in"
              >
                {/* Card Top */}
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                        <Clock size={12} />
                        Awaiting Confirmation
                      </span>
                    )}
                    {item.status === "confirmed" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                        <PackageCheck size={12} />
                        Confirmed
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">
                        <XCircle size={12} />
                        Rejected
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold mb-4 line-clamp-2">{item.productName}</h2>

                  {/* Specs */}
                  <div className="bg-slate-800 rounded-xl p-4 space-y-2.5 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rent ({item.duration || 1} {item.duration === 1 ? 'mo' : 'mos'})</span>
                      <span className="font-semibold text-indigo-400">₹{item.price}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deposit Paid</span>
                      <span className="font-semibold">₹{item.deposit}</span>
                    </div>
                  </div>
                </div>

                {/* Return Confirm */}
                {confirmId === item._id ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-amber-400 text-sm mb-3">
                      <AlertCircle size={14} />
                      Return this item?
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="btn-secondary flex-1 py-2 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReturn(item._id)}
                        disabled={returningId === item._id}
                        className="flex-1 py-2 text-sm bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-60 text-white"
                      >
                        {returningId === item._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmId(item._id)}
                      className="flex-1 py-2.5 text-sm rounded-xl bg-slate-800 hover:bg-amber-600/20 hover:text-amber-400 border border-slate-700 hover:border-amber-500/30 text-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      Return
                    </button>
                    {item.status === "confirmed" && (
                      <button
                        onClick={() => setChatRental(item)}
                        className="flex-1 py-2.5 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white transition-all duration-200 font-medium flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={14} /> Message
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {chatRental && (
        <ChatModal rental={chatRental} onClose={() => setChatRental(null)} />
      )}
    </div>
  );
}

export default MyRentals;