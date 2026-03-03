import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import products from "../data/products";

function Home() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
        {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-3xl"></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          RentEase
        </h2>
        <div className="flex gap-10 text-gray-300 text-lg">
          <button className="hover:text-indigo-400 transition">Browse</button>
          <button className="hover:text-indigo-400 transition">Log In</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-40 relative z-10">
        <h1 className="text-7xl md:text-8xl font-extrabold leading-tight max-w-5xl">
          Own Less.
          <br />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Experience More.
          </span>
        </h1>

        <p className="mt-8 text-gray-400 max-w-2xl text-xl">
          Rent gadgets, furniture, tools, and daily essentials on flexible monthly plans.
        </p>

        <div className="mt-12 flex gap-8">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-5 rounded-2xl font-semibold text-lg hover:scale-105 transition duration-300 shadow-2xl shadow-indigo-500/40">
            Start Renting
          </button>

          <button className="border border-gray-600 px-10 py-5 rounded-2xl text-lg hover:bg-slate-800 hover:scale-105 transition duration-300">
            List an Item
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-t border-gray-800 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div>
            <h2 className="text-5xl font-bold text-indigo-400">10,000+</h2>
            <p className="text-gray-400 mt-3 text-lg">Monthly Rentals</p>
          </div>
          <div>
            <h2 className="text-5xl font-bold text-indigo-400">500+</h2>
            <p className="text-gray-400 mt-3 text-lg">Cities Served</p>
          </div>
          <div>
            <h2 className="text-5xl font-bold text-indigo-400">98%</h2>
            <p className="text-gray-400 mt-3 text-lg">Customer Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-10">
            Featured <span className="text-indigo-500">Rentals</span>
          </h2>

          {/* Category Filters */}
          <div className="flex justify-center gap-6 mb-12 flex-wrap">
            {["All", "Tech", "Furniture", "Tools"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full transition ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition duration-300"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-60 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-2xl font-semibold">{product.name}</h3>
                  <p className="text-indigo-400 mt-3 text-lg">{product.price}</p>
                  <p className="text-gray-400 text-sm">{product.deposit}</p>

                  <button
  onClick={() => navigate(`/product/${product.id}`)}
  className="mt-6 w-full bg-indigo-600 py-3 rounded-xl hover:bg-indigo-500 transition"
>
  Rent Now
</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
export default Home;


