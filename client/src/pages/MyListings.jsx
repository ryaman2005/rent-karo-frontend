import { useEffect, useState } from "react";
import axios from "axios";

function MyListings() {

  const [products,setProducts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(()=>{

    axios
      .get(`http://localhost:8000/api/products/my-listings/${user._id}`)
      .then(res=>{
        setProducts(res.data);
      });

  },[]);

  const deleteProduct = async(id)=>{

    await axios.delete(`http://localhost:8000/api/products/${id}`);

    setProducts(products.filter(p=>p._id !== id));

  }

  return (

    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-4xl font-bold mb-10">My Listings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {products.map(product=>(
          
          <div key={product._id} className="bg-slate-900 rounded-xl p-5">

            <img
              src={product.image}
              className="h-52 w-full object-cover rounded-lg"
            />

            <h2 className="text-xl mt-4">{product.name}</h2>

            <p className="text-indigo-400">{product.price}</p>

            <button
              onClick={()=>deleteProduct(product._id)}
              className="mt-4 bg-red-600 px-4 py-2 rounded"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  );
}

export default MyListings;