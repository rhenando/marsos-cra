import React, { useEffect } from "react";

const Notification = ({ isOpen, onClose, title, message, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className='notification-container'>
      <div className='notification-content'>
        <p style={{ color: "white" }}>{title}</p>
        <p style={{ color: "white" }}>{message}</p>
        <button
          style={{
            color: "#999",
          }}
          className='notification-close'
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
