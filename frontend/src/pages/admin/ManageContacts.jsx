import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Download, Search, X, Mail, User, Phone, MessageSquare, FileText, Inbox } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ManageContacts = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch contacts from backend
    const fetchContacts = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('/api/contacts', config);
            setContacts(res.data);
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [user]);

    // Delete contact
    const handleDelete = async (contact) => {
        if (!user?.token) return;
        if (window.confirm(`Are you sure you want to delete the message from ${contact.fullName}?`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/contacts/${contact._id}`, config);
                fetchContacts();
            } catch (error) {
                console.error("Failed to delete contact:", error);
            }
        }
    };

    // Open modal to view contact
    const handleEdit = (contact) => {
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    // Filter contacts based on search
    const filteredContacts = contacts.filter(contact =>
        contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Generate PDF report with enhanced visual appeal
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
        doc.text("Contact Messages Report", 25, 18);
        
        // Date and time in top right
        doc.setFontSize(9);
        doc.text(`Generated: ${dateStr} at ${timeStr}`, 140, 13);
        doc.text(`Total Records: ${contacts.length}`, 140, 18);
        
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
        doc.text(`This report contains ${contacts.length} contact messages from customers.`, 14, 52);
        doc.text("All contact information is confidential and should be handled accordingly.", 14, 58);
        
        // Table data
        const tableColumn = ["Full Name", "Email", "Phone", "Subject", "Message"];
        const tableRows = contacts.map(contact => [
            contact.fullName || 'N/A',
            contact.email || 'N/A',
            contact.phoneNumber || 'N/A',
            contact.subject || 'N/A',
            // Truncate long messages for better table layout
            contact.message ? (contact.message.length > 60 ? contact.message.substring(0, 60) + '...' : contact.message) : 'N/A'
        ]);
        
        // Enhanced AutoTable styling
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
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
                0: { cellWidth: 30 }, // Full Name
                1: { cellWidth: 40 }, // Email
                2: { cellWidth: 25 }, // Phone
                3: { cellWidth: 35 }, // Subject
                4: { cellWidth: 60 }, // Message
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
                doc.text("© 2024 Fabricate - Customer Contact Management System", 14, pageHeight - 12);
                
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
        const finalY = doc.lastAutoTable.finalY || 70;
        if (finalY < 250) { // If there's space on the last page
            doc.setTextColor(...secondaryColor);
            doc.setFontSize(8);
            doc.text("End of Report", 14, finalY + 20);
            doc.setTextColor(...primaryColor);
            doc.text("━━━━━━━━━━━━", 14, finalY + 25);
        }
        
        // Save the PDF
        doc.save(`Fabricate_Contacts_Report_${dateStr.replace(/\//g, '-')}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Page Title Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Mail className="w-7 h-7" />
                                Contact Messages Management
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                    <span className="text-blue-500 font-semibold text-sm">
                                        Total: {contacts.length}
                                    </span>
                                </div>
                                <button
                                    onClick={generatePDF}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contacts by name, email, or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Search Results Counter */}
                    {searchTerm && (
                        <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">{filteredContacts.length}</span> of <span className="font-semibold">{contacts.length}</span> contacts match your search
                                {filteredContacts.length === 0 && (
                                    <span className="ml-2 text-blue-600">- Try adjusting your search terms</span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Contacts Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        {filteredContacts.length === 0 ? (
                            <div className="text-center py-16">
                                <Inbox className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No contact messages found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Contact messages will appear here'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    Full Name
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    Email
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    Phone
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Subject
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Message
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredContacts.map(contact => (
                                            <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">{contact.fullName}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{contact.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{contact.phoneNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">{contact.subject}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                                                    {contact.message}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(contact)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow transform hover:-translate-y-0.5"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            <span className="text-xs font-medium">View</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(contact)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow transform hover:-translate-y-0.5"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            <span className="text-xs font-medium">Delete</span>
                                                        </button>
                                                    </div>
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

            {/* View Contact Modal */}
            <Modal title="View Contact Message" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {selectedContact && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold mb-2">
                                <User className="w-3 h-3" />
                                FULL NAME
                            </div>
                            <p className="text-sm text-gray-900 font-semibold">{selectedContact.fullName}</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold mb-2">
                                <Mail className="w-3 h-3" />
                                EMAIL
                            </div>
                            <p className="text-sm text-gray-900 font-semibold break-all">{selectedContact.email}</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold mb-2">
                                <Phone className="w-3 h-3" />
                                PHONE
                            </div>
                            <p className="text-sm text-gray-900 font-semibold">{selectedContact.phoneNumber}</p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold mb-2">
                                <FileText className="w-3 h-3" />
                                SUBJECT
                            </div>
                            <p className="text-sm text-gray-900 font-semibold">{selectedContact.subject}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 text-xs text-blue-700 font-bold mb-2">
                                <MessageSquare className="w-3 h-3" />
                                MESSAGE
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ManageContacts;