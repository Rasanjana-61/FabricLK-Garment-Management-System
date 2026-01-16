import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';

const AdminLayout = () => {
    const navLinks = [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'Products', path: '/admin/product' },
        { name: 'Orders', path: '/admin/orders' },
        { name: 'Drivers', path: '/admin/drivers' },
        { name: 'Vehicles', path: '/admin/vehicles' },
        { name: 'Deliveries', path: '/admin/deliveries' },
        { name: 'FAQs', path: '/admin/faqs' },
        { name: 'Inquiries', path: '/admin/inquiries' },
        { name: 'Contacts', path: '/admin/contacts' },
        { name: 'Register Supplier', path: '/admin/supplier-register' },
        { name: 'Supplier Forms', path: '/admin/supplier-form-submitions' },

        
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

export default AdminLayout;
