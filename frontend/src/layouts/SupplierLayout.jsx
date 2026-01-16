import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';

const SupplierLayout = () => {
     const navLinks = [
        { name: 'Home', path: '../' },
        { name: 'My forms', path: '/supplier/supplier-forms' },


     
    ];
    
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar navLinks={navLinks} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SupplierLayout;
