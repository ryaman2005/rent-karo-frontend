import { useParams, useNavigate } from "react-router-dom";
import products from "../data/products";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="bg-slate-900 rounded-2xl p-10 max-w-3xl w-full shadow-xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-400 hover:underline"
        >
          ← Back
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-cover rounded-xl mb-6"
        />

        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

        <p className="text-indigo-400 text-2xl">{product.price}</p>
        <p className="text-gray-400 mb-6">{product.deposit}</p>

        <button className="w-full bg-indigo-600 py-4 rounded-xl hover:bg-indigo-500 transition text-lg">
          Confirm Rent
        </button>

      </div>
    </div>
  );
}

export default ProductDetails;