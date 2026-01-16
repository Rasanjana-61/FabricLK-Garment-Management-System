//frontend/src/components/common/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "./Button";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleDashboardRedirect = () => {
    if (user.role === "Admin") {
      navigate("/admin");
    } else if (user.role === "Supplier") {
      navigate("/Supplier");
    } else if (user.role === "financialmanager") {
      navigate("/financialmanager");
    } else if (user.role === "hrmanager") {
      navigate("/hrmanager");
    } else {
      navigate("/customer");
    }
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[var(--color-primary)]">
          FabricLK
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4 relative">
          <Link
            to="/"
            className="text-[var(--color-text-main)] hover:text-[var(--color-primary)]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            className="text-[var(--color-text-main)] hover:text-[var(--color-primary)]"
          >
            Shop
          </Link>
          <Link
            to="faqs"
            className="text-[var(--color-text-main)] hover:text-[var(--color-primary)]"
          >
            FAQ
          </Link>
          <Link
            to="contactus"
            className="text-[var(--color-text-main)] hover:text-[var(--color-primary)]"
          >
            Contact Us
          </Link>

          {/* If logged in */}
          {user ? (
            <div className="relative">
              {/* Profile Avatar */}
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={toggleMenu}
              >
                <img
                  src="https://cdn.pixabay.com/photo/2017/02/23/13/05/avatar-2092113_1280.png"
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-gray-300 object-cover ml-10"
                />
                <div className="text-blue-800">{user.username}</div>
              </div>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={handleDashboardRedirect}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>

                  {/* Profile link (added) */}
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // If not logged in
            <>
              <Link
                to="/login"
                className="text-[var(--color-text-main)] hover:text-[var(--color-primary)]"
              >
                Login
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
