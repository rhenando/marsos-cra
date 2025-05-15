import React, { useState } from "react";
import BuyerProfile from "../buyer/BuyerProfile";
import { useAuth } from "../../context/AuthContext";
import OrdersPage from "../orders/OrdersPage";
import UserMessages from "../global/UserMessages";
import {
  Home,
  User,
  ShoppingCart,
  Heart,
  ShoppingBag,
  Mail,
  HelpCircle,
  Menu,
} from "react-feather";

const Dashboard = () => {
  const { userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");

  const menuItems = [
    { key: "home", label: "Home", icon: <Home size={18} /> },
    { key: "profile", label: "Profile", icon: <User size={18} /> },
    { key: "orders", label: "Orders", icon: <ShoppingCart size={18} /> },
    { key: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
    { key: "cart", label: "Cart", icon: <ShoppingBag size={18} /> },
    { key: "messages", label: "Messages", icon: <Mail size={18} /> },
    { key: "support", label: "Support", icon: <HelpCircle size={18} /> },
  ];

  const renderContent = () => {
    switch (selectedPage) {
      case "home":
        return (
          <div>
            <h2 className='text-xl font-bold text-[#2c6449]'>
              Welcome, {userData?.name || "Buyer"}!
            </h2>
            <p className='text-gray-600 mt-2'>
              Manage your orders, wishlist, and profile all in one place.
            </p>
          </div>
        );
      case "profile":
        return <BuyerProfile />;
      case "orders":
        return <OrdersPage />;
      case "messages":
        return <UserMessages />;
      case "wishlist":
        return (
          <div>
            <h2 className='text-lg font-semibold text-[#2c6449]'>Wishlist</h2>
            <p className='text-gray-600 mt-2'>Items you’ve saved for later.</p>
          </div>
        );
      case "cart":
        return (
          <div>
            <h2 className='text-lg font-semibold text-[#2c6449]'>
              Shopping Cart
            </h2>
            <p className='text-gray-600 mt-2'>
              View and manage items in your cart.
            </p>
          </div>
        );
      case "support":
        return (
          <div>
            <h2 className='text-lg font-semibold text-[#2c6449]'>Support</h2>
            <p className='text-gray-600 mt-2'>
              Need help? Reach out to our support team.
            </p>
          </div>
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
        <h1 className='text-base font-semibold text-[#2c6449]'>
          Buyer Dashboard
        </h1>
        <img
          src={userData?.logoUrl || "https://via.placeholder.com/32"}
          alt='User'
          className='w-10 h-10 rounded-full object-cover'
        />
      </div>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } lg:block w-full lg:w-60 bg-white border-r shadow-sm`}
      >
        <ul className='flex flex-col py-4'>
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => {
                  setSelectedPage(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-6 py-3 text-sm flex items-center gap-3 transition-colors duration-150 ${
                  selectedPage === item.key
                    ? "text-[#2c6449] font-bold"
                    : "text-gray-700 hover:text-[#2c6449]"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
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

export default Dashboard;
