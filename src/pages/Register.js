// src/components/RegisterChoice.js
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const RegisterChoice = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    if (role === "supplier") {
      navigate("/supplier");
    } else if (role === "buyer") {
      navigate("/buyer");
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4'>
      <div className='text-center mb-6'>
        <img src={logo} alt='Logo' className='w-20 mb-2 mx-auto' />
        <h2 className='text-2xl font-bold text-[#2d6a4f]'>Register as a</h2>
      </div>

      <div className='w-full max-w-sm bg-white p-6 rounded-lg shadow text-center'>
        <div className='flex justify-between mb-6 gap-4'>
          <button
            onClick={() => handleRoleSelection("buyer")}
            className='w-full bg-[#2d6a4f] text-white font-bold py-2 rounded hover:bg-[#245e45] transition'
          >
            Buyer
          </button>

          {/* <button
            onClick={() => handleRoleSelection("supplier")}
            className='w-1/2 bg-[#2d6a4f] text-white font-bold py-2 rounded hover:bg-[#245e45] transition'
          >
            Supplier
          </button>
          <button
            onClick={() => handleRoleSelection("buyer")}
            className='w-1/2 bg-[#2d6a4f] text-white font-bold py-2 rounded hover:bg-[#245e45] transition'
          >
            Buyer
          </button> */}
        </div>

        <p className='text-sm text-gray-600 mb-2'>
          Already have an account?{" "}
          <a
            href='/user-login'
            className='text-[#2d6a4f] font-semibold hover:underline'
          >
            Login
          </a>
        </p>

        <a
          href='/guest'
          className='text-[#2d6a4f] font-semibold hover:underline text-sm'
        >
          Browse as a Guest
        </a>
      </div>
    </div>
  );
};

export default RegisterChoice;
