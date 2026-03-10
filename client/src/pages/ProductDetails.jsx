import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [product,setProduct] = useState(null);

  useEffect(()=>{

    axios
      .get(`http://localhost:8000/api/products/${id}`)
      .then(res=>{
        setProduct(res.data);
      })
      .catch(err=>{
        console.log(err);
      });

  },[id]);

  if(!product){
    return <div className="text-white p-20">Loading...</div>;
  }

  const handleRent = async () => {

    try{

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/api/rentals",
        {
          productName: product.name,
          price: product.price,
          deposit: product.deposit
        },
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      alert("Product rented successfully");

    }catch(error){

      console.log(error);
      alert("Rent failed");

    }

  };

  return (

    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

      <div className="bg-slate-900 rounded-2xl p-10 max-w-3xl w-full shadow-xl">

        <button
          onClick={()=>navigate(-1)}
          className="mb-6 text-indigo-400 hover:underline"
        >
          ← Back
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-cover rounded-xl mb-6"
        />

        <h1 className="text-4xl font-bold mb-4">
          {product.name}
        </h1>

        <p className="text-indigo-400 text-2xl">
          ₹{product.price}/mo
        </p>

        <p className="text-gray-400 mb-6">
          ₹{product.deposit} deposit
        </p>

        <button
          onClick={handleRent}
          className="w-full bg-indigo-600 py-4 rounded-xl hover:bg-indigo-500 transition text-lg"
        >
          Confirm Rent
        </button>

      </div>

    </div>

  );
}

export default ProductDetails;