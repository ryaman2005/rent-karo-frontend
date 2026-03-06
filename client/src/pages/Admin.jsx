import { useState } from "react";
import axios from "axios";

function Admin(){

const [name,setName] = useState("");
const [price,setPrice] = useState("");
const [deposit,setDeposit] = useState("");
const [image,setImage] = useState("");

const handleAddProduct = async ()=>{

await axios.post("http://localhost:8000/api/products",{

name,
price,
deposit,
image

});

alert("Product added");

};

return(

<div className="min-h-screen bg-slate-950 text-white p-20">

<h1 className="text-4xl mb-10">Admin Panel</h1>

<input placeholder="Name" onChange={(e)=>setName(e.target.value)} />
<input placeholder="Price" onChange={(e)=>setPrice(e.target.value)} />
<input placeholder="Deposit" onChange={(e)=>setDeposit(e.target.value)} />
<input placeholder="Image URL" onChange={(e)=>setImage(e.target.value)} />

<button onClick={handleAddProduct}>
Add Product
</button>

</div>

);

}

export default Admin;