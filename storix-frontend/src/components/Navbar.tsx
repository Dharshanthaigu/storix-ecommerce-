import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.qty, 0));

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-mist">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
          <span className="w-7 h-7 rounded-lg bg-signal flex items-center justify-center text-white text-sm font-black">
            S
          </span>
          STORIX
        </Link>

        <div className="flex items-center gap-6 text-sm">
          {user?.role === "admin" && (
            <Link to="/admin" className="text-slate hover:text-ink transition-colors">
              Admin
            </Link>
          )}
          {user && (
            <>
              <Link to="/orders" className="text-slate hover:text-ink transition-colors">
                Orders
              </Link>
              <Link to="/addresses" className="text-slate hover:text-ink transition-colors">
                Addresses
              </Link>
            </>
          )}

          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 text-slate hover:text-ink transition-colors"
          >
            Cart
            {cartCount > 0 && (
              <span className="font-data text-xs bg-signal text-white rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm border border-mist rounded-full px-4 py-1.5 hover:border-ink transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm bg-ink text-white rounded-full px-4 py-1.5 hover:bg-signal transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}