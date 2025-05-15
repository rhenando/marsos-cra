import React, { useState } from "react";
import BuyerProfile from "../buyer/BuyerProfile";
import { useAuth } from "../../context/AuthContext";
import OrdersPage from "../orders/OrdersPage";
import UserMessages from "../global/UserMessages";

const Dashboard = () => {
  const { userData } = useAuth();
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("home");

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const menuItems = [
    { name: "home", icon: "🏠" },
    { name: "profile", icon: "👤" },
    { name: "orders", icon: "🛒" },
    { name: "wishlist", icon: "❤️" },
    { name: "cart", icon: "🛍️" },
    { name: "messages", icon: "✉️" },
    { name: "support", icon: "❓" },
  ];

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setSidebarVisible(false); // Auto-close sidebar after selecting a menu item
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "home":
        return (
          <div>
            <h4 className='text-xl font-semibold'>
              Welcome, {userData?.name || "Buyer"}!
            </h4>
            <p className='text-gray-600'>
              Here you can manage your orders, wishlist, and more.
            </p>
          </div>
        );
      case "orders":
        return <OrdersPage />;
      case "wishlist":
        return (
          <div>
            <h4 className='text-xl font-semibold'>Wishlist</h4>
            <p className='text-gray-600'>
              Items you have added to your wishlist.
            </p>
          </div>
        );
      case "cart":
        return (
          <div>
            <h4 className='text-xl font-semibold'>Shopping Cart</h4>
            <p className='text-gray-600'>Review items in your shopping cart.</p>
          </div>
        );
      case "messages":
        return <UserMessages />;
      case "profile":
        return <BuyerProfile />;
      case "support":
        return (
          <div>
            <h4 className='text-xl font-semibold'>Support</h4>
            <p className='text-gray-600'>Get help and support.</p>
          </div>
        );
      default:
        return <h1 className='text-2xl'>Welcome to your Buyer Dashboard!</h1>;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top Navbar */}
      <div className='flex justify-between items-center bg-white px-6 py-4 border-b shadow-sm'>
        <div className='flex items-center gap-3'>
          <button
            onClick={toggleSidebar}
            className='text-[#2c6449] text-2xl hover:text-green-900'
          >
            ☰
          </button>
          <h5 className='text-lg font-semibold text-[#2c6449]'>
            Buyer Dashboard
          </h5>
        </div>
        <div>
          <img
            src={userData?.logoUrl || "https://via.placeholder.com/32"}
            alt='User Avatar'
            className='w-12 h-12 rounded-full object-cover'
          />
        </div>
      </div>

      {/* Body */}
      <div className='flex flex-col md:flex-row'>
        {/* Sidebar */}
        {isSidebarVisible && (
          <div className='w-full md:w-64 bg-white border-r transition-all duration-300 ease-in-out'>
            <ul className='flex flex-col py-4'>
              {menuItems.map((menu) => (
                <li key={menu.name}>
                  <button
                    onClick={() => handleMenuClick(menu.name)}
                    className={`w-full text-left px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors duration-150 ${
                      selectedMenu === menu.name
                        ? "text-[#2c6449] font-bold"
                        : "text-gray-700 hover:text-[#2c6449]"
                    }`}
                  >
                    <span>{menu.icon}</span>
                    {menu.name.charAt(0).toUpperCase() + menu.name.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 p-6 transition-all duration-300 ease-in-out`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
