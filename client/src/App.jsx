import { Routes, Route } from "react-router-dom";
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


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/my-rentals" element={<MyRentals />} />
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/list-item" element={<ListItem />} />
        <Route path="/my-listings" element={<MyListings />} />
      </Routes>
    </>
  );
}

export default App;