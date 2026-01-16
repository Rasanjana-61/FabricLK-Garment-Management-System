// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDeliveries from "./pages/admin/ManageDeliveries";
import ManageDrivers from "./pages/admin/ManageDrivers";
import ManageVehicles from "./pages/admin/ManageVehicles";
import ManageFaqs from "./pages/admin/ManageFaqs";
import AdminInquiries from "./pages/admin/AdminInquiries";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MyOrders from "./pages/customer/MyOrders";
import MyReviews from "./pages/customer/MyReviews";
import ViewFaqs from "./pages/customer/ViewFaqs";
import CustomerInquiries from "./pages/customer/CustomerInquiries";
import { useAuth } from "./hooks/useAuth";
import ContactUs from "./pages/customer/ContactUs";
import ManageContacts from "./pages/admin/ManageContacts";

// HR manager
import HRdashboard from "./pages/hrmanager/HRdashboard";
import HRLayout from "./layouts/HRLayout";
import AddEmployee from "./pages/hrmanager/AddEmployee";
import DisplayEmployees from "./pages/hrmanager/DisplayEmployees";
import GenerateReport from "./pages/hrmanager/GenerateReport";
import UpdateEmployee from "./pages/hrmanager/UpdateEmployee";
import HRprofile from "./pages/hrmanager/HRprofile";

// Finance manager pages
import FinanceLayout from "./layouts/Financelayout";
import FinanceDashboard from "./pages/financialmanager/Financialdashboard";
import Expenses from "./pages/financialmanager/Expenses";
import Incomes from "./pages/financialmanager/Incomes";
import Salaries from "./pages/financialmanager/Salaries";
import TaxCompliance from "./pages/financialmanager/TaxCompliance";
import FinanceProfile from "./pages/financialmanager/FinanceProfile";

import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import ProductPage from "./pages/admin/ProductPage";
import OrderReview from "./pages/customer/OrderReview";
import OrderDetails from "./pages/customer/OrderDetails";
import ConfirmOrderAdmin from "./pages/admin/ConfirmOrderAdmin";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import MyOrdersDisplay from "./pages/customer/MyOrdersDisplay";
import SupplierRegister from "./pages/admin/SupplierRegister";
import SupplierForm from "./pages/supplier/SupplierForm";
import SupplierLayout from "./layouts/SupplierLayout";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierFormSubmissions from "./pages/admin/SupplierFormSubmissions.JSX";

import Profile from "./pages/Profile";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { user } = useAuth();

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order-review/:id" element={<OrderReview />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          <Route path="faqs" element={<ViewFaqs />} />
          <Route path="contactus" element={<ContactUs />} />

          {/* Shared profile route for ALL logged-in users */}
          <Route
            path="profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            user?.role === "Admin" ? <AdminLayout /> : <Navigate to="/login" />
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="deliveries" element={<ManageDeliveries />} />
          <Route path="drivers" element={<ManageDrivers />} />
          <Route path="vehicles" element={<ManageVehicles />} />
          <Route path="faqs" element={<ManageFaqs />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="contacts" element={<ManageContacts />} />
          <Route path="product" element={<ProductPage />} />
          <Route path="orders" element={<ConfirmOrderAdmin />} />
          <Route path="supplier-register" element={<SupplierRegister />} />
          <Route
            path="supplier-form-submitions"
            element={<SupplierFormSubmissions />}
          />
        </Route>

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            user?.role === "Customer" ? (
              <CustomerLayout />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="inquiries" element={<CustomerInquiries />} />
          <Route path="my-order-display" element={<MyOrdersDisplay />} />
          <Route
            path="payment-confirmation/:id"
            element={<PaymentConfirmation />}
          />
        </Route>

        {/* Supplier Routes */}
        <Route
          path="/supplier"
          element={
            user?.role === "Supplier" ? (
              <SupplierLayout />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<SupplierDashboard />} />
          <Route path="supplier-forms" element={<SupplierForm />} />
        </Route>

        {/* HR Manager Routes */}
        <Route
          path="/hrmanager"
          element={
            user?.role === "hrmanager" ? <HRLayout /> : <Navigate to="/login" />
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<HRdashboard />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="our-employees" element={<DisplayEmployees />} />
          <Route path="GenerateReport" element={<GenerateReport />} />
          <Route path="employee/update/:id" element={<UpdateEmployee />} />
          <Route path="profile" element={<HRprofile />} />
        </Route>

        {/* Finance Manager Routes */}
        <Route
          path="/financialmanager"
          element={
            user?.role === "financialmanager" ? (
              <FinanceLayout />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<FinanceDashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="incomes" element={<Incomes />} />
          <Route path="salaries" element={<Salaries />} />
          <Route path="tax-compliance" element={<TaxCompliance />} />
          <Route path="profile" element={<FinanceProfile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
