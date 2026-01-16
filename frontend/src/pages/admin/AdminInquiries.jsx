import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '../../hooks/useAuth';
import { Shield } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/inquiries';

// Validation Schema for the reply form
const ReplySchema = Yup.object().shape({
    reply: Yup.string()
        .trim()
        .min(10, 'Reply must be at least 10 characters long.')
        .required('Reply message cannot be empty.'),
});


const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, open, closed
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(API_URL, config);
            setInquiries(data);
        } catch (error) {
            console.error("Failed to fetch inquiries", error);
            // Toast notification for error
            toast.error("Failed to fetch inquiries. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchInquiries();
    }, [user]);

    // This function will now be the submit handler for Formik
    const handleReplySubmit = async (values, { setSubmitting, resetForm }) => {
        if (!selectedInquiry) {
            toast.error("No inquiry selected.");
            setSubmitting(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_URL}/${selectedInquiry._id}/reply`, { message: values.reply }, config);
            
            setSelectedInquiry(data);
            resetForm(); // Reset the form after successful submission
            await fetchInquiries(); // Refresh the list
            toast.success("Reply sent successfully!");
        } catch (error) {
            console.error("Failed to send reply", error);
            toast.error("Failed to send reply. Please check your connection.");
        } finally {
            setSubmitting(false); // Re-enable the submit button
        }
    };

    const handleCloseInquiry = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/${id}/close`, {}, config);
            
            await fetchInquiries(); // Refresh the list
            setSelectedInquiry(null); // Deselect the inquiry
            toast.success("Inquiry has been closed.");
        } catch (error) {
            console.error("Failed to close inquiry", error);
            toast.error("Could not close the inquiry. Please try again.");
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch = inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              inquiry.customer.username.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === 'all' || 
                              (filterStatus === 'open' && !inquiry.isClosed) ||
                              (filterStatus === 'closed' && inquiry.isClosed);
        
        return matchesSearch && matchesFilter;
    });

    const openInquiries = inquiries.filter(inq => !inq.isClosed).length;
    const closedInquiries = inquiries.filter(inq => inq.isClosed).length;

    const styles = {
        primary: '#1a73e8',
        primaryHover: '#1765cc',
        secondary: '#f1f3f4',
        secondaryHover: '#e8eaed',
        borderMain: '#dadce0',
        textMain: '#202124',
        textSecondary: '#5f6368'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* ToastContainer is where all toast notifications will be rendered */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="max-w-7xl mx-auto p-6">
                {/* Page Title Card - Updated to match theme */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-7 h-7" />
                                Admin Inquiries Management
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                    <span className="text-blue-500 font-semibold text-sm">
                                        Total: {inquiries.length}
                                    </span>
                                </div>
                                <div className="bg-green-500 bg-opacity-30 px-4 py-2 rounded-lg">
                                    <span className="text-white font-semibold text-sm">
                                        Open: {openInquiries}
                                    </span>
                                </div>
                                <div className="bg-gray-500 bg-opacity-30 px-4 py-2 rounded-lg">
                                    <span className="text-white font-semibold text-sm">
                                        Closed: {closedInquiries}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-xl border overflow-hidden" style={{ borderColor: styles.borderMain, height: 'calc(100vh - 200px)' }}>
                    <div className="flex h-full">
                        {/* Left Sidebar */}
                        <div className="w-1/3 border-r flex flex-col" style={{ borderColor: styles.borderMain, backgroundColor: styles.secondary }}>
                            {/* Sidebar Header */}
                            <div 
                                className="px-6 py-5 border-b"
                                style={{ backgroundColor: 'white', borderColor: styles.borderMain }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold" style={{ color: styles.textMain }}>
                                        All Inquiries
                                    </h2>
                                    <div 
                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                        style={{ backgroundColor: styles.primary, color: 'white' }}
                                    >
                                        {filteredInquiries.length}
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5" style={{ color: styles.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search inquiries..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: styles.borderMain }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = styles.primary;
                                            e.target.style.boxShadow = `0 0 0 2px ${styles.primary}33`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = styles.borderMain;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="flex gap-2">
                                    {[
                                        { value: 'all', label: 'All', count: inquiries.length },
                                        { value: 'open', label: 'Open', count: openInquiries },
                                        { value: 'closed', label: 'Closed', count: closedInquiries }
                                    ].map(filter => (
                                        <button
                                            key={filter.value}
                                            onClick={() => setFilterStatus(filter.value)}
                                            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                            style={{
                                                backgroundColor: filterStatus === filter.value ? styles.primary : 'transparent',
                                                color: filterStatus === filter.value ? 'white' : styles.textSecondary
                                            }}
                                        >
                                            {filter.label}
                                            <span 
                                                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                                                style={{
                                                    backgroundColor: filterStatus === filter.value ? 'rgba(255,255,255,0.3)' : styles.secondaryHover,
                                                    color: filterStatus === filter.value ? 'white' : styles.textSecondary
                                                }}
                                            >
                                                {filter.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inquiries List */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <svg className="w-8 h-8 animate-spin" style={{ color: styles.primary }} fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                            <path fill="currentColor" className="opacity-75" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : filteredInquiries.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div 
                                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                            style={{ backgroundColor: 'white' }}
                                        >
                                            <svg className="w-8 h-8" style={{ color: styles.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                            </svg>
                                        </div>
                                        <p style={{ color: styles.textSecondary }}>
                                            {searchTerm ? 'No matching inquiries found' : 'No inquiries available'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredInquiries.map(inq => (
                                            <div 
                                                key={inq._id} 
                                                onClick={() => setSelectedInquiry(inq)} 
                                                className="p-4 cursor-pointer transition-all duration-200 rounded-xl border bg-white hover:shadow-md"
                                                style={{
                                                    borderColor: selectedInquiry?._id === inq._id ? styles.primary : styles.borderMain,
                                                    backgroundColor: selectedInquiry?._id === inq._id ? '#f8faff' : 'white'
                                                }}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold truncate flex-1 mr-2" style={{ color: styles.textMain }}>
                                                        {inq.subject}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full shrink-0 ${
                                                        inq.isClosed 
                                                            ? 'bg-gray-100 text-gray-600' 
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {inq.isClosed ? 'Closed' : 'Open'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm" style={{ color: styles.textSecondary }}>
                                                        From: <span className="font-medium" style={{ color: styles.primary }}>
                                                            {inq.customer.username}
                                                        </span>
                                                    </p>
                                                    <div className="flex items-center text-xs" style={{ color: styles.textSecondary }}>
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                                        </svg>
                                                        {inq.messages?.length || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="w-2/3 flex flex-col">
                            {selectedInquiry ? (
                                <>
                                    {/* Inquiry Header */}
                                    <div 
                                        className="px-6 py-5 border-b flex justify-between items-center"
                                        style={{ backgroundColor: 'white', borderColor: styles.borderMain }}
                                    >
                                        <div>
                                            <h2 className="text-xl font-bold mb-1" style={{ color: styles.textMain }}>
                                                {selectedInquiry.subject}
                                            </h2>
                                            <p className="text-sm" style={{ color: styles.textSecondary }}>
                                                Customer: <span className="font-medium" style={{ color: styles.primary }}>
                                                    {selectedInquiry.customer.username}
                                                </span>
                                            </p>
                                        </div>
                                        {!selectedInquiry.isClosed && (
                                            <button
                                                onClick={() => handleCloseInquiry(selectedInquiry._id)}
                                                className="px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                                                style={{ backgroundColor: '#dc2626' }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#b91c1c';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = '#dc2626';
                                                }}
                                            >
                                                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                                Close Inquiry
                                            </button>
                                        )}
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: styles.secondary }}>
                                        <div className="space-y-6">
                                            {selectedInquiry.messages?.map((msg, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`flex ${msg.sender.role === 'Admin' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-lg p-4 rounded-2xl shadow-sm ${
                                                        msg.sender.role === 'Admin' 
                                                            ? 'text-white rounded-br-lg'
                                                            : 'bg-white border text-gray-800 rounded-bl-lg'
                                                    }`} style={{
                                                        backgroundColor: msg.sender.role === 'Admin' ? styles.primary : 'white',
                                                        borderColor: styles.borderMain
                                                    }}>
                                                        <div className="flex items-center mb-2">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mr-3 ${
                                                                msg.sender.role === 'Admin' 
                                                                    ? 'bg-white/20 text-white' 
                                                                    : 'text-white'
                                                            }`} style={{
                                                                backgroundColor: msg.sender.role === 'Admin' ? 'rgba(255,255,255,0.2)' : styles.primary
                                                            }}>
                                                                {msg.sender.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className={`text-sm font-medium ${
                                                                msg.sender.role === 'Admin' ? 'text-white/90' : ''
                                                            }`} style={{
                                                                color: msg.sender.role === 'Admin' ? 'rgba(255,255,255,0.9)' : styles.textSecondary
                                                            }}>
                                                                {msg.sender.username}
                                                            </span>
                                                        </div>
                                                        <p className="leading-relaxed whitespace-pre-wrap">
                                                            {msg.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reply Form with Formik Validation */}
                                    {!selectedInquiry.isClosed && (
                                        <div 
                                            className="p-6 border-t"
                                            style={{ backgroundColor: 'white', borderColor: styles.borderMain }}
                                        >
                                            <Formik
                                                initialValues={{ reply: '' }}
                                                validationSchema={ReplySchema}
                                                onSubmit={handleReplySubmit}
                                            >
                                                {({ isSubmitting, errors, touched }) => (
                                                    <Form>
                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                            <div className="flex-1">
                                                                <Field
                                                                    as="textarea"
                                                                    name="reply"
                                                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                                                                        errors.reply && touched.reply ? 'border-red-500' : 'border-gray-300'
                                                                    }`}
                                                                    style={{ borderColor: styles.borderMain }}
                                                                    onFocus={(e) => {
                                                                        if (!(errors.reply && touched.reply)) {
                                                                            e.target.style.borderColor = styles.primary;
                                                                            e.target.style.boxShadow = `0 0 0 2px ${styles.primary}33`;
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        if (!(errors.reply && touched.reply)) {
                                                                            e.target.style.borderColor = styles.borderMain;
                                                                            e.target.style.boxShadow = 'none';
                                                                        }
                                                                    }}
                                                                    rows="3"
                                                                    placeholder="Type your reply as an admin..."
                                                                />
                                                                <ErrorMessage name="reply" component="div" className="text-red-500 text-xs mt-2" />
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                style={{ backgroundColor: styles.primary }}
                                                                onMouseEnter={(e) => { e.target.style.backgroundColor = styles.primaryHover; }}
                                                                onMouseLeave={(e) => { e.target.style.backgroundColor = styles.primary; }}
                                                            >
                                                                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                                                </svg>
                                                                {isSubmitting ? 'Sending...' : 'Send Reply'}
                                                            </button>
                                                        </div>
                                                    </Form>
                                                )}
                                            </Formik>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <div 
                                        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                                        style={{ backgroundColor: styles.secondary }}
                                    >
                                        <svg className="w-10 h-10" style={{ color: styles.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2" style={{ color: styles.textMain }}>
                                        Select an Inquiry
                                    </h3>
                                    <p style={{ color: styles.textSecondary }}>
                                        Choose an inquiry from the list to view details and respond to customers
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInquiries;
