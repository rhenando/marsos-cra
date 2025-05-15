import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from "react";

import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import RfqModal from "../../pages/RfqPage";
import MobileHeader from "../mobile/MobileHeader";
import MobileDrawer from "../mobile/MobileDrawer";
import ProductSearch from "./ProductSearch";
import UserMenu from "./UserMenu";
import LanguageSelector from "./LanguageSelector";
import NavLinks from "./NavLinks";

import {
  MousePointer,
  MessageSquare,
  ShoppingCart,
  MapPin,
} from "react-feather";

const Header = forwardRef((props, ref) => {
  const { cartItemCount, userRole } = useCart();
  const { t, i18n } = useTranslation();
  const { currentUser, userData } = useAuth();

  const location = useLocation();

  const mobileHeaderRef = useRef(null);
  const desktopHeaderRef = useRef(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showRFQModal, setShowRFQModal] = useState(false);

  useImperativeHandle(ref, () => ({
    getHeight: () => {
      const isMobile = window.innerWidth < 1024;
      const target = isMobile
        ? mobileHeaderRef.current
        : desktopHeaderRef.current;
      return target?.getBoundingClientRect().height || 0;
    },
  }));

  const [showSecondaryNav, setShowSecondaryNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowSecondaryNav(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className='sticky top-0 left-0 w-full z-50 bg-white shadow-sm'>
      {/* Invisible H1 for SEO */}
      <h1 className='sr-only' lang={i18n.language}>
        {t("header.brandName")}
      </h1>
      {/* Mobile */}
      <div ref={mobileHeaderRef} className='lg:hidden'>
        <MobileHeader onHamburgerClick={() => setIsDrawerOpen(true)} />
        {isDrawerOpen && (
          <MobileDrawer onClose={() => setIsDrawerOpen(false)} />
        )}
      </div>

      {/* Desktop */}
      <div ref={desktopHeaderRef} className='hidden lg:block'>
        {/* Invisible H1 for SEO */}
        <h1 className='sr-only' lang={i18n.language}>
          {t("header.brandName")}
        </h1>
        <div className='flex items-center justify-between px-6 py-3'>
          <Link to='/'>
            <img
              src='/logo.png'
              alt='Logo'
              className='h-20 w-auto object-contain'
            />
          </Link>

          <ProductSearch />

          <div className='flex items-center space-x-6 text-sm text-gray-600'>
            <UserMenu
              currentUser={currentUser}
              userData={userData}
              location={location}
            />

            <button
              onClick={() => setShowRFQModal(true)}
              className='flex flex-col items-center text-[#2c6449]'
            >
              <MousePointer size={18} />
              <span className='mt-1'>{t("header.requestRFQ")}</span>
            </button>

            <Link
              to='/user-messages'
              className='flex flex-col items-center text-[#2c6449]'
            >
              <MessageSquare size={18} />
              <span className='mt-1'>{t("header.messages")}</span>
            </Link>

            {userRole !== "admin" && userRole !== "supplier" && (
              <Link
                to='/cart'
                className='relative flex flex-col items-center text-[#2c6449]'
              >
                <ShoppingCart size={18} />
                {cartItemCount > 0 && (
                  <span className='absolute -top-3 -right-4 bg-[#2c6449] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center'>
                    {cartItemCount}
                  </span>
                )}
                <span className='mt-1'>{t("header.cart")}</span>
              </Link>
            )}

            <Link
              to='/basket'
              className='flex flex-col items-center text-[#2c6449]'
            >
              <MapPin size={18} />
              <span className='mt-1'>{t("header.location")}</span>
            </Link>

            <LanguageSelector />
          </div>
        </div>

        <NavLinks show={showSecondaryNav} />
      </div>

      <RfqModal show={showRFQModal} onClose={() => setShowRFQModal(false)} />
    </header>
  );
});

export default Header;
