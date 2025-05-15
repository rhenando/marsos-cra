import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const SadadPayment = () => {
  const { billNumber } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("billNumber", "==", billNumber));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setOrder(querySnapshot.docs[0].data());
        } else {
          console.warn("No order found with that billNumber.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      }
    };

    fetchOrder();
  }, [billNumber]);

  if (!order) {
    return (
      <div className='container my-5'>
        <p>Loading order...</p>
      </div>
    );
  }

  // Calculate deadline: 3 days after createdAt
  const deadlineDate = order?.createdAt?.toDate
    ? new Date(order.createdAt.toDate().getTime() + 3 * 24 * 60 * 60 * 1000)
    : null;

  const deadline = deadlineDate
    ? deadlineDate.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unavailable";

  return (
    <div className='container-sm py-4'>
      {/* SADAD Notice */}
      <div
        className='alert alert-warning border rounded shadow-sm small'
        role='alert'
      >
        <h6 className='fw-bold mb-2'>Your order is on hold</h6>
        <p className='mb-1'>
          To avoid cancelation, please complete your payment by{" "}
          <strong>{deadline}</strong>.
        </p>
        <p className='mb-0'>
          You can pay by SADAD using reference:{" "}
          <strong>{order.billNumber}</strong>, Biller code: <strong>902</strong>
          .
        </p>
      </div>

      {/* Order Info */}
      <div className='text-center mb-4'>
        <h4 className='fw-bold'>Order for {order.userName}</h4>
        <p
          className='fw-bold mt-2'
          style={{ fontSize: "1.2rem", color: "#2c6449" }}
        >
          Total: SR {parseFloat(order.totalAmount).toFixed(2)}
        </p>
      </div>

      {/* Product Table */}
      <div className='mb-4'>
        <h6 className='fw-bold mb-3'>Items in this order:</h6>
        <div className='table-responsive'>
          <table className='table table-bordered table-sm text-center small'>
            <thead className='table-light'>
              <tr>
                <th>Product</th>
                <th>Color</th>
                <th>Size</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Shipping</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.name || "N/A"}</td>
                  <td>{item.color || "N/A"}</td>
                  <td>{item.size || "N/A"}</td>
                  <td>SR {item.price?.toFixed(2) || "0.00"}</td>
                  <td>{item.quantity || 1}</td>
                  <td>SR {item.shippingCost?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status */}
      <div className='text-end'>
        <h6 className='mb-0'>
          <strong>Order Status:</strong>{" "}
          <span
            className='text-uppercase fw-bold'
            style={{
              color:
                order.orderStatus?.toLowerCase() === "approved"
                  ? "#2c6449"
                  : "#dc3545",
            }}
          >
            {order.orderStatus || "Pending"}
          </span>
        </h6>
      </div>
      {/* Action Buttons */}
      <div className='d-flex flex-column flex-sm-row justify-content-center gap-3 mt-5'>
        <button
          className='btn btn-outline-secondary'
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
        <button
          className='btn btn-primary'
          onClick={() => navigate("/orders")}
          style={{ backgroundColor: "#2c6449", borderColor: "#2c6449" }}
        >
          View Orders
        </button>
      </div>
    </div>
  );
};

export default SadadPayment;
