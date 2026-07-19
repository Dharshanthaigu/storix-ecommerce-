import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { register } from "../features/auth/authSlice";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.auth.status);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(register({ name, email, password, phone }));
    if (register.fulfilled.match(result)) {
      toast.success("Account created — please log in");
      navigate("/login");
    } else {
      toast.error((result.payload as string) ?? "Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 border rounded-lg">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="tel"
          required
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {status === "loading" ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="text-sm mt-3 text-center">
        Already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
}