import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Public Pages
import Home from "./components/Home";
import Register from "./pages/Register";
import UserLogin from "./components/global/UserLogin";
import AdminLogin from "./components/admin/AdminLogin";
import SupplierRegistration from "./components/supplier/SupplierRegistration";
import BuyerRegistration from "./components/buyer/BuyerRegistration";
import NotFound from "./pages/NotFound";

// Product Pages
import Products from "./pages/Products";
import ProductDetails from "./components/global/ProductDetails";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";

// Subcategory Pages
import PlasticAndPapersSubcategories from "./pages/PlasticAndPapersSubcategories";
import SaudiManufacturedSubcategories from "./pages/SaudiManufacturedSubcategories";
import ConstructionSubcategories from "./pages/ConstructionSubcategories";
import EquipmentSubcategories from "./pages/EquipmentSubcategories";

// Buyer Pages
import CartPage from "./components/cart/CartPage";
import CheckoutPage from "./components/checkout/CheckOutPage";
import BuyerDashboard from "./components/buyer/BuyerDashboard";

// Admin Pages
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminAddProducts from "./components/admin/AdminAddProducts";
import AdminEditProducts from "./components/admin/AdminEditProducts";

// Supplier Pages
import SupplierDashboard from "./components/supplier/SupplierDashboard";
import SupplierProductsPage from "./components/supplier/SupplierProductsPage";
import SupplierAddProducts from "./components/supplier/SupplierAddProducts";
import SupplierEditProducts from "./components/supplier/SupplierEditProducts";

// Employee Pages
import EmployeeLoginPage from "./pages/EmployeeLoginPage";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";

// Policies and Legal
import TermsAndConditions from "./components/global/TermsAndConditions";
import UpdatedTermsAndConditions from "./pages/UpdatedTermsAndConditions";
import PrivacyPolicy from "./components/global/PrivacyPolicy";
import UpdatedPrivacyPolicy from "./pages/UpdatedPrivacyPolicy";

// RFQ and Orders
import RfqPage from "./pages/RfqPage";
import OrdersPage from "./components/orders/OrdersPage";
import ReviewInvoice from "./components/checkout/ReviewInvoice";

// Checkout
import PaymentDetailsPage from "./components/checkout/PaymentDetailsPage";
import PaymentSuccess from "./components/checkout/PaymentSuccess";
import PaymentFailed from "./components/checkout/PaymentFailed";
import SadadPayment from "./components/checkout/SadadPayment";

// Chats
import RfqChat from "./components/chat/RfqChat";
import CartChat from "./components/chat/CartChat";
import OrderChat from "./components/chat/OrderChat";
import ProductChat from "./components/chat/ProductChat";

// Auth Guard
import PrivateRoute from "./utils/PrivateRoute";
import LoadingSpinner from "./components/global/LoadingSpinner";
import UserMessages from "./components/global/UserMessages";
import BecomeSupplierForm from "./pages/BecomeSupplierForm";
import SuppliersPage from "./pages/SuppliersPage";
import HelpCenter from "./pages/HelpCenter";
import SupplierSuccess from "./pages/SupplierSuccess";

export const AppRoutes = ({ googleMapsApiKey }) => {
  const [userRole, setUserRole] = useState(null);
  const [supplierId, setSupplierId] = useState("");

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        {/* Public Pages */}
        <Route index element={<Home />} />
        <Route path='products' element={<Products />} />
        <Route path='product/:id' element={<ProductDetails />} />
        <Route path='categories' element={<Categories />} />
        <Route path='category/:slug' element={<CategoryPage />} />

        <Route
          path='plastic-and-papers'
          element={<PlasticAndPapersSubcategories />}
        />
        <Route
          path='saudi-manufactured'
          element={<SaudiManufacturedSubcategories />}
        />
        <Route path='construction' element={<ConstructionSubcategories />} />
        <Route path='equipment' element={<EquipmentSubcategories />} />
        <Route path='loading' element={<LoadingSpinner />} />

        {/* Auth */}
        <Route path='register' element={<Register />} />
        <Route path='user-login' element={<UserLogin />} />
        <Route path='supplier' element={<SupplierRegistration />} />
        <Route path='buyer' element={<BuyerRegistration />} />
        <Route path='admin-login' element={<AdminLogin />} />
        <Route
          path='employee-login'
          element={
            <EmployeeLoginPage
              setUserRole={setUserRole}
              setSupplierId={setSupplierId}
            />
          }
        />

        {/* Dashboard Pages */}
        <Route
          path='buyer-dashboard'
          element={
            <PrivateRoute role='buyer'>
              <BuyerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='supplier-dashboard'
          element={
            <PrivateRoute role='supplier'>
              <SupplierDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='admin-dashboard'
          element={
            <PrivateRoute role='admin'>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='employee-dashboard'
          element={
            <EmployeeDashboard userRole={userRole} supplierId={supplierId} />
          }
        />

        {/* Admin Management */}
        <Route
          path='admin-add-products'
          element={
            <PrivateRoute role='admin'>
              <AdminAddProducts />
            </PrivateRoute>
          }
        />
        <Route
          path='admin-edit-products/:productId'
          element={
            <PrivateRoute role='admin'>
              <AdminEditProducts />
            </PrivateRoute>
          }
        />

        {/* Supplier Management */}
        <Route path='supplier/:supplierId' element={<SupplierProductsPage />} />
        <Route
          path='supplier-add-products'
          element={
            <PrivateRoute role='supplier'>
              <SupplierAddProducts />
            </PrivateRoute>
          }
        />
        <Route
          path='supplier-edit-products/:productId'
          element={
            <PrivateRoute role='supplier'>
              <SupplierEditProducts />
            </PrivateRoute>
          }
        />

        {/* Checkout and Payment */}
        <Route path='payment-success' element={<PaymentSuccess />} />
        <Route path='payment-failed' element={<PaymentFailed />} />
        <Route path='payment-details' element={<PaymentDetailsPage />} />
        <Route path='review-invoice/:billNumber' element={<ReviewInvoice />} />
        <Route
          path='sadad-confirmation/:billNumber'
          element={<SadadPayment />}
        />
        <Route
          path='cart'
          element={
            <PrivateRoute role='buyer'>
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path='checkout'
          element={
            <PrivateRoute role='buyer'>
              <CheckoutPage googleMapsApiKey={googleMapsApiKey} />
            </PrivateRoute>
          }
        />

        {/* RFQ & Orders */}
        <Route
          path='rfq'
          element={
            <PrivateRoute roles={["supplier", "buyer"]}>
              <RfqPage />
            </PrivateRoute>
          }
        />
        <Route path='orders' element={<OrdersPage />} />

        {/* Chats */}
        <Route path='rfq-chat/:chatId' element={<RfqChat />} />
        <Route path='cart-chat/:chatId' element={<CartChat />} />
        <Route path='order-chat/:chatId' element={<OrderChat />} />
        <Route path='product-chat/:chatId' element={<ProductChat />} />

        {/* Legal */}
        <Route path='terms-and-conditions' element={<TermsAndConditions />} />
        <Route
          path='updated-terms-and-conditions'
          element={<UpdatedTermsAndConditions />}
        />
        <Route path='privacy-policy' element={<PrivacyPolicy />} />
        <Route
          path='updated-privacy-policy'
          element={<UpdatedPrivacyPolicy />}
        />

        <Route path='user-messages' element={<UserMessages />} />

        <Route path='become-supplier' element={<BecomeSupplierForm />} />

        <Route path='top-supplier' element={<SuppliersPage />} />

        <Route path='help-center' element={<HelpCenter />} />

        <Route path='supplier-success' element={<SupplierSuccess />} />

        {/* Fallback */}
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  );
};
