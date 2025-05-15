import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.svg"; // Importing the logo
import { User, Globe, MessageCircle } from "react-feather"; // Icons

const SecondaryNavbar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setVisible(true); // Show navbar when scrolled down
      } else {
        setVisible(false); // Hide navbar when at the top
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`navbar navbar-light bg-white fixed-top ${
        visible ? "scrolled" : ""
      }`}
      style={{
        top: "0",
        zIndex: 1050,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        paddingLeft: "100px",
        paddingRight: "100px",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
      }}
    >
      <div
        className='container d-flex align-items-center justify-content-between'
        style={{
          maxWidth: "960px", // Reduced container width
          margin: "0 auto", // Center the container
        }}
      >
        {/* Logo */}
        <a className='navbar-brand' href='/'>
          <img
            src={logo}
            alt='Logo'
            style={{ height: "80px" }} // Adjust the size as needed
          />
        </a>
        {/* Menu Links */}
        <ul
          className='navbar-nav flex-row align-items-center justify-content-between flex-grow-1'
          style={{
            marginLeft: "20px", // Adjust menu spacing
            marginRight: "20px", // Adjust menu spacing
          }}
        >
          <li className='nav-item me-3'>
            <a
              className='nav-link'
              href='/supplier'
              style={{
                color: "#2c6449", // Menu color
              }}
            >
              Become a Supplier
            </a>
          </li>
          <li className='nav-item me-3'>
            <a
              className='nav-link'
              href='/app'
              style={{
                color: "#2c6449", // Menu color
              }}
            >
              Get the App
            </a>
          </li>
          <li className='nav-item me-3'>
            <a
              className='nav-link'
              href='/help'
              style={{
                color: "#2c6449", // Menu color
              }}
            >
              Help Center
            </a>
          </li>
        </ul>
        {/* Search Bar */}
        <div className='d-none d-lg-flex align-items-center'>
          <input
            type='text'
            className='form-control'
            placeholder='Search...'
            style={{
              maxWidth: "300px",
              border: "1px solid #2c6449", // Border color matches menus
              color: "#2c6449", // Text color
            }}
          />
        </div>
        {/* Icons */}
        <div className='d-flex align-items-center'>
          {/* Language Icon */}
          <button
            className='btn btn-link me-3'
            aria-label='Language'
            style={{ color: "#2c6449" }}
          >
            <Globe size={20} />
          </button>
          {/* Message Icon */}
          <button
            className='btn btn-link me-3'
            aria-label='Messages'
            style={{ color: "#2c6449" }}
          >
            <MessageCircle size={20} />
          </button>
          {/* User Dropdown */}
          <div className='dropdown'>
            <button
              className='btn btn-link dropdown-toggle d-flex align-items-center'
              type='button'
              id='userDropdown'
              data-bs-toggle='dropdown'
              aria-expanded='false'
              style={{
                color: "#2c6449", // Icon color
                textDecoration: "none",
              }}
            >
              <User size={20} className='me-2' />
            </button>
            <ul
              className='dropdown-menu dropdown-menu-end'
              aria-labelledby='userDropdown'
            >
              <li>
                <a className='dropdown-item' href='/profile'>
                  My Dashboard
                </a>
              </li>
              <li>
                <a className='dropdown-item' href='/settings'>
                  Order History
                </a>
              </li>
              <li>
                <hr className='dropdown-divider' />
              </li>
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => alert("Logout")}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SecondaryNavbar;
