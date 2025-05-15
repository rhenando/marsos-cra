import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import Notification from "../global/Notification";

import { useTranslation } from "react-i18next";
import ReviewOrderModal from "../global/ReviewOrderModal";

const CartPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: "",
    message: "",
  });

  const [selectedSupplierId, setSelectedSupplierId] = useState(null); // Supplier ID for modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // Modal visibility

  const [showCouponInput, setShowCouponInput] = useState(false); // Toggle coupon input
  const [couponCode, setCouponCode] = useState(""); // Stores the coupon code
  const [discount, setDiscount] = useState(0); // Stores applied discount

  const { cartItems, setCartItems, isCheckoutDisabled } = useCart();

  const [supplierNames, setSupplierNames] = useState({});

  useEffect(() => {
    fetchSupplierNames();
  }, []);

  const fetchSupplierNames = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const namesMap = {};

      snapshot.forEach((doc) => {
        const user = doc.data();
        if (user.role === "supplier") {
          namesMap[doc.id] =
            user.displayName || user.name || "Unnamed Supplier";
        }
      });

      setSupplierNames(namesMap);
    } catch (error) {
      console.error("Error fetching supplier names:", error);
    }
  };

  const groupedBySupplier = cartItems.reduce((groups, item) => {
    const supplierId = item.supplierId;
    if (!groups[supplierId]) {
      groups[supplierId] = [];
    }
    groups[supplierId].push(item);
    return groups;
  }, {});

  const showNotification = (title, message) => {
    setNotificationContent({ title, message });
    setIsNotificationOpen(true);
  };

  const handleQuantityChange = (cartId, change) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const closeReviewModal = () => {
    setSelectedSupplierId(null);
    setIsReviewModalOpen(false);
  };

  const handleContactSupplier = async (supplierId, items) => {
    if (!currentUser) {
      showNotification("Error", "You must be logged in to contact a supplier.");
      navigate("/user-login");
      return;
    }

    const chatDocId = `chat_${currentUser.uid}_${supplierId}_CART`;
    const chatRef = doc(db, "cartChats", chatDocId);

    try {
      const chatSnapshot = await getDoc(chatRef);
      const buyerName = currentUser.displayName || "Unknown Buyer";

      if (chatSnapshot.exists()) {
        await updateDoc(chatRef, { cartItems: items });
      } else {
        await setDoc(chatRef, {
          chatId: chatDocId,
          buyerId: currentUser.uid,
          buyerName,
          supplierId,
          cartItems: items,
          messages: [],
          createdAt: serverTimestamp(),
        });

        console.log(`📩 New chat created: ${chatDocId}`);
      }

      navigate(`/cart-chat/${chatDocId}`, { state: { chatId: chatDocId } });
    } catch (error) {
      console.error("❌ Error initiating chat:", error);
      showNotification("Error", "Failed to contact the supplier.");
    }
  };

  const handleReviewOrder = (supplierId) => {
    if (!supplierId) {
      showNotification("Error", "Supplier ID is missing.");
      return;
    }

    console.log("Opening Review Order Modal for Supplier:", supplierId); // ✅ Debugging Log
    setSelectedSupplierId(supplierId);
    setIsReviewModalOpen(true);
  };

  const handleRemoveItem = async (cartId) => {
    const updatedCartItems = cartItems.filter((item) => item.cartId !== cartId);
    setCartItems(updatedCartItems);

    try {
      const cartRef = doc(db, "carts", currentUser.uid);
      await updateDoc(cartRef, { items: updatedCartItems });

      showNotification(
        "Item Removed",
        "The item was successfully removed from your cart."
      );
    } catch (error) {
      console.error("Error removing item:", error);
      showNotification("Error", "Failed to remove item.");
    }
  };

  const handleQuantityManualChange = (cartId, value) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId
          ? { ...item, tempQuantity: value.replace(/\D/g, "") } // Allow only numbers
          : item
      )
    );
  };

  const handleQuantityBlur = (cartId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity:
                item.tempQuantity === "" || item.tempQuantity === undefined
                  ? item.quantity // ✅ Revert to original if empty
                  : parseInt(item.tempQuantity, 10), // ✅ Save new value
              tempQuantity: undefined, // Remove temp storage
            }
          : item
      )
    );
  };

  const handleApplyCoupon = () => {
    const validCoupons = {
      DISCOUNT10: 10, // 10 SR off
      SAVE20: 20, // 20 SR off
    };

    if (validCoupons[couponCode]) {
      setDiscount(validCoupons[couponCode]);
      showNotification(
        "Coupon Applied",
        `You saved SR ${validCoupons[couponCode]}!`
      );
      setShowCouponInput(false);
    } else {
      setDiscount(0);
      showNotification("Invalid Coupon", "This coupon code is not valid.");
    }

    setCouponCode(""); // ✅ Clear the input field
  };

  if (!cartItems.length)
    return <p className='text-center small'>{t("cart.emptyMessage")}</p>;

  const formatValue = (value, isCurrency = false) => {
    if (isNaN(value) || value === undefined || value === null) {
      return isCurrency ? "SR 0.00" : "0";
    }
    return isCurrency ? `SR ${value.toFixed(2)}` : value.toString();
  };

  // Ensure valid numerical values (default to 0 if invalid)
  const safeValue = (value) =>
    isNaN(value) || value === undefined || value === null ? 0 : value;

  return (
    <div
      className='container my-3 bg-transparent'
      style={{ background: "transparent" }}
    >
      <style>
        {`
          .table {
            background-color: transparent !important;
          }
          .table>:not(caption)>*>* {
            background-color: transparent !important;
            box-shadow: none !important;
          }
          .cart-title {
            font-size: 16px;
            font-weight: bold;
          }
          .cart-item-name {
            font-size: 14px;
            font-weight: 600;
          }
          .cart-item-details {
            font-size: 12px;
            color: #777;
          }
          .cart-price, .cart-qty, .cart-total {
            font-size: 14px;
            font-weight: 500;
          }
          .cart-summary-title {
            font-size: 15px;
            font-weight: bold;
          }
          .cart-summary-text {
            font-size: 14px;
          }
          .cart-remove-btn {
            width: 20px;
            height: 20px;
            font-size: 12px;
            border: 1px solid #ccc;
            color: #666;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>

      <h6 className='text-center cart-title'>
        Your Cart ({cartItems.length} items)
      </h6>

      {Object.entries(groupedBySupplier).map(([supplierId, items]) => (
        <div key={supplierId} className='row mb-4'>
          <div className='col-md-8'>
            <div key={supplierId} className='mb-4'>
              <h6 className='cart-title text-start mb-2'>
                Supplier: {supplierNames[supplierId] || supplierId}
              </h6>

              <div className='table-responsive'>
                <table className='table align-middle table-sm'>
                  <thead className='small'>
                    <tr>
                      <th className='text-start'>Item</th>
                      <th className='text-center'>Price</th>
                      <th className='text-center'>Qty</th>
                      <th className='text-center'>Shipping</th>
                      <th className='text-center'>Total</th>
                      <th className='text-center'> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const price = formatValue(item.price, true);
                      const quantity = formatValue(item.quantity);
                      const shipping = formatValue(item.shippingCost, true);
                      const total = item.price * item.quantity;

                      return (
                        <tr key={item.cartId} className='small align-middle'>
                          <td>
                            <div className='d-flex align-items-center'>
                              <img
                                src={
                                  item.mainImageUrl ||
                                  "https://via.placeholder.com/50"
                                }
                                alt={item.name}
                                className='me-2'
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                              />
                              <div>
                                <p className='cart-item-name mb-0 text-capitalize'>
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className='cart-item-details mb-1 text-capitalize'>
                                    {item.description}
                                  </p>
                                )}
                                {item.size && (
                                  <p className='cart-item-details mb-1 text-capitalize'>
                                    Size: {item.size}
                                  </p>
                                )}
                                {item.color && (
                                  <p className='cart-item-details mb-1 text-capitalize'>
                                    Color: {item.color}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className='text-center cart-price'>{price}</td>

                          <td className='text-center cart-qty'>
                            <div className='d-flex justify-content-center align-items-center'>
                              <button
                                className='btn btn-outline-secondary btn-sm px-2 py-0'
                                onClick={() =>
                                  handleQuantityChange(item.cartId, -1)
                                }
                              >
                                -
                              </button>
                              <input
                                type='text'
                                className='form-control text-center mx-1 small'
                                value={
                                  item.tempQuantity !== undefined
                                    ? item.tempQuantity
                                    : quantity
                                }
                                onChange={(e) =>
                                  handleQuantityManualChange(
                                    item.cartId,
                                    e.target.value
                                  )
                                }
                                onBlur={() => handleQuantityBlur(item.cartId)}
                                style={{
                                  width: "100px",
                                  height: "26px",
                                  fontSize: "14px",
                                  background: "transparent",
                                  appearance: "textfield",
                                }}
                              />
                              <button
                                className='btn btn-outline-secondary btn-sm px-2 py-0'
                                onClick={() =>
                                  handleQuantityChange(item.cartId, 1)
                                }
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className='text-center cart-price'>{shipping}</td>

                          <td className='text-center cart-total'>
                            {isNaN(total) || total === 0 ? (
                              <button
                                onClick={() =>
                                  handleContactSupplier(item.supplierId, [item])
                                } // ✅ Function call
                                style={{
                                  color: "#d9534f", // ✅ Match Contact Supplier button color
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  background: "none", // ✅ Make it look like a link
                                  border: "none", // ✅ Remove button border
                                  padding: "0", // ✅ Remove padding
                                  fontSize: "inherit", // ✅ Keep consistent font size
                                  textDecoration: "none", // ❌ Remove underline
                                }}
                              >
                                Contact Supplier
                              </button>
                            ) : (
                              `SR ${total.toFixed(2)}`
                            )}
                          </td>

                          <td className='text-center'>
                            <button
                              className='btn btn-outline-secondary btn-sm rounded-circle cart-remove-btn'
                              onClick={() => handleRemoveItem(item.cartId)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='border p-2 small bg-transparent mt-2'>
              <h6 className='cart-summary-title text-center'>Cart Summary</h6>

              {(() => {
                const supplierSubtotal = items.reduce(
                  (sum, item) =>
                    sum + safeValue(item.price) * safeValue(item.quantity),
                  0
                );
                const supplierShipping = items.reduce(
                  (sum, item) => sum + safeValue(item.shippingCost),
                  0
                );
                const supplierTax =
                  (supplierSubtotal + supplierShipping) * 0.15;
                const supplierTotal =
                  supplierSubtotal + supplierShipping + supplierTax - discount;

                return (
                  <>
                    <p className='d-flex justify-content-between mb-1 cart-summary-text'>
                      <span>Subtotal:</span>
                      <span>SR {supplierSubtotal.toFixed(2)}</span>
                    </p>
                    <p className='d-flex justify-content-between mb-1 cart-summary-text'>
                      <span>Shipping:</span>
                      <span>SR {supplierShipping.toFixed(2)}</span>
                    </p>
                    <p className='d-flex justify-content-between mb-1 cart-summary-text'>
                      <span>VAT (15%):</span>
                      <span>SR {supplierTax.toFixed(2)}</span>
                    </p>
                    <p className='d-flex justify-content-between mb-1 cart-summary-text'>
                      <span>Discount:</span>
                      <span>- SR {discount.toFixed(2)}</span>
                    </p>
                    <p className='d-flex justify-content-between fw-bold mb-2 cart-summary-text'>
                      <span>Total:</span>
                      <span>
                        {supplierTotal > 0
                          ? `SR ${supplierTotal.toFixed(2)}`
                          : "Contact Supplier"}
                      </span>
                    </p>
                    <p
                      className='d-flex justify-content-between align-items-center mb-2'
                      style={{ fontSize: "12px" }}
                    >
                      <strong>Coupon Code:</strong>
                      <button
                        className='btn btn-link p-0 small'
                        onClick={() => setShowCouponInput(!showCouponInput)}
                        style={{ color: "#2c6449", fontSize: "12px" }}
                      >
                        {showCouponInput ? "Hide" : "Add Coupon"}
                      </button>
                    </p>

                    {showCouponInput && (
                      <div className='d-flex align-items-center mb-2'>
                        <input
                          type='text'
                          className='form-control small me-2'
                          placeholder='Enter Coupon Code'
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          style={{
                            height: "28px",
                            fontSize: "12px",
                          }}
                        />
                        <button
                          className='btn btn-dark btn-sm'
                          onClick={handleApplyCoupon}
                          style={{
                            fontSize: "12px",
                            padding: "4px 10px",
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    <div className='d-flex justify-content-between mt-2 gap-2'>
                      {/* Checkout Button */}
                      <button
                        className='btn flex-fill py-1 px-2'
                        onClick={() =>
                          navigate("/checkout", {
                            state: { cartItems: items, supplierId },
                          })
                        }
                        disabled={isCheckoutDisabled}
                        style={{
                          backgroundColor: isCheckoutDisabled
                            ? "#ccc"
                            : "#2c6449",
                          border: `1px solid ${
                            isCheckoutDisabled ? "#ccc" : "#2c6449"
                          }`,
                          color: isCheckoutDisabled ? "#666" : "#fff",
                          cursor: isCheckoutDisabled
                            ? "not-allowed"
                            : "pointer",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Checkout
                      </button>

                      {/* Contact Supplier Button */}
                      <button
                        className='btn flex-fill py-1 px-2'
                        onClick={() => handleContactSupplier(supplierId, items)}
                        style={{
                          backgroundColor: "#d9534f",
                          border: "1px solid #d9534f",
                          color: "#fff",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#fff";
                          e.target.style.color = "#d9534f";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#d9534f";
                          e.target.style.color = "#fff";
                        }}
                      >
                        Contact Supplier
                      </button>

                      {/* Review Order Button */}
                      <button
                        className='btn flex-fill py-1 px-2'
                        onClick={() => handleReviewOrder(supplierId)}
                        style={{
                          backgroundColor: "#0056b3",
                          border: "1px solid #0056b3",
                          color: "#fff",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#fff";
                          e.target.style.color = "#0056b3";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#0056b3";
                          e.target.style.color = "#fff";
                        }}
                      >
                        Review Order
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ))}

      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title={notificationContent.title}
        message={notificationContent.message}
      />
      <ReviewOrderModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        supplierId={selectedSupplierId}
      />
    </div>
  );
};

export default CartPage;
