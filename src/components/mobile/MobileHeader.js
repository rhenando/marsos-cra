import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  User,
  ShoppingCart,
  MessageSquare,
  MousePointer,
  MapPin,
  Camera,
  Search,
} from "react-feather";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Combobox } from "@headlessui/react";

const MobileHeader = ({ onHamburgerClick }) => {
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { t, i18n } = useTranslation();

  const [showUserMenuMobile, setShowUserMenuMobile] = useState(false);
  const [showLanguageMenuMobile, setShowLanguageMenuMobile] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const userIconRef = useRef();
  const languageRef = useRef();

  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  const getLocalizedText = (value, locale = "en") => {
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null)
      return value[locale] || value["en"] || Object.values(value)[0];
    return "";
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      i18n.language === "ar" ? "rtl" : "ltr"
    );
  }, [i18n.language]);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        name:
          getLocalizedText(doc.data().productName, i18n.language) ||
          "Unnamed Product",
      }));
      setProducts(items);
    };
    fetchProducts();
  }, [i18n.language]); // <-- re-run when language changes

  const filteredProducts =
    query === ""
      ? []
      : products.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    if (selectedProduct) {
      navigate(`/product/${selectedProduct.id}`);
    }
  }, [selectedProduct, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userIconRef.current && !userIconRef.current.contains(event.target)) {
        setShowUserMenuMobile(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageMenuMobile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='lg:hidden sticky top-0 w-full z-50 bg-white shadow-sm'>
      {/* Top bar */}
      <div className='flex items-center justify-between px-4 py-4 min-h-[70px] relative'>
        <button onClick={onHamburgerClick}>
          <Menu size={24} className='text-[#2c6449]' />
        </button>

        <Link to='/' className='absolute left-1/2 transform -translate-x-1/2'>
          <img
            src='/logo.png'
            alt='Logo'
            className='h-16 w-auto object-contain'
          />
        </Link>

        <div
          ref={userIconRef}
          className='relative flex items-center gap-1 justify-end'
        >
          {currentUser && userData && (
            <span className='text-sm text-[#2c6449] font-medium'>
              {userData.name?.split(" ")[0]}
            </span>
          )}
          <button
            onClick={() => setShowUserMenuMobile(!showUserMenuMobile)}
            className='text-[#2c6449]'
          >
            <User size={22} />
          </button>

          {showUserMenuMobile && (
            <div className='absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded z-50 text-sm text-gray-700'>
              {currentUser && userData ? (
                <>
                  <button
                    onClick={() => {
                      const { role } = userData;
                      if (role === "buyer") navigate("/buyer-dashboard");
                      else if (role === "supplier")
                        navigate("/supplier-dashboard");
                      else if (role === "admin") navigate("/admin-dashboard");
                      setShowUserMenuMobile(false);
                    }}
                    className='block w-full text-left rtl:text-right px-4 py-2 hover:bg-gray-100'
                  >
                    {t("header.myDashboard")}
                  </button>
                  <button
                    onClick={() => {
                      navigate("/orders");
                      setShowUserMenuMobile(false);
                    }}
                    className='block w-full text-left rtl:text-right px-4 py-2 hover:bg-gray-100'
                  >
                    {t("header.orderHistory")}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        navigate("/user-login");
                        setShowUserMenuMobile(false);
                      } catch (error) {
                        console.error("Logout failed:", error);
                      }
                    }}
                    className='block w-full text-left rtl:text-right px-4 py-2 hover:bg-gray-100'
                  >
                    {t("header.logout")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/user-login");
                    setShowUserMenuMobile(false);
                  }}
                  className='block w-full text-left rtl:text-right px-4 py-2 hover:bg-gray-100'
                >
                  {t("header.signIn")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔍 Search Combobox */}
      <Combobox value={selectedProduct} onChange={setSelectedProduct}>
        <div className='relative mx-4 mb-2'>
          <div className='flex items-center border border-[#2c6449] bg-white rounded-full overflow-hidden'>
            <div className='px-3 text-[#2c6449]'>
              <Camera size={18} />
            </div>
            <Combobox.Input
              className='w-full text-sm text-[#2c6449] placeholder-[#2c6449] outline-none py-2 px-2 text-start rtl:text-end'
              displayValue={(item) => item?.name || ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("header.searchPlaceholder")}
              style={{ fontSize: "0.50rem" }}
            />
            <button className='bg-[#2c6449] px-4 py-2 rounded-r-full rtl:rounded-l-full rtl:rounded-r-none'>
              <Search size={18} className='text-white' />
            </button>
          </div>

          <Combobox.Options className='absolute w-full mt-1 bg-white border border-gray-200 shadow-lg rounded z-50 text-sm text-[#2c6449]'>
            {filteredProducts.length === 0 ? (
              <div className='px-4 py-2 text-gray-400'>No results found</div>
            ) : (
              filteredProducts.map((item) => (
                <Combobox.Option
                  key={item.id}
                  value={item}
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer ${
                      active ? "bg-[#2c6449] text-white" : ""
                    }`
                  }
                >
                  {item.name}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>

      {/* Bottom nav row */}
      <div className='flex justify-around items-center px-4 py-2 text-xs text-[#2c6449] border-t'>
        <button onClick={() => navigate("/rfq")}>
          <MousePointer size={16} className='mx-auto' />
          <span className='block mt-1'>{t("mobile_header.rfq")}</span>
        </button>

        <Link to='/messages' className='text-center'>
          <MessageSquare size={16} className='mx-auto' />
          <span className='block mt-1'>{t("mobile_header.messages")}</span>
        </Link>

        <Link to='/cart' className='relative text-center'>
          <ShoppingCart size={16} className='mx-auto' />
          {cartItemCount > 0 && (
            <span className='absolute -top-1 -right-3 bg-[#2c6449] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center'>
              {cartItemCount}
            </span>
          )}
          <span className='block mt-1'>{t("mobile_header.cart")}</span>
        </Link>

        <Link to='/basket' className='text-center'>
          <MapPin size={16} className='mx-auto' />
          <span className='block mt-1'>{t("mobile_header.location")}</span>
        </Link>

        {/* Language Icon */}
        <div ref={languageRef} className='relative text-center'>
          <button
            onClick={() => setShowLanguageMenuMobile(!showLanguageMenuMobile)}
            className='flex items-center gap-1 text-[#2c6449]'
          >
            <img
              src={`https://flagcdn.com/h20/${
                selectedLanguage === "English" ? "us" : "sa"
              }.png`}
              alt='flag'
              className='w-5 h-5 rounded-sm object-contain'
            />
            <span className='text-[11px] font-medium'>
              {selectedLanguage === "English" ? "EN" : "العربية"}
            </span>
          </button>

          {showLanguageMenuMobile && (
            <ul className='absolute right-0 top-full mt-2 w-[120px] bg-white border border-gray-200 rounded shadow-md z-50 text-sm text-[#2c6449]'>
              <li
                className='px-4 py-2 hover:bg-[#2c6449] hover:text-white cursor-pointer'
                onClick={() => {
                  setSelectedLanguage("English");
                  i18n.changeLanguage("en");
                  document.documentElement.dir = "ltr";
                  setShowLanguageMenuMobile(false);
                }}
              >
                EN
              </li>
              <li
                className='px-4 py-2 hover:bg-[#2c6449] hover:text-white cursor-pointer'
                onClick={() => {
                  setSelectedLanguage("العربية");
                  i18n.changeLanguage("ar");
                  document.documentElement.dir = "rtl";
                  setShowLanguageMenuMobile(false);
                }}
              >
                العربية
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
