import React from "react";
import logo from "../assets/logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";

const OrderSummaryModal = ({ isOpen, onClose, cartItems }) => {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.quantity * item.price + item.shippingCost;
      return total + itemTotal;
    }, 0);
  };

  const handleProceedToCheckout = () => {
    alert("Proceeding to checkout...");
  };

  return (
    <>
      {/* Overlay */}
      <div className='modal-backdrop show'></div>

      {/* Modal */}
      <div
        className='modal d-block'
        tabIndex='-1'
        role='dialog'
        style={{ height: "100vh" }}
      >
        <div
          className='modal-dialog modal-dialog-centered modal-lg'
          role='document'
        >
          <div className='modal-content'>
            <div className='modal-header d-flex justify-content-between align-items-center'>
              <div className='d-flex flex-column align-items-start'>
                <img
                  src={logo}
                  alt='Company Logo'
                  className='mb-2'
                  style={{ width: "50px" }}
                />
                <div>
                  <h5 className='mb-0'>Dynamic Company Name</h5>
                  <small className='text-muted'>Dynamic Company Slogan</small>
                </div>
              </div>
              <div className='text-end'>
                <p className='mb-0 small'>Date: {currentDate}</p>
              </div>
            </div>

            <div className='modal-body'>
              <p className='text-center mb-4'>
                Due to the rise in cement and raw materials, we are pleased to
                offer you a quotation for ready-mixed concrete. We hope it meets
                your satisfaction.
              </p>

              <table className='table table-bordered table-sm'>
                <thead className='table-light'>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Shipping</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${item.shippingCost.toFixed(2)}</td>
                      <td>
                        $
                        {(
                          item.quantity * item.price +
                          item.shippingCost
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan='4' className='text-end'>
                      <strong>Total:</strong>
                    </td>
                    <td>
                      <strong>${calculateTotal().toFixed(2)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className='my-3'>
                <h6>Terms & Conditions</h6>
                <ul className='small'>
                  <li>
                    An additional charge of $15 applies for small orders under
                    10 cubic meters.
                  </li>
                  <li>
                    Cancellations are non-refundable once the order is
                    processed.
                  </li>
                  <li>Delivery charges are included in the listed prices.</li>
                  <li>Delivery charges are included in the listed prices.</li>
                  <li>Delivery charges are included in the listed prices.</li>
                  <li>Delivery charges are included in the listed prices.</li>
                </ul>
              </div>

              <div className='my-3'>
                <h6>Bank Details</h6>
                <table className='table table-bordered table-sm'>
                  <thead className='table-light'>
                    <tr>
                      <th>Bank Name</th>
                      <th>Company Name</th>
                      <th>IBAN/Account Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>National Bank</td>
                      <td>Dynamic Company Bank Name</td>
                      <td>SA6380000455608016686556</td>
                    </tr>
                    <tr>
                      <td>Industrial Bank</td>
                      <td>Dynamic Company Bank Name</td>
                      <td>SA25100000425780001005</td>
                    </tr>
                    <tr>
                      <td>Commercial Bank</td>
                      <td>Dynamic Company Bank Name</td>
                      <td>SA1705000068205030297000</td>
                    </tr>
                  </tbody>
                </table>
                <p className='text-center small'>
                  This Quotation is valid for 15 days only.
                </p>
              </div>

              <div className='my-3'>
                <h6>Contact Information</h6>
                <div className='row'>
                  <div className='col-6 small'>
                    <strong>Manager:</strong> Dynamic Manager Name <br />
                    <strong>Contact:</strong> +966-555-123-456
                  </div>
                  <div className='col-6 small'>
                    <strong>Assistant Manager:</strong> Dynamic Manager Name{" "}
                    <br />
                    <strong>Contact:</strong> +966-555-789-101
                  </div>
                </div>
              </div>
            </div>

            <div className='modal-footer'>
              <button className='btn btn-secondary btn-sm' onClick={onClose}>
                Close
              </button>
              <button
                className='btn btn-primary btn-sm'
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSummaryModal;
