import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Products from "./AdminProducts";
import Suppliers from "./AdminSuppliersAdd";
import Settings from "./AdminSettings";
import BuyerList from "./BuyerList";
import AdminMessages from "./AdminMessages";
import AdminTransactions from "./AdminTransactions";
import { Menu } from "react-feather";

const AdminDashboard = () => {
  const auth = getAuth();
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [selectedPage, setSelectedPage] = useState(
    () => localStorage.getItem("selectedPage") || "dashboard"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser || userData?.role !== "admin") {
      navigate("/admin-login");
    }
  }, [auth.currentUser, userData, navigate]);

  useEffect(() => {
    localStorage.setItem("selectedPage", selectedPage);
  }, [selectedPage]);

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return (
          <h2 className='text-xl font-bold text-[#2c6449]'>
            Welcome to Admin Dashboard
          </h2>
        );
      case "transactions":
        return <AdminTransactions />;

      case "products":
        return <Products />;
      case "settings":
        return <Settings />;
      case "suppliers":
        return <Suppliers />;
      case "buyers":
        return <BuyerList />;
      case "messages":
        return <AdminMessages />;
      case "admins":
        return (
          <h2 className='text-lg font-semibold text-green-600'>
            Admins Management
          </h2>
        );
      case "product-library":
        return (
          <h2 className='text-lg font-semibold text-blue-600'>
            Product Library
          </h2>
        );
      case "orders":
        return (
          <h2 className='text-lg font-semibold text-amber-600'>
            Manage Orders
          </h2>
        );
      case "abandoned-carts":
        return (
          <h2 className='text-lg font-semibold text-red-600'>
            Abandoned Carts
          </h2>
        );
      case "analytics-overview":
        return (
          <h2 className='text-lg font-semibold text-purple-600'>
            Analytics Overview
          </h2>
        );
      case "live-analytics":
        return (
          <h2 className='text-lg font-semibold text-cyan-600'>
            Live Analytics
          </h2>
        );
      case "analytics-reports":
        return (
          <h2 className='text-lg font-semibold text-yellow-500'>
            Analytics Reports
          </h2>
        );
      case "seo-enhancements":
        return (
          <h2 className='text-lg font-semibold text-green-600'>
            SEO Enhancements
          </h2>
        );
      case "promo-code":
        return (
          <h2 className='text-lg font-semibold text-sky-500'>
            Promo Code Management
          </h2>
        );
      case "coupon-code":
        return (
          <h2 className='text-lg font-semibold text-yellow-500'>
            Coupon Code Management
          </h2>
        );
      default:
        return (
          <h2 className='text-lg font-semibold text-red-600'>Page Not Found</h2>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col lg:flex-row'>
      {/* Mobile Header */}
      <div className='lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md'>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='text-[#2c6449]'
        >
          <Menu />
        </button>
        <h1 className='text-base font-semibold text-[#2c6449]'>Admin Panel</h1>
      </div>

      {/* Sidebar (Desktop + Mobile Toggle) */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } lg:block w-full lg:w-60 bg-white border-r shadow-sm`}
      >
        <AdminSidebar
          selectedPage={selectedPage}
          onTabClick={(page) => {
            setSelectedPage(page);
            setSidebarOpen(false); // close mobile menu
          }}
        />
      </div>

      {/* Main Content */}
      <main className='flex-1 p-4 md:p-6'>
        <div className='bg-white rounded shadow-sm p-4 md:p-6'>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
