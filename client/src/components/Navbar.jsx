import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 bg-slate-900">
      <Link to="/" className="text-2xl font-bold text-indigo-500">
        RentEase
      </Link>

      <div className="flex gap-8 text-gray-300">
        <Link to="/browse" className="hover:text-indigo-400">
          Browse
        </Link>
        <Link to="/login" className="hover:text-indigo-400">
          Log In
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;