import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";

function SupplierOrdersPage() {
  const { currentUser } = useAuth();
  const {
    addNotification,
    removeNotification,
    notifications,
    seenNotifications,
  } = useNotification();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredOrderId, setHoveredOrderId] = useState(null);

  useEffect(() => {
    const fetchSupplierOrders = async () => {
      if (!currentUser?.uid) return;

      const ordersRef = collection(db, "orders");
      const snapshot = await getDocs(ordersRef);
      const filteredOrders = []; // ✅ define it here

      snapshot.forEach((doc) => {
        const data = doc.data(); // ✅ define data here
        const buyerIdFromItem = data.items?.[0]?.buyerId || null; // ✅ move here

        const supplierInItems = data.items?.some(
          (item) => item.supplierId === currentUser.uid
        );

        if (supplierInItems) {
          const createdAt = data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : null;

          filteredOrders.push({
            id: doc.id,
            sadadNumber: data.sadadNumber || "N/A",
            billNumber: data.billNumber || "N/A",
            totalAmount: data.totalAmount || "0.00",
            orderStatus: data.orderStatus || "Pending",
            createdAt: createdAt ? createdAt.toLocaleString() : "Unknown Date",
            buyerId: buyerIdFromItem, // ✅ Now it works correctly
          });
        }
      });

      setOrders(filteredOrders);
      setLoading(false);
    };

    fetchSupplierOrders();
  }, [currentUser?.uid]);

  useEffect(() => {
    const paymentsRef = collection(db, "payments");
    const unsubscribe = onSnapshot(paymentsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified" || change.type === "added") {
          const paymentData = change.doc.data();
          const billNumber = change.doc.id;
          const { paymentStatus, paymentAmount } = paymentData;

          console.log(
            `🔔 Supplier Payment update for Bill #${billNumber}: ${paymentStatus}`
          );

          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              String(order.billNumber) === String(billNumber)
                ? { ...order, orderStatus: paymentStatus }
                : order
            )
          );

          if (
            paymentStatus === "APPROVED" &&
            !seenNotifications.has(billNumber)
          ) {
            addNotification({
              id: billNumber,
              message: `Payment for Order #${billNumber} of ${paymentAmount} SR is Approved! 🎉`,
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [addNotification, notifications, seenNotifications]);

  return (
    <div className='container mt-4'>
      <h2>Supplier Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className='d-none d-sm-block'>
            <div className='table-responsive'>
              <table className='table table-bordered'>
                <thead>
                  <tr>
                    <th>Sadad Number</th>
                    <th>Bill Number</th>
                    <th>Net Amount</th>
                    <th>Service Fee (0%)</th>
                    <th>Billed Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const netAmount = parseFloat(order.totalAmount);
                    const serviceFee = 0; // change to netAmount * 0.10 when 10% kicks in
                    const billedAmount = netAmount - serviceFee;

                    return (
                      <tr
                        key={order.id}
                        onClick={() => removeNotification(order.billNumber)}
                      >
                        <td>{order.sadadNumber}</td>
                        <td>{order.billNumber}</td>
                        <td>{netAmount.toFixed(2)} SR</td>
                        <td>{serviceFee.toFixed(2)} SR</td>
                        <td>{billedAmount.toFixed(2)} SR</td>
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
                        <td style={{ whiteSpace: "nowrap" }}>
                          <Link
                            to={
                              order.orderStatus === "APPROVED"
                                ? `/review-invoice/${order.billNumber}`
                                : "#"
                            }
                            className={`btn btn-sm me-2 fw-semibold ${
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

                          <button
                            className='btn btn-sm fw-semibold'
                            onClick={() => {
                              const chatId = `order_${order.buyerId}_${currentUser.uid}`;
                              const extraData = {
                                billNumber: order.billNumber,
                                totalAmount: order.totalAmount,
                                orderStatus: order.orderStatus,
                              };
                              const encodedData = encodeURIComponent(
                                JSON.stringify(extraData)
                              );
                              navigate(
                                `/order-chat/${chatId}?extraData=${encodedData}`
                              );
                            }}
                            onMouseEnter={() => setHoveredOrderId(order.id)}
                            onMouseLeave={() => setHoveredOrderId(null)}
                            style={{
                              backgroundColor:
                                hoveredOrderId === order.id
                                  ? "#2c6449"
                                  : "transparent",
                              color:
                                hoveredOrderId === order.id
                                  ? "#fff"
                                  : "#2c6449",
                              border: "1px solid #2c6449",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            Contact Buyer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className='d-block d-sm-none'>
            {orders.map((order) => {
              const netAmount = parseFloat(order.totalAmount);
              const serviceFee = 0;
              const billedAmount = netAmount - serviceFee;

              return (
                <div
                  className='card mb-3 shadow-sm'
                  key={order.id}
                  onClick={() => removeNotification(order.billNumber)}
                >
                  <div className='card-body p-3'>
                    <h6 className='fw-semibold small mb-2'>
                      Invoice:{" "}
                      <span className='text-muted'>{order.billNumber}</span>
                    </h6>
                    <p className='mb-1 small'>
                      <strong className='text-muted'>SADAD:</strong>{" "}
                      {order.sadadNumber}
                    </p>
                    <p className='mb-1 small'>
                      <strong className='text-muted'>Net:</strong>{" "}
                      {netAmount.toFixed(2)} SR
                    </p>
                    <p className='mb-1 small'>
                      <strong className='text-muted'>Service Fee (0%):</strong>{" "}
                      {serviceFee.toFixed(2)} SR
                    </p>
                    <p className='mb-1 small'>
                      <strong className='text-muted'>Billed:</strong>{" "}
                      {billedAmount.toFixed(2)} SR
                    </p>
                    <p className='mb-1 small'>
                      <strong className='text-muted'>Status:</strong>{" "}
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
                    <p className='mb-3 small'>
                      <strong className='text-muted'>Date:</strong>{" "}
                      {order.createdAt}
                    </p>

                    <Link
                      to={
                        order.orderStatus === "APPROVED"
                          ? `/review-invoice/${order.billNumber}`
                          : "#"
                      }
                      className={`btn btn-sm fw-semibold w-100 mb-2 ${
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

                    <button
                      className='btn btn-sm fw-semibold w-100 small'
                      onClick={() => {
                        const chatId = `chat_${order.buyerId}_${currentUser.uid}`;
                        const extraData = {
                          billNumber: order.billNumber,
                          totalAmount: order.totalAmount,
                          orderStatus: order.orderStatus,
                        };
                        const encodedData = encodeURIComponent(
                          JSON.stringify(extraData)
                        );
                        navigate(
                          `/order-chat/${chatId}?extraData=${encodedData}`
                        );
                      }}
                      onMouseEnter={() => setHoveredOrderId(order.id)}
                      onMouseLeave={() => setHoveredOrderId(null)}
                      style={{
                        backgroundColor:
                          hoveredOrderId === order.id
                            ? "#2c6449"
                            : "transparent",
                        color: hoveredOrderId === order.id ? "#fff" : "#2c6449",
                        border: "1px solid #2c6449",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Contact Buyer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default SupplierOrdersPage;
