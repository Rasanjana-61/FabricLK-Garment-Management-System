import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSearch,
  FaBoxOpen,
  FaShoppingCart,
  FaUser,
  FaCalendar,
  FaInbox,
  FaArrowLeft,
} from "react-icons/fa";
import { AiOutlineWarning } from "react-icons/ai";
// New imports for toast notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Mock auth hook for demonstration
const useAuth = () => ({
  user: {
    isAdmin: true,
  },
});

function ConfirmOrderAdmin() {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");

  const fetchAllOrdersAndProducts = async () => {
    try {
      setLoading(true);
      const ordersRes = await axios.get("http://localhost:5000/api/orders");
      const orders = ordersRes.data;
      setAllOrders(orders);

      const productIds = [
        ...new Set(
          orders
            .map((o) => o.customerOrderDetails?.productId || o.product?._id)
            .filter(Boolean)
        ),
      ];
      const productPromises = productIds.map((id) =>
        axios.get(`http://localhost:5000/api/products/${id}`)
      );
      const productsRes = await Promise.all(productPromises);
      const productsMap = productsRes.reduce((acc, res) => {
        acc[res.data._id] = res.data;
        return acc;
      }, {});

      setAllProducts(productsMap);
    } catch (err) {
      console.error("💥 Error fetching admin order data:", err);
      const errorMessage = "Failed to load order data. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrdersAndProducts();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const originalOrder = allOrders.find((o) => o._id === orderId);
      if (!originalOrder) throw new Error("Order not found.");

      const updatedOrderPayload = { ...originalOrder, status };
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        updatedOrderPayload
      );

      setAllOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      toast.success(`Order #${orderId.substring(0, 8)}... has been ${status}.`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        `Failed to update order #${orderId.substring(0, 8)}...`;
      toast.error(errorMessage);
      console.error(`💥 Failed to update order ${orderId}:`, err);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      confirmed: {
        className: "bg-gradient-to-r from-green-500 to-green-600",
        icon: <FaCheckCircle className="w-3 h-3" />,
      },
      pending: {
        className: "bg-gradient-to-r from-amber-500 to-orange-600",
        icon: <FaHourglassHalf className="w-3 h-3" />,
      },
      rejected: {
        className: "bg-gradient-to-r from-red-500 to-red-600",
        icon: <FaTimesCircle className="w-3 h-3" />,
      },
    };
    return styles[status.toLowerCase()] || styles.pending;
  };

  const filteredOrders = allOrders.filter((o) => {
    const product = allProducts[o.customerOrderDetails?.productId];
    const productName = product?.name || "";
    const customerName = o.customerOrderDetails?.customerName || "";
    const orderId = o._id || "";

    return (
      productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      orderId.toLowerCase().includes(orderSearch.toLowerCase())
    );
  });

  const generatePDF = () => {
    const doc = new jsPDF();

    const primaryColor = [59, 130, 246];
    const secondaryColor = [75, 85, 99];
    const lightBlue = [239, 246, 255];
    const darkBlue = [30, 58, 138];
    const darkGray = [17, 24, 39];

    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    doc.setFillColor(...lightBlue);
    doc.rect(0, 0, 210, 35, "F");

    doc.setFillColor(...darkBlue);
    doc.rect(14, 8, 6, 6, "F");

    doc.setTextColor(...darkGray);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("", 25, 13);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text("Orders Management Report", 25, 18);

    doc.setFontSize(9);
    doc.text(`Generated: ${dateStr} at ${timeStr}`, 140, 13);
    doc.text(`Total Orders: ${filteredOrders.length}`, 140, 18);

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Report Summary", 14, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(
      `This report contains ${filteredOrders.length} order records with their current status.`,
      14,
      52
    );

    const statusCounts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    let yPosition = 58;
    doc.text("Status Breakdown:", 14, yPosition);
    yPosition += 6;

    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`• ${status}: ${count}`, 20, yPosition);
      yPosition += 5;
    });

    const tableColumn = ["Order ID", "Customer", "Product", "Date", "Status"];
    const tableRows = filteredOrders.map((order) => [
      order._id.substring(0, 10) + "...",
      order.customerOrderDetails?.customerName || "N/A",
      allProducts[order.customerOrderDetails?.productId]?.name || "N/A",
      new Date(order.orderedAt).toLocaleDateString(),
      order.status || "N/A",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPosition + 10,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: darkGray,
        lineColor: [209, 213, 219],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function (data) {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFillColor(...lightBlue);
        doc.rect(0, pageHeight - 20, 210, 20, "F");

        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;

        doc.setTextColor(...secondaryColor);
        doc.setFontSize(8);
        doc.text(
          "© 2024 Fabricate - Order Management System",
          14,
          pageHeight - 12
        );

        doc.setTextColor(...darkGray);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Page ${pageNumber} of ${pageCount}`,
          196 - doc.getTextWidth(`Page ${pageNumber} of ${pageCount}`),
          pageHeight - 12
        );

        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 18, 196, pageHeight - 18);
      },
    });

    const finalY = doc.lastAutoTable.finalY || yPosition + 10;
    if (finalY < 250) {
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(8);
      doc.text("End of Report", 14, finalY + 20);
      doc.setTextColor(...primaryColor);
      doc.text("━━━━━━━━━━━━", 14, finalY + 25);
    }

    doc.save(`Fabricate_Orders_Report_${dateStr.replace(/\//g, "-")}.pdf`);
  };

  const getStatusCounts = () => ({
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status.toLowerCase() === "pending")
      .length,
    confirmed: allOrders.filter((o) => o.status.toLowerCase() === "confirmed")
      .length,
    rejected: allOrders.filter((o) => o.status.toLowerCase() === "rejected")
      .length,
  });

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-12 rounded-xl shadow-2xl text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Orders...</p>
        </div>
      </div>
    );
  }

  if (error && allOrders.length === 0) {
    // Only show full-page error on initial load failure
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-12 rounded-xl shadow-2xl text-center max-w-md">
          <AiOutlineWarning className="text-6xl text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-xl font-semibold mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={generatePDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
          >
            Generate PDF Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaShoppingCart className="w-7 h-7" />
                Order Management
              </h2>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <span className="text-blue-500 font-semibold text-sm">
                  Total: {statusCounts.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-100 border-l-4 border-orange-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Pending Orders
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {statusCounts.pending}
                  </p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg">
                  <FaHourglassHalf className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Confirmed Orders
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {statusCounts.confirmed}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <FaCheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Rejected Orders
                  </p>
                  <p className="text-3xl font-bold text-red-700">
                    {statusCounts.rejected}
                  </p>
                </div>
                <div className="bg-red-500 p-3 rounded-lg">
                  <FaTimesCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaBoxOpen className="w-5 h-5 text-blue-600" />
                All Orders ({filteredOrders.length})
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by product, customer, or ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full sm:w-80 py-2.5 pl-10 pr-4 rounded-lg border-2 border-gray-300 text-sm font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <FaInbox className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No orders found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {orderSearch
                    ? "Try adjusting your search query"
                    : "Orders will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const product =
                        allProducts[order.customerOrderDetails?.productId];
                      const statusStyle = getStatusStyle(order.status);
                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  product?.img ||
                                  "https://placehold.co/100x100/e2e8f0/e2e8f0"
                                }
                                alt={product?.name}
                                className="w-14 h-14 rounded-lg object-cover shadow-sm border"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {product?.name || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs font-mono text-gray-500">
                              {order._id.substring(0, 12)}...
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="bg-purple-100 p-1.5 rounded">
                                <FaUser className="w-3 h-3 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {order.customerOrderDetails?.customerName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.customerOrderDetails?.customerEmail}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaCalendar className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(order.orderedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${statusStyle.className}`}
                            >
                              {statusStyle.icon}
                              <span>{order.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {order.status.toLowerCase() === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order._id, "confirmed")
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm text-xs font-medium"
                                >
                                  <FaCheckCircle className="w-3 h-3" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order._id, "rejected")
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm text-xs font-medium"
                                >
                                  <FaTimesCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 font-medium italic">
                                Action Taken
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmOrderAdmin;
