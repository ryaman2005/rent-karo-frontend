import { useState, useEffect } from "react";
import axios from "axios";

function Browse() {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    axios
      .get("http://localhost:8000/api/products")
      .then((res) => {
        console.log("Products:", res.data);
        setProducts(res.data);
      })
      .catch((err) => console.log(err));

  }, []);

  return (
    <div className="p-10 text-white">

      <h1 className="text-4xl font-bold mb-8">
        Browse Rentals
      </h1>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">

          {products.map((product) => (

            <div
              key={product._id}
              className="bg-slate-900 p-6 rounded-xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-40 w-full object-cover rounded-lg mb-4"
              />

              <h2 className="text-xl font-semibold">
                {product.name}
              </h2>

              <p className="text-indigo-400">
                ₹{product.price}/mo
              </p>

              <p className="text-gray-400">
                Deposit: ₹{product.deposit}
              </p>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Browse;