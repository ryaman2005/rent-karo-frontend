import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
<Link to="/profile">Profile</Link>

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

  };

  return (
    <nav className="flex justify-between items-center px-10 py-6 bg-slate-900 text-white">

      <Link to="/" className="text-2xl font-bold text-indigo-400">
        RentEase
      </Link>

      <div className="flex gap-8 items-center">

        <Link to="/browse" className="hover:text-indigo-400">
          Browse
        </Link>
        <Link to="/my-rentals" className="hover:text-indigo-400">
          My Rentals
        </Link>
        <Link to="/list-item">
List an Item
</Link>
<Link to="/my-listings">
  My Listings
</Link>
        {user ? (
          <>
            <span className="text-gray-300">
              {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-400"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500"
          >
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}

export default Navbar;