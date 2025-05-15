import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Payment Failed ❌</h2>
      <button onClick={() => navigate("/checkout")}>Try Again</button>
    </div>
  );
};

export default PaymentFailed;
