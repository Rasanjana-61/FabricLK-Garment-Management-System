// frontend/src/layouts/Financelayout.jsx

import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaUserTie,
  FaFileInvoiceDollar,
  FaSignOutAlt,
  FaUser 
} from "react-icons/fa";
import Navbar from "../pages/financialmanager/Navbar";

const FinanceLayout = () => {
  const location = useLocation();

  const items = [
    {
      to: "/financialmanager/dashboard",
      label: "Dashboard",
      icon: <FaChartLine />,
    },
    {
      to: "/financialmanager/expenses",
      label: "Expenses",
      icon: <FaMoneyBillWave />,
    },
    {
      to: "/financialmanager/incomes",
      label: "Incomes",
      icon: <FaMoneyBillWave />,
    },
    {
      to: "/financialmanager/salaries",
      label: "Salaries",
      icon: <FaUserTie />,
    },
    {
      to: "/financialmanager/tax-compliance",
      label: "Tax Compliance",
      icon: <FaFileInvoiceDollar />,
    },

    {
  to: "/financialmanager/profile",
  label: "Profile",
  icon: <FaUserTie /> // import FaUser from react-icons/fa if not already
}
  ];

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("auth:update"));
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h2 className="text-xl font-bold">Finance System</h2>
          </div>
          <nav className="mt-2">
            {items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-900 text-white"
                      : "text-blue-100 hover:bg-blue-700"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Sign Out Button */}
        <div className="p-6">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 rounded transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FinanceLayout;
