import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ navLinks }) => {
    const activeLink = "flex items-center mt-4 py-2 px-6 bg-gray-700 bg-opacity-25 text-gray-100";
    const inactiveLink = "flex items-center mt-4 py-2 px-6 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100";

    return (
        <div className="hidden md:flex flex-col w-64 bg-gray-800">
            <div className="flex items-center justify-center h-16 bg-gray-900">
                <span className="text-white font-bold uppercase">Dashboard</span>
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto">
                <nav className="flex-1 px-2 py-4 bg-gray-800">
                    {navLinks.map((link) => (
                         <NavLink 
                            key={link.name} 
                            to={link.path}
                            className={({ isActive }) => isActive ? activeLink : inactiveLink}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
