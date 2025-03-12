import { Link, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../Context/AppContext";
import { FaUserCircle } from "react-icons/fa";

export default function Layout() {
  const { user } = useContext(AppContext);
  const location = useLocation();
  const isUpdatePage = location.pathname.includes("/Update");

  return (
    <>
      <header className="bg-slate-800 shadow-md py-3">
        <nav className="flex justify-between items-center max-w-5xl mx-auto">
          {/* Tombol Back memicu event showPopup */}
          {isUpdatePage ? (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("showPopup"));
              }}
              className="nav-link"
            >
              Back
            </button>
          ) : (
            <Link to="/" className="nav-link">
              Home
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-4 ml-auto">
              <Link
                to="/Create"
                className="bg-purple-500 font-semibold text-white text-sm px-3 py-1 rounded-md hover:bg-purple-600 transition"
              >
                New Post
              </Link>

              <Link
                to="/profile"
                className="flex items-center space-x-1 text-white hover:text-purple-400 transition font-medium"
              >
                <FaUserCircle className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            </div>
          ) : (
            <div className="space-x-3 ml-auto text-xs">
              <Link to="/register" className="nav-link">
                Register
              </Link>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
