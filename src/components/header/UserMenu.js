// components/header/UserMenu.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "react-feather";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const UserMenu = ({ currentUser, userData, location }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDashboardClick = () => {
    const { role } = userData;
    const currentPath = location.pathname;

    if (role === "buyer" && currentPath !== "/buyer-dashboard") {
      navigate("/buyer-dashboard");
    } else if (role === "supplier" && currentPath !== "/supplier-dashboard") {
      navigate("/supplier-dashboard");
    } else if (role === "admin" && currentPath !== "/admin-dashboard") {
      navigate("/admin-dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/user-login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className='relative'
      onMouseEnter={() => {
        clearTimeout(hoverTimeoutRef.current);
        setShowUserMenu(true);
      }}
      onMouseLeave={() => {
        hoverTimeoutRef.current = setTimeout(() => {
          setShowUserMenu(false);
        }, 200);
      }}
    >
      <div
        className='flex flex-col items-center cursor-pointer text-[#2c6449]'
        onClick={() => {
          if (!currentUser) navigate("/user-login");
        }}
      >
        <User size={18} />
        <span className='mt-1'>
          {currentUser && userData
            ? t("header.greeting", {
                name: userData.name?.split(" ")[0],
              })
            : t("header.signIn")}
        </span>
      </div>

      {currentUser && userData && showUserMenu && (
        <div className='absolute top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded z-50 text-sm text-gray-700'>
          <button
            onClick={handleDashboardClick}
            className='block w-full text-left rtl:text-right px-4 py-2 hover:bg-gray-100'
          >
            {t("header.myDashboard")}
          </button>
          <button
            onClick={() => navigate("/orders")}
            className='block w-full text-left rtl:text-right px-4 py-2 hover:bg-gray-100'
          >
            {t("header.orderHistory")}
          </button>
          <button
            onClick={handleLogout}
            className='block w-full text-left rtl:text-right px-4 py-2 hover:bg-gray-100'
          >
            {t("header.logout")}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
