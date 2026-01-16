import React, { useState, useEffect } from 'react';
import { PlusCircle, Download, Search, X, Package, User, MapPin, Truck, FileText } from 'lucide-react';
// Imports for validation and toast notifications
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Assuming these components exist in your project
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Validation Schema for the Add Delivery form using Yup
const DeliverySchema = Yup.object().shape({
    orderId: Yup.string().required('An order must be selected.'),
    pickupAddress: Yup.string()
        .trim()
        .min(10, 'Pickup address must be at least 10 characters long.')
        .required('Pickup address is required.'),
    deliveryAddress: Yup.string()
        .trim()
        .min(10, 'Delivery address must be at least 10 characters long.')
        .required('Delivery address is required.'),
    customerId: Yup.string().required('A customer must be linked to the order.'),
});

const ManageDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    const initialFormState = { orderId: '', pickupAddress: '', deliveryAddress: '', customerId: '' };

    const statusClasses = {
        'Processing': 'bg-amber-50 border-amber-200 text-amber-700',
        'Started': 'bg-blue-50 border-blue-200 text-blue-700',
        'On the Way': 'bg-indigo-50 border-indigo-200 text-indigo-700',
        'Delivered': 'bg-green-50 border-green-200 text-green-700',
        'Cancelled': 'bg-red-50 border-red-200 text-red-700',
    };

    const fetchData = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [delRes, driRes, vehRes, custRes, ordRes] = await Promise.all([
                fetch('/api/deliveries', config),
                fetch('/api/drivers', config),
                fetch('/api/vehicles', config),
                fetch('/api/users', config),
                fetch('http://localhost:5000/api/orders', config), 
            ]);

            if (!delRes.ok || !driRes.ok || !vehRes.ok || !custRes.ok || !ordRes.ok) {
                const errorResponses = [delRes, driRes, vehRes, custRes, ordRes].filter(res => !res.ok);
                const errorMessages = await Promise.all(errorResponses.map(res => res.json().then(data => data.message || `Status ${res.status}`)));
                throw new Error(`Failed to fetch data: ${errorMessages.join(', ')}`);
            }

            const deliveriesData = await delRes.json();
            const driversData = await driRes.json();
            const vehiclesData = await vehRes.json();
            const customersData = await custRes.json();
            const ordersData = await ordRes.json(); 

            setDeliveries(deliveriesData);
            setDrivers(driversData);
            setVehicles(vehiclesData);
            setCustomers(customersData.filter(u => u.role === 'Customer'));
            setOrders(ordersData); 
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to load dashboard data.');
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleUpdate = async (id, field, value) => {
        try {
            const res = await fetch(`/api/deliveries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ [field]: value })
            });
            if (res.ok) {
                toast.success('Delivery updated successfully!');
                fetchData();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update delivery.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };
    
    const handleAddSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = {
                orderId: values.orderId,
                pickupAddress: values.pickupAddress,
                deliveryAddress: values.deliveryAddress,
                customer: values.customerId
            };
            const response = await fetch('/api/deliveries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Failed to create delivery.' }));
                throw new Error(errData.message);
            }
            toast.success('New delivery created successfully!');
            fetchData();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredDeliveries = deliveries.filter(delivery =>
        delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customer?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.vehicle?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generatePDF = () => {
        const doc = new jsPDF();
        
        // Define colors - Blue Theme
        const primaryColor = [59, 130, 246]; // Blue-500
        const secondaryColor = [75, 85, 99]; // Gray-600
        const lightBlue = [239, 246, 255]; // Blue-50
        const darkBlue = [30, 58, 138]; // Blue-800
        const darkGray = [17, 24, 39]; // Gray-900
        
        // Current date and time
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();
        
        // Add colored header background
        doc.setFillColor(...lightBlue);
        doc.rect(0, 0, 210, 35, 'F');
        
        // Company logo area (colored rectangle as placeholder)
        doc.setFillColor(...darkBlue);
        doc.rect(14, 8, 6, 6, 'F');
        
        // Header text
        doc.setTextColor(...darkGray);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("Fabricate", 25, 13);
        
        // Subtitle
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...secondaryColor);
        doc.text("Deliveries Management Report", 25, 18);
        
        // Date and time in top right
        doc.setFontSize(9);
        doc.text(`Generated: ${dateStr} at ${timeStr}`, 140, 13);
        doc.text(`Total Deliveries: ${filteredDeliveries.length}`, 140, 18);
        
        // Add a thin line separator
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(14, 25, 196, 25);
        
        // Summary section
        doc.setTextColor(...darkGray);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Report Summary", 14, 45);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.text(`This report contains ${filteredDeliveries.length} delivery records with current status and assignments.`, 14, 52);
        
        // Status breakdown
        const statusCounts = filteredDeliveries.reduce((acc, delivery) => {
            acc[delivery.status] = (acc[delivery.status] || 0) + 1;
            return acc;
        }, {});
        
        let yPosition = 58;
        doc.text("Status Breakdown:", 14, yPosition);
        yPosition += 6;
        
        Object.entries(statusCounts).forEach(([status, count]) => {
            doc.text(`• ${status}: ${count}`, 20, yPosition);
            yPosition += 5;
        });
        
        // Table data
        const tableColumn = ["Order ID", "Customer", "Pickup Address", "Delivery Address", "Driver", "Vehicle", "Status"];
        const tableRows = filteredDeliveries.map(delivery => [
            delivery.orderId || 'N/A',
            delivery.customer?.username || 'N/A',
            delivery.pickupAddress ? (delivery.pickupAddress.length > 30 ? delivery.pickupAddress.substring(0, 30) + '...' : delivery.pickupAddress) : 'N/A',
            delivery.deliveryAddress ? (delivery.deliveryAddress.length > 30 ? delivery.deliveryAddress.substring(0, 30) + '...' : delivery.deliveryAddress) : 'N/A',
            delivery.driver?.name || 'Unassigned',
            delivery.vehicle?.plateNumber || 'Unassigned',
            delivery.status || 'N/A'
        ]);
        
        // Enhanced AutoTable styling
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPosition + 10,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: darkGray,
                lineColor: [209, 213, 219], // Gray-300
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251], // Gray-50
            },
            columnStyles: {
                0: { cellWidth: 20 }, // Order ID
                1: { cellWidth: 25 }, // Customer
                2: { cellWidth: 35 }, // Pickup Address
                3: { cellWidth: 35 }, // Delivery Address
                4: { cellWidth: 25 }, // Driver
                5: { cellWidth: 20 }, // Vehicle
                6: { cellWidth: 20 }, // Status
            },
            margin: { left: 14, right: 14 },
            didDrawPage: function (data) {
                // Footer background
                const pageHeight = doc.internal.pageSize.getHeight();
                doc.setFillColor(...lightBlue);
                doc.rect(0, pageHeight - 20, 210, 20, 'F');
                
                // Footer content
                const pageCount = doc.getNumberOfPages();
                const pageNumber = doc.getCurrentPageInfo().pageNumber;
                
                // Company info in footer
                doc.setTextColor(...secondaryColor);
                doc.setFontSize(8);
                doc.text("© 2024 Fabricate - Delivery Management System", 14, pageHeight - 12);
                
                // Page number
                doc.setTextColor(...darkGray);
                doc.setFont("helvetica", "bold");
                doc.text(
                    `Page ${pageNumber} of ${pageCount}`,
                    196 - doc.getTextWidth(`Page ${pageNumber} of ${pageCount}`),
                    pageHeight - 12
                );
                
                // Add a thin line above footer
                doc.setDrawColor(...primaryColor);
                doc.setLineWidth(0.3);
                doc.line(14, pageHeight - 18, 196, pageHeight - 18);
            },
            didDrawCell: function(data) {
                // Add subtle borders to cells
                if (data.section === 'body') {
                    doc.setDrawColor(229, 231, 235); // Gray-200
                }
            }
        });
        
        // Add final page info if multiple pages
        const finalY = doc.lastAutoTable.finalY || yPosition + 10;
        if (finalY < 250) { // If there's space on the last page
            doc.setTextColor(...secondaryColor);
            doc.setFontSize(8);
            doc.text("End of Report", 14, finalY + 20);
            doc.setTextColor(...primaryColor);
            doc.text("━━━━━━━━━━━━", 14, finalY + 25);
        }
        
        // Save the PDF
        doc.save(`Fabricate_Deliveries_Report_${dateStr.replace(/\//g, '-')}.pdf`);
    };

    const assignedOrderIds = new Set(deliveries.map(d => d.orderId));
    const availableOrders = orders.filter(order => 
        order.status === 'confirmed' && !assignedOrderIds.has(order._id)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="max-w-7xl mx-auto">
                {/* Page Title Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Package className="w-7 h-7" />Delivery Management</h2>
                            <div className="flex items-center gap-3">
                                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg"><span className="text-blue-500 font-semibold text-sm">Total: {deliveries.length}</span></div>
                                <button onClick={generatePDF} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"><Download className="w-4 h-4" />Download PDF</button>
                                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"><PlusCircle className="w-4 h-4" />Add Delivery</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Search deliveries by Order ID, Customer, Address, Driver, Vehicle, or Status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>)}
                    </div>
                    {searchTerm && (<div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"><p className="text-sm text-blue-800"><span className="font-semibold">{filteredDeliveries.length}</span> of <span className="font-semibold">{deliveries.length}</span> deliveries match your search{filteredDeliveries.length === 0 && (<span className="ml-2 text-blue-600">- Try adjusting your search terms</span>)}</p></div>)}
                </div>

                {/* Deliveries Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        {filteredDeliveries.length === 0 ? (
                            <div className="text-center py-16">
                                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No deliveries found</p>
                                <p className="text-gray-400 text-sm mt-1">{searchTerm ? 'Try adjusting your search terms' : 'Add your first delivery to get started'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><div className="flex items-center gap-2"><FileText className="w-4 h-4" />Order ID</div></th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><div className="flex items-center gap-2"><User className="w-4 h-4" />Customer</div></th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><div className="flex items-center gap-2"><MapPin className="w-4 h-4" />Pickup</div></th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><div className="flex items-center gap-2"><MapPin className="w-4 h-4" />Delivery</div></th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><div className="flex items-center gap-2"><User className="w-4 h-4" />Driver</div></th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><div className="flex items-center gap-2"><Truck className="w-4 h-4" />Vehicle</div></th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><div className="flex items-center gap-2"><Package className="w-4 h-4" />Status</div></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredDeliveries.map(d => (
                                            <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm font-medium text-gray-900 font-mono ">{d.orderId}</span></td>
                                                <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-600">{d.customer?.username || 'N/A'}</span></td>
                                                <td className="px-4 py-3 text-sm text-gray-600 w-30 break-word">{d.pickupAddress}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 w-30 break-word">{d.deliveryAddress}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select value={d.driver?._id || ''} onChange={(e) => handleUpdate(d._id, 'driverId', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={d.status !== 'Processing'}>
                                                        <option value="">Assign Driver</option>
                                                        {drivers.filter(dr => dr.isAvailable || dr._id === d.driver?._id).map(dr => (<option key={dr._id} value={dr._id}>{dr.name}</option>))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select value={d.vehicle?._id || ''} onChange={(e) => handleUpdate(d._id, 'vehicleId', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={d.status !== 'Processing'}>
                                                        <option value="">Assign Vehicle</option>
                                                        {vehicles.filter(v => v.isAvailable || v._id === d.vehicle?._id).map(v => (<option key={v._id} value={v._id}>{v.plateNumber}</option>))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select value={d.status} onChange={(e) => handleUpdate(d._id, 'status', e.target.value)} className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-all ${statusClasses[d.status]}`}>
                                                        {['Processing', 'Started', 'On the Way', 'Delivered', 'Cancelled'].map(s => (<option key={s} value={s}>{s}</option>))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Delivery Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Delivery">
                <Formik initialValues={initialFormState} validationSchema={DeliverySchema} onSubmit={handleAddSubmit}>
                    {({ isSubmitting, setFieldValue, values }) => (
                        <Form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="orderId">Order ID</label>
                                <Field as="select" name="orderId" id="orderId"
                                    onChange={(e) => {
                                        const orderId = e.target.value;
                                        setFieldValue("orderId", orderId);
                                        const selectedOrder = orders.find(o => o._id === orderId);
                                        if (selectedOrder) {
                                            const customer = customers.find(c => c.email === selectedOrder.customerOrderDetails.customerEmail);
                                            const addr = selectedOrder.customerOrderDetails.address;
                                            const formattedAddr = addr ? `${addr.street || ''}, ${addr.street2 || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.zipCode || ''}, ${addr.country || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim() : '';
                                            setFieldValue("customerId", customer?._id || "");
                                            setFieldValue("deliveryAddress", formattedAddr);
                                        } else {
                                            setFieldValue("customerId", "");
                                            setFieldValue("deliveryAddress", "");
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select an Order</option>
                                    {availableOrders.map(order => (<option key={order._id} value={order._id}>{order._id}</option>))}
                                </Field>
                                <ErrorMessage name="orderId" component="p" className="mt-1 text-sm text-red-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerName">Customer</label>
                                <input type="text" id="customerName" value={customers.find(c => c._id === values.customerId)?.username || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600" />
                                <ErrorMessage name="customerId" component="p" className="mt-1 text-sm text-red-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pickupAddress">Pickup Address</label>
                                <Field as="textarea" name="pickupAddress" id="pickupAddress" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" rows="3" />
                                <ErrorMessage name="pickupAddress" component="p" className="mt-1 text-sm text-red-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deliveryAddress">Delivery Address</label>
                                <Field as="textarea" name="deliveryAddress" id="deliveryAddress" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" rows="3" />
                                <ErrorMessage name="deliveryAddress" component="p" className="mt-1 text-sm text-red-600" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Creating...' : 'Create Delivery'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </div>
    );
};

export default ManageDeliveries;

