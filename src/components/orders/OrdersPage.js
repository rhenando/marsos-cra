import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

function OrdersPage() {
  const { currentUser } = useAuth();
  const {
    addNotification,
    removeNotification,
    notifications,
    seenNotifications,
  } = useNotification();

  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.uid) return;

      setLoading(true);
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      const groupedOrders = {};

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000)
          : null;

        const order = {
          id: doc.id,
          transactionId: data.transactionId || "N/A",
          billNumber: data.billNumber || "N/A", // still used for review-invoice
          totalAmount: data.totalAmount || "0.00",
          orderStatus: data.orderStatus || "Pending",
          createdAt: createdAt ? createdAt.toLocaleString() : "Unknown Date",
          paymentMethod: data.paymentMethod || "Unknown",
        };

        const method = order.paymentMethod;

        if (!groupedOrders[method]) {
          groupedOrders[method] = [];
        }
        groupedOrders[method].push(order);
      });

      setOrders(groupedOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [currentUser]);

  useEffect(() => {
    const paymentsRef = collection(db, "payments");
    const unsubscribe = onSnapshot(paymentsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified" || change.type === "added") {
          const paymentData = change.doc.data();
          const billNumber = change.doc.id;
          const { paymentStatus, paymentAmount } = paymentData;

          console.log(
            `🔔 Payment update received for Bill #${billNumber}: ${paymentStatus}`
          );

          setOrders((prevOrders) => {
            const updatedOrders = { ...prevOrders };

            Object.keys(updatedOrders).forEach((method) => {
              updatedOrders[method] = updatedOrders[method].map((order) =>
                String(order.billNumber) === String(billNumber)
                  ? { ...order, orderStatus: paymentStatus }
                  : order
              );
            });

            return updatedOrders;
          });

          if (
            paymentStatus === "APPROVED" &&
            !seenNotifications.has(billNumber)
          ) {
            addNotification({
              id: billNumber,
              message: `Payment for Invoice #${billNumber} of ${paymentAmount} SR is Approved! 🎉`,
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [addNotification, notifications, seenNotifications]);

  return (
    <div className='container mt-4'>
      <h2 className='text-center'>Your Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : Object.keys(orders).length === 0 ? (
        <p>No orders found.</p>
      ) : (
        Object.keys(orders).map((method) => (
          <div key={method} className='mb-5'>
            <h4 className='mb-3'>{method} Orders</h4>

            {/* Desktop Table */}
            <div className='d-none d-sm-block'>
              <div className='table-responsive'>
                <table className='table table-bordered'>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Payment Method</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Review Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders[method].map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => removeNotification(order.billNumber)}
                      >
                        <td>{order.transactionId}</td>
                        <td>{order.paymentMethod}</td>
                        <td>{order.totalAmount} SR</td>
                        <td
                          className={
                            order.orderStatus === "APPROVED"
                              ? "text-success"
                              : "text-warning"
                          }
                        >
                          {order.orderStatus}
                        </td>
                        <td>{order.createdAt}</td>
                        <td>
                          <Link
                            to={
                              order.orderStatus === "APPROVED"
                                ? `/review-invoice/${order.billNumber}`
                                : "#"
                            }
                            className={`btn btn-sm fw-semibold ${
                              order.orderStatus === "APPROVED"
                                ? ""
                                : "btn-secondary disabled"
                            }`}
                            style={{
                              backgroundColor:
                                order.orderStatus === "APPROVED"
                                  ? "#2c6449"
                                  : undefined,
                              borderColor:
                                order.orderStatus === "APPROVED"
                                  ? "#2c6449"
                                  : undefined,
                              color:
                                order.orderStatus === "APPROVED"
                                  ? "#fff"
                                  : undefined,
                              cursor:
                                order.orderStatus === "APPROVED"
                                  ? "pointer"
                                  : "not-allowed",
                            }}
                            onClick={(e) => {
                              if (order.orderStatus !== "APPROVED") {
                                e.preventDefault();
                              }
                            }}
                          >
                            Review Invoice
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className='d-block d-sm-none'>
              {orders[method].map((order) => (
                <div
                  className='card mb-3 shadow-sm'
                  key={order.id}
                  onClick={() => removeNotification(order.billNumber)}
                >
                  <div className='card-body'>
                    <h6 className='fw-bold mb-2'>
                      Payment Method: {order.paymentMethod}
                    </h6>
                    <p className='mb-1'>
                      <strong>Transaction ID:</strong> {order.transactionId}
                    </p>
                    <p className='mb-1'>
                      <strong>Total:</strong> {order.totalAmount} SR
                    </p>
                    <p className='mb-1'>
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          order.orderStatus === "APPROVED"
                            ? "text-success"
                            : "text-warning"
                        }
                      >
                        {order.orderStatus}
                      </span>
                    </p>
                    <p className='mb-3'>
                      <strong>Date:</strong> {order.createdAt}
                    </p>
                    <Link
                      to={
                        order.orderStatus === "APPROVED"
                          ? `/review-invoice/${order.billNumber}`
                          : "#"
                      }
                      className={`btn btn-sm w-100 fw-semibold ${
                        order.orderStatus === "APPROVED"
                          ? ""
                          : "btn-secondary disabled"
                      }`}
                      style={{
                        backgroundColor:
                          order.orderStatus === "APPROVED"
                            ? "#2c6449"
                            : undefined,
                        borderColor:
                          order.orderStatus === "APPROVED"
                            ? "#2c6449"
                            : undefined,
                        color:
                          order.orderStatus === "APPROVED" ? "#fff" : undefined,
                        cursor:
                          order.orderStatus === "APPROVED"
                            ? "pointer"
                            : "not-allowed",
                      }}
                      onClick={(e) => {
                        if (order.orderStatus !== "APPROVED") {
                          e.preventDefault();
                        }
                      }}
                    >
                      Review Invoice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrdersPage;
