import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import MyRentals from "./pages/MyRentals";
import Admin from "./pages/Admin";
import ListItem from "./pages/ListItem";
import MyListings from "./pages/MyListings";
import Inbox from "./pages/Inbox";
import SplashScreen from "./components/SplashScreen";
import ScrollProgress from "./components/ScrollProgress";
import PageTransition from "./components/PageTransition";

function App() {
  const location = useLocation();
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("rentKaro_splash") === "done"
  );

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("rentKaro_splash", "done");
    setSplashDone(true);
  }, []);

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <>
      <ScrollProgress />

      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/browse" element={<PageTransition><Browse /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
          <Route path="/my-rentals" element={<PageTransition><MyRentals /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="/list-item" element={<PageTransition><ListItem /></PageTransition>} />
          <Route path="/my-listings" element={<PageTransition><MyListings /></PageTransition>} />
          <Route path="/inbox" element={<PageTransition><Inbox /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;