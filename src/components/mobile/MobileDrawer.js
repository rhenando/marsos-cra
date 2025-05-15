// src/components/MobileDrawer.js
import React from "react";
import { X } from "react-feather";

const MobileDrawer = ({ onClose }) => {
  return (
    <div className='fixed inset-0 z-50 bg-black/50'>
      <div className='absolute top-0 left-0 w-64 h-full bg-white shadow-lg p-4'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-[#2c6449]'>Menu</h2>
          <button onClick={onClose}>
            <X size={22} className='text-[#2c6449]' />
          </button>
        </div>
        <ul className='space-y-4 text-[#2c6449] font-medium'>
          <li>
            <a href='/videos'>Featured Selections</a>
          </li>
          <li>
            <a href='/top'>Trending Products</a>
          </li>
          <li>
            <a href='/secured'>Secured Transactions</a>
          </li>
          <li>
            <a href='/buyer-central'>Buyer Central</a>
          </li>
          <li>
            <a href='/supplier'>Become a Supplier</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MobileDrawer;
