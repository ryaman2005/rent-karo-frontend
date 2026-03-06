import { useEffect, useState } from "react";
import axios from "axios";

function MyRentals() {

  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const fetchRentals = async () => {
      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8000/api/rentals",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRentals(res.data);

      } catch (error) {
        console.log("Error fetching rentals", error);
      }
    };

    fetchRentals();
  }, []);
const handleReturn = async (id) => {

  try {

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:8000/api/rentals/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRentals(rentals.filter((item) => item._id !== id));

  } catch (error) {
    console.log("Return failed", error);
  }

};
  return (
    <div className="min-h-screen bg-slate-950 text-white px-10 py-20">

      <h1 className="text-4xl font-bold mb-10">
        My Rentals
      </h1>

      {rentals.length === 0 ? (
        <p>No rentals yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">

          {rentals.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900 p-6 rounded-xl"
            >
              <h2 className="text-2xl font-semibold">
                {item.productName}
              </h2>

              <p className="text-indigo-400 mt-2">
                {item.price}
              </p>

              <p className="text-gray-400">
                {item.deposit}
              </p>
              <button
  onClick={() => handleReturn(item._id)}
  className="mt-4 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-400"
>
  Return Item
</button>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default MyRentals;