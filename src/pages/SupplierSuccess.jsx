// pages/SupplierSuccess.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const SupplierSuccess = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // 👈 This scrolls to top on page load
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-green-50 text-center px-4'>
      <h1 className='text-3xl font-bold text-green-700 mb-4'>
        🎉 Your Details Have Been Submitted!
      </h1>
      <p className='text-gray-700 text-lg mb-6'>
        Thank you! Your supplier registration is under review. We’ll contact you
        soon.
      </p>
      <Link
        to='/products'
        className='text-[#2c6449] underline text-sm hover:text-green-800'
      >
        View Other Suppliers' Products
      </Link>
    </div>
  );
};

export default SupplierSuccess;
