import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log("LOGIN SUCCESS:", res.data);

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save user
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login successful");

      // redirect to home
      navigate("/");

    } catch (error) {

      console.log("LOGIN ERROR:", error);

      alert(
        error?.response?.data?.message || "Login failed"
      );

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <form
        onSubmit={handleLogin}
        className="bg-slate-900 p-10 rounded-2xl w-96 space-y-6"
      >

        <h2 className="text-3xl font-bold text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800"
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 py-3 rounded-xl hover:bg-indigo-500"
        >
          Login
        </button>

      </form>
    </div>
  );
}

export default Login;