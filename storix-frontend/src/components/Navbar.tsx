import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector((s) => s.cart.items.length);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b">
      <Link to="/" className="font-semibold text-lg">Storix</Link>
      <div className="flex items-center gap-4">
        <Link to="/cart">Cart ({cartCount})</Link>
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            <Link to="/addresses">Addresses</Link>
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <span className="text-sm text-gray-500">{user.name}</span>
            <button onClick={handleLogout} className="text-sm underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}