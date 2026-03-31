import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Menu, X, Package, LogOut, List, ShoppingBag, Search, Sparkles, Bell, MessageSquare } from "lucide-react";
import { getSocket, connectSocket, disconnectSocket } from "../services/socketService";
import NotificationPanel from "./NotificationPanel";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Read user from state so Navbar re-renders on login/logout
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef(null);

  // Re-sync user and connect socket
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user")) || null;
      setUser(u);
      if (u) {
        connectSocket(u._id);
        fetchNotifications();
      } else {
        disconnectSocket();
        setNotifications([]);
      }
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:8000/api/rentals/owner", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Map backend rentals to notification format
      const reqs = res.data.map(r => ({
        rentalId: r._id,
        productName: r.productName,
        price: r.price,
        deposit: r.deposit,
        duration: r.duration,
        renter: r.user,
        createdAt: r.createdAt
      }));
      setNotifications(reqs);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Listen for socket events
  useEffect(() => {
    const socket = getSocket();
    
    const handleNewRequest = (data) => {
      setNotifications(prev => [data, ...prev]);
    };

    socket.on("new_rental_request", handleNewRequest);
    return () => socket.off("new_rental_request", handleNewRequest);
  }, []);

  // Click outside notification panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const navLinks = [
    { path: "/browse", label: "Browse", icon: <Search size={14} /> },
    { path: "/my-rentals", label: "My Rentals", icon: <ShoppingBag size={14} /> },
    { path: "/list-item", label: "List an Item", icon: <Package size={14} /> },
    { path: "/my-listings", label: "My Listings", icon: <List size={14} /> },
    { path: "/inbox", label: "Inbox", icon: <MessageSquare size={14} /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-xl shadow-black/30" : "bg-transparent"
      }`}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full transition-all duration-500"
        style={{
          background: scrolled
            ? "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(167,139,250,0.4), transparent)"
            : "transparent",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight gradient-text">rentKaro</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive(link.path)
                  ? "bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth & Notifications */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={panelRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800/80 mr-2"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
                {showNotifications && (
                  <NotificationPanel
                    requests={notifications}
                    onAction={(rentalId) => {
                      setNotifications(prev => prev.filter(n => n.rentalId !== rentalId));
                    }}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover border border-indigo-500/30"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border border-indigo-500/30"
                    style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.3))", boxShadow: "0 0 12px rgba(99,102,241,0.25)" }}
                  >
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-slate-200 text-sm font-medium leading-none">{user.name}</p>
                  {user.role && (
                    <p className="text-indigo-400 text-xs capitalize mt-0.5">{user.role}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-800/70 hover:bg-red-500/10 border border-slate-700/70 hover:border-red-500/30 text-slate-400 hover:text-red-400 px-4 py-2 rounded-xl text-sm transition-all duration-200"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-primary text-sm py-2 px-5 text-white flex items-center"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-slate-300 hover:text-white p-2.5 rounded-xl hover:bg-slate-800/70 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass animate-slide-down border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive(link.path)
                    ? "bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-800 mt-2 pt-3">
              {user ? (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.role && <p className="text-indigo-400 text-xs capitalize">{user.role}</p>}
                    </div>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 text-sm">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2.5 text-center block text-white">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;