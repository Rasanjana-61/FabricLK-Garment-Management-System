//frontend/src/components/dashboard/Header.jsx

import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const goProfile = () => {
    navigate("/profile");
  };

  const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.username || "U"
  )}&background=random`;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-[var(--color-border-main)]">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-[var(--color-text-main)]">
          Welcome,{" "}
          <button
            type="button"
            onClick={goProfile}
            title="Open Profile"
            className="ml-1 text-[var(--color-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {user?.username}
          </button>
        </h2>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={goProfile}
          title="Open Profile"
          className="mr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={avatarSrc}
            alt="User Avatar"
          />
        </button>
        <Button onClick={logout} variant="primary">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
