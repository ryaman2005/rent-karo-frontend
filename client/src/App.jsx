import { Routes, Route, useLocation } from "react-router-dom";
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

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/my-rentals" element={<MyRentals />} />
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/list-item" element={<ListItem />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/inbox" element={<Inbox />} />
      </Routes>
    </>
  );
}

export default App;