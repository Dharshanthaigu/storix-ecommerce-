import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { login } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();   
  const { status, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back");
      navigate("/");
    } else {
      toast.error((result.payload as string) ?? "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border rounded-lg">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {status === "loading" ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="text-sm mt-3 text-center">
        No account? <Link to="/register" className="underline">Register</Link>
      </p>
    </div>
  );
}