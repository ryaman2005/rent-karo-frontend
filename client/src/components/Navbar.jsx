import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../config";
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
  const [kycCount, setKycCount] = useState(0);
  const panelRef = useRef(null);

  // Re-sync user and connect socket
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user")) || null;
      setUser(u);
      if (u) {
        connectSocket(u._id);
        fetchNotifications();
        if (u.role === "owner") {
          fetchKycCount();
        }
      } else {
        disconnectSocket();
        setNotifications([]);
        setKycCount(0);
      }
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  const fetchKycCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/auth/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKycCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch kyc count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/rentals/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Map backend rentals to notification format
      const reqs = res.data.map(r => ({
        rentalId: r._id,
        productName: r.productName,
        price: r.price,
        deposit: r.deposit,
        startDate: r.startDate,
        endDate: r.endDate,
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

    const handleNewKyc = () => {
      setKycCount(prev => prev + 1);
    };

    socket.on("new_rental_request", handleNewRequest);
    socket.on("new_kyc_submission", handleNewKyc);

    return () => {
      socket.off("new_rental_request", handleNewRequest);
      socket.off("new_kyc_submission", handleNewKyc);
    };
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
    ...(user?.role === "owner" ? [{ path: "/admin", label: "Admin", icon: <Sparkles size={14} /> }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? "glass-cinematic" : "bg-transparent"
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md logo-cinematic transition-all duration-300" style={{ backgroundColor: 'hsl(var(--primary))' }}>
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">rentKaro</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive(link.path)
                  ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-semibold border border-[hsl(var(--border))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))]"
              }`}
            >
              {link.icon}
              {link.label}
              {link.path === "/admin" && kycCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {kycCount}
                </span>
              )}
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
                  className="relative p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors rounded-xl hover:bg-[hsl(var(--muted))] mr-2"
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
                    className="w-9 h-9 rounded-xl object-cover border border-[hsl(var(--border))]"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border border-[hsl(var(--border))] text-white"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                  >
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium leading-none" style={{ color: 'hsl(var(--foreground))' }}>{user.name}</p>
                  {user.role && (
                    <p className="text-[hsl(var(--primary))] text-xs capitalize mt-0.5">{user.role}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-[hsl(var(--muted))]/70 hover:bg-red-500/10 border border-[hsl(var(--border))]/70 hover:border-red-500/30 text-[hsl(var(--muted-foreground))] hover:text-red-400 px-4 py-2 rounded-xl text-sm transition-all duration-200"
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
          className="md:hidden text-[hsl(var(--muted-foreground))] hover:text-white p-2.5 rounded-xl hover:bg-[hsl(var(--muted))]/70 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass animate-slide-down border-t border-[hsl(var(--border))]/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive(link.path)
                    ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-semibold border border-[hsl(var(--border))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--muted))]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[hsl(var(--border))] mt-2 pt-3">
              {user ? (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] text-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.12)] border border-[hsl(var(--border))] flex items-center justify-center font-bold text-xs">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.role && <p className="text-[hsl(var(--primary))] text-xs capitalize">{user.role}</p>}
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