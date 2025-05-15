import React from "react";
import logo from "../../assets/logo.svg";

const LoadingSpinner = () => {
  return (
    <div className='flex items-center justify-center min-h-screen bg-white relative'>
      <div className='w-36 h-36 border-2 border-t-2 border-gray-200 border-t-[#2c6449] rounded-full animate-spin absolute'></div>
      <div className='z-10'>
        <img src={logo} alt='Logo' className='w-28 h-28' />
      </div>
    </div>
  );
};

export default LoadingSpinner;
