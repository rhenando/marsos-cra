import React, { useRef, useState } from "react";

const OtpInputGroup = ({ onChange }) => {
  const inputs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return; // allow only numbers

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    onChange(updatedOtp.join(""));

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className='flex justify-center gap-2 mt-4'>
      {otp.map((digit, index) => (
        <input
          key={index}
          type='text'
          inputMode='numeric'
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputs.current[index] = el)}
          className='w-12 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#2c6449] transition'
        />
      ))}
    </div>
  );
};

export default OtpInputGroup;
