import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/common/Card';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        deliveries: 0,
        drivers: 0,
        vehicles: 0,
        inquiries: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [recentActivity] = useState([
        { id: 1, type: 'delivery', message: 'New delivery assigned to John Doe', time: '2 mins ago' },
        { id: 2, type: 'driver', message: 'Driver Sarah Smith registered', time: '15 mins ago' },
        { id: 3, type: 'vehicle', message: 'Vehicle maintenance completed', time: '1 hour ago' },
        { id: 4, type: 'inquiry', message: 'Customer inquiry resolved', time: '2 hours ago' },
    ]);

    const [deliveryStatus] = useState({
        pending: 12,
        inProgress: 8,
        delivered: 45,
        cancelled: 2
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');
            try {
                const [delRes, driRes, vehRes] = await Promise.all([
                    axios.get(`${API_URL}/deliveries`),
                    axios.get(`${API_URL}/drivers`),
                    axios.get(`${API_URL}/vehicles`),
                ]);
                setStats({
                    deliveries: delRes.data.length,
                    drivers: driRes.data.length,
                    vehicles: vehRes.data.length,
                    inquiries: 0, // Placeholder
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                setError('Failed to load dashboard data. Please try refreshing the page.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const styles = {
        primary: '#1a73e8',
        primaryHover: '#1765cc',
        secondary: '#f1f3f4',
        secondaryHover: '#e8eaed',
        borderMain: '#dadce0',
        textMain: '#202124',
        textSecondary: '#5f6368'
    };

    const statsCards = [
        {
            title: 'Total Deliveries',
            value: stats.deliveries,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
            ),
            color: '#1a73e8',
            bgColor: '#e8f0fe',
            trend: '+12%',
            trendUp: true
        },
        {
            title: 'Available Drivers',
            value: stats.drivers,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
            ),
            color: '#34a853',
            bgColor: '#e6f4ea',
            trend: '+5%',
            trendUp: true
        },
        {
            title: 'Registered Vehicles',
            value: stats.vehicles,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
                </svg>
            ),
            color: '#f59e0b',
            bgColor: '#fef3c7',
            trend: '+8%',
            trendUp: true
        },
        {
            title: 'Open Inquiries',
            value: stats.inquiries,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
            ),
            color: '#ea4335',
            bgColor: '#fce8e6',
            trend: '-3%',
            trendUp: false
        }
    ];

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: styles.secondary }}>
                <div className="bg-white p-8 rounded-3xl shadow-xl border text-center" style={{ borderColor: styles.borderMain }}>
                    <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="text-xl font-bold mb-2" style={{ color: styles.textMain }}>Error Loading Dashboard</h3>
                    <p style={{ color: styles.textSecondary }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                        style={{ backgroundColor: styles.primary }}
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: styles.secondary }}>
            <div className="max-w-7xl mx-auto p-6">
               
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2" style={{ color: styles.textMain }}>
                                Admin Dashboard
                            </h1>
                            <p className="text-lg" style={{ color: styles.textSecondary }}>
                                Welcome back! Here's what's happening with your delivery system.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm" style={{ color: styles.textSecondary }}>Last updated</p>
                            <p className="font-semibold" style={{ color: styles.textMain }}>
                                {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div 
                                key={i}
                                className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse"
                                style={{ borderColor: styles.borderMain }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-16 h-16 rounded-xl" style={{ backgroundColor: styles.secondary }}></div>
                                    <div className="w-8 h-8 rounded" style={{ backgroundColor: styles.secondary }}></div>
                                </div>
                                <div className="w-24 h-8 rounded" style={{ backgroundColor: styles.secondary }}></div>
                                <div className="w-32 h-4 rounded mt-2" style={{ backgroundColor: styles.secondary }}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statsCards.map((card, index) => (
                                <div
                                    key={card.title}
                                    className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                    style={{ 
                                        borderColor: styles.borderMain,
                                        animationDelay: `${index * 0.1}s`,
                                        animation: 'fadeInUp 0.5s ease-out forwards'
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div 
                                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: card.bgColor, color: card.color }}
                                        >
                                            {card.icon}
                                        </div>
                                        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                            card.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            <svg className={`w-3 h-3 mr-1 ${card.trendUp ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                                            </svg>
                                            {card.trend}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1" style={{ color: styles.textMain }}>
                                            {card.title}
                                        </h3>
                                        <p className="text-4xl font-bold" style={{ color: card.color }}>
                                            {card.value.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secondary Stats and Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Delivery Status Breakdown */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: styles.borderMain }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold" style={{ color: styles.textMain }}>
                                            Delivery Status Overview
                                        </h2>
                                        <button 
                                            className="text-sm px-3 py-1 rounded-lg transition-colors duration-200"
                                            style={{ backgroundColor: styles.secondary, color: styles.textSecondary }}
                                        >
                                            View All
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Pending', value: deliveryStatus.pending, color: '#f59e0b', bg: '#fef3c7' },
                                            { label: 'In Progress', value: deliveryStatus.inProgress, color: '#3b82f6', bg: '#dbeafe' },
                                            { label: 'Delivered', value: deliveryStatus.delivered, color: '#10b981', bg: '#d1fae5' },
                                            { label: 'Cancelled', value: deliveryStatus.cancelled, color: '#ef4444', bg: '#fee2e2' }
                                        ].map((status) => (
                                            <div key={status.label} className="text-center p-4 rounded-xl" style={{ backgroundColor: status.bg }}>
                                                <p className="text-2xl font-bold mb-1" style={{ color: status.color }}>
                                                    {status.value}
                                                </p>
                                                <p className="text-sm font-medium" style={{ color: styles.textSecondary }}>
                                                    {status.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: styles.borderMain }}>
                                    <h2 className="text-xl font-bold mb-6" style={{ color: styles.textMain }}>
                                        Quick Actions
                                    </h2>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Add New Delivery', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: styles.primary },
                                            { label: 'Register Driver', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: '#10b981' },
                                            { label: 'Add Vehicle', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z', color: '#f59e0b' },
                                            { label: 'View Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#8b5cf6' }
                                        ].map((action, index) => (
                                            <button
                                                key={action.label}
                                                className="w-full flex items-center p-3 rounded-xl transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                                                style={{ backgroundColor: styles.secondary }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = styles.secondaryHover;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = styles.secondary;
                                                }}
                                            >
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                                    style={{ backgroundColor: 'white' }}
                                                >
                                                    <svg className="w-5 h-5" style={{ color: action.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon}></path>
                                                    </svg>
                                                </div>
                                                <span className="font-semibold" style={{ color: styles.textMain }}>
                                                    {action.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: styles.borderMain }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold" style={{ color: styles.textMain }}>
                                    Recent Activity
                                </h2>
                                <button 
                                    className="text-sm px-3 py-1 rounded-lg transition-colors duration-200"
                                    style={{ backgroundColor: styles.secondary, color: styles.textSecondary }}
                                >
                                    View All Activity
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center p-4 rounded-xl" style={{ backgroundColor: styles.secondary }}>
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                                            style={{ backgroundColor: styles.primary }}
                                        >
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {activity.type === 'delivery' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>}
                                                {activity.type === 'driver' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>}
                                                {activity.type === 'vehicle' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z"></path>}
                                                {activity.type === 'inquiry' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>}
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium" style={{ color: styles.textMain }}>
                                                {activity.message}
                                            </p>
                                            <p className="text-sm" style={{ color: styles.textSecondary }}>
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;