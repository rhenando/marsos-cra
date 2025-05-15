import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { billNumber, sadadNumber } = location.state || {};

  if (!billNumber || !sadadNumber) {
    return (
      <div className='container text-center mt-5'>
        <h2 className='text-danger'>Error: No Payment Details Available</h2>
        <p>Please check your order history or try again.</p>
        <button className='btn btn-primary' onClick={() => navigate("/orders")}>
          Go to Orders
        </button>
      </div>
    );
  }

  return (
    <div className='container text-center mt-5'>
      <h2 className='text-success'>Invoice Created Successfully!</h2>
      <p className='lead'>
        Please use the details below to complete your payment manually.
      </p>

      <div className='card shadow p-4 mt-4'>
        <h4>🔢 Bill Number</h4>
        <p className='fw-bold fs-5'>{billNumber}</p>

        <h4>🏦 Sadad Number</h4>
        <p className='fw-bold fs-5'>{sadadNumber}</p>

        <h5 className='mt-4'>📌 Payment Instructions:</h5>
        <ul className='list-unstyled'>
          <li>✅ Go to your online banking portal.</li>
          <li>✅ Choose **SADAD Payments**.</li>
          <li>✅ Enter the provided **Sadad Number**.</li>
          <li>✅ Complete the transaction to confirm your payment.</li>
        </ul>

        <button
          className='btn btn-primary mt-3'
          onClick={() => navigate("/orders")}
        >
          Go to Orders
        </button>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
