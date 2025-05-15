// File: components/cart/CartPage.js
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
import ReviewOrderModal from "../global/ReviewOrderModal";
import { useTranslation } from "react-i18next";
import Currency from "../global/CurrencySymbol";

const CartPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: "",
    message: "",
  });
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const { cartItems, setCartItems, isCheckoutDisabled } = useCart();
  const [supplierNames, setSupplierNames] = useState({});

  const showNotification = (title, message) => {
    setNotificationContent({ title, message });
    setIsNotificationOpen(true);
  };

  useEffect(() => {
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
    fetchSupplierNames();
  }, []);

  const groupedBySupplier = cartItems.reduce((groups, item) => {
    const supplierId = item.supplierId;
    if (!groups[supplierId]) groups[supplierId] = [];
    groups[supplierId].push(item);
    return groups;
  }, {});

  const safeValue = (val) => (isNaN(val) || val === null ? 0 : val);

  const handleQuantityChange = (cartId, change) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleQuantityManualChange = (cartId, value) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId
          ? { ...item, tempQuantity: value.replace(/\D/g, "") }
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
                  ? item.quantity
                  : parseInt(item.tempQuantity, 10),
              tempQuantity: undefined,
            }
          : item
      )
    );
  };

  const handleRemoveItem = async (cartId) => {
    const updatedCartItems = cartItems.filter((item) => item.cartId !== cartId);
    setCartItems(updatedCartItems);
    try {
      await updateDoc(doc(db, "carts", currentUser.uid), {
        items: updatedCartItems,
      });
      showNotification("Item Removed", "Item successfully removed.");
    } catch {
      showNotification("Error", "Failed to update cart.");
    }
  };

  const handleApplyCoupon = () => {
    const validCoupons = { DISCOUNT10: 10, SAVE20: 20 };
    if (validCoupons[couponCode]) {
      setDiscount(validCoupons[couponCode]);
      showNotification(
        "Coupon Applied",
        `You saved SR ${validCoupons[couponCode]}!`
      );
    } else {
      setDiscount(0);
      showNotification("Invalid Coupon", "This code is not valid.");
    }
    setCouponCode("");
    setShowCouponInput(false);
  };

  const handleContactSupplier = async (supplierId, items) => {
    if (!currentUser) return navigate("/user-login");

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
      }
      navigate(`/cart-chat/${chatDocId}`, { state: { chatId: chatDocId } });
    } catch (error) {
      showNotification("Error", "Failed to contact supplier.");
    }
  };

  const handleReviewOrder = (supplierId) => {
    if (!supplierId)
      return showNotification("Error", "Supplier ID is missing.");
    setSelectedSupplierId(supplierId);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedSupplierId(null);
    setIsReviewModalOpen(false);
  };

  if (!cartItems.length)
    return (
      <p className='text-center text-sm py-10'>{t("cart.emptyMessage")}</p>
    );

  return (
    <div className='max-w-screen-xl mx-auto px-4 py-6'>
      <h2 className='text-lg font-semibold text-center mb-6'>
        Your Cart ({cartItems.length} items)
      </h2>

      {Object.entries(groupedBySupplier).map(([supplierId, items]) => {
        const supplierSubtotal = items.reduce(
          (sum, item) => sum + safeValue(item.price) * safeValue(item.quantity),
          0
        );
        const supplierShipping = items.reduce(
          (sum, item) => sum + safeValue(item.shippingCost),
          0
        );
        const supplierTax = (supplierSubtotal + supplierShipping) * 0.15;
        const supplierTotal =
          supplierSubtotal + supplierShipping + supplierTax - discount;

        return (
          <div key={supplierId} className='mb-10'>
            <h3 className='font-bold text-sm text-gray-800 mb-3'>
              Supplier: {supplierNames[supplierId] || supplierId}
            </h3>

            {/* --- Mobile View Cards --- */}
            <div className='md:hidden space-y-4'>
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className='border rounded p-4 shadow-sm bg-white'
                >
                  <div className='flex gap-3 mb-2'>
                    <img
                      src={
                        item.mainImageUrl || "https://via.placeholder.com/60"
                      }
                      alt={item.name}
                      className='w-16 h-16 object-cover rounded'
                    />
                    <div>
                      <p className='font-semibold capitalize'>{item.name}</p>
                      <p className='text-xs text-gray-500'>
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </div>
                  </div>
                  <p className='text-sm'>
                    Price: <Currency amount={safeValue(item.price)} />
                  </p>
                  <p className='text-sm'>
                    Shipping: <Currency amount={safeValue(item.shippingCost)} />
                  </p>
                  <p className='text-sm'>
                    Total:{" "}
                    {isNaN(item.price * item.quantity) ? (
                      <span
                        className='text-red-600 underline cursor-pointer'
                        onClick={() =>
                          handleContactSupplier(item.supplierId, [item])
                        }
                      >
                        Contact Supplier
                      </span>
                    ) : (
                      <Currency amount={item.price * item.quantity} />
                    )}
                  </p>
                  <div className='flex items-center gap-2 mt-3'>
                    <button
                      onClick={() => handleQuantityChange(item.cartId, -1)}
                      className='border px-2 rounded'
                    >
                      -
                    </button>
                    <input
                      value={item.tempQuantity ?? item.quantity}
                      onChange={(e) =>
                        handleQuantityManualChange(item.cartId, e.target.value)
                      }
                      onBlur={() => handleQuantityBlur(item.cartId)}
                      className='w-12 border text-center rounded'
                    />
                    <button
                      onClick={() => handleQuantityChange(item.cartId, 1)}
                      className='border px-2 rounded'
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.cartId)}
                      className='text-red-500 text-xs ml-auto'
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Desktop Table View --- */}
            <div className='hidden md:block overflow-x-auto bg-white shadow rounded'>
              <table className='min-w-full text-sm'>
                <thead className='bg-gray-100 text-gray-700'>
                  <tr>
                    <th className='px-4 py-2 text-left'>Item</th>
                    <th className='px-4 py-2 text-center'>Price</th>
                    <th className='px-4 py-2 text-center'>Qty</th>
                    <th className='px-4 py-2 text-center'>Shipping</th>
                    <th className='px-4 py-2 text-center'>Total</th>
                    <th className='px-4 py-2 text-center'>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.cartId} className='border-b'>
                      <td className='px-4 py-3'>
                        <div className='flex gap-3 items-start'>
                          <img
                            src={
                              item.mainImageUrl ||
                              "https://via.placeholder.com/50"
                            }
                            alt={item.name}
                            className='w-14 h-14 object-cover rounded'
                          />
                          <div>
                            <p className='font-medium text-gray-800 capitalize'>
                              {item.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                              Size: {item.size} | Color: {item.color}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='text-center px-4'>
                        <Currency amount={safeValue(item.price)} />
                      </td>
                      <td className='text-center px-4'>
                        <div className='flex justify-center items-center gap-1'>
                          <button
                            className='px-2 text-gray-700 border rounded'
                            onClick={() =>
                              handleQuantityChange(item.cartId, -1)
                            }
                          >
                            -
                          </button>
                          <input
                            className='w-12 text-center border rounded'
                            value={item.tempQuantity ?? item.quantity}
                            onChange={(e) =>
                              handleQuantityManualChange(
                                item.cartId,
                                e.target.value
                              )
                            }
                            onBlur={() => handleQuantityBlur(item.cartId)}
                          />
                          <button
                            className='px-2 text-gray-700 border rounded'
                            onClick={() => handleQuantityChange(item.cartId, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className='text-center px-4'>
                        <Currency amount={safeValue(item.shippingCost)} />
                      </td>
                      <td className='text-center px-4'>
                        {isNaN(item.price * item.quantity) ? (
                          <button
                            onClick={() =>
                              handleContactSupplier(item.supplierId, [item])
                            }
                            className='text-red-600 underline text-xs'
                          >
                            Contact Supplier
                          </button>
                        ) : (
                          <Currency amount={item.price * item.quantity} />
                        )}
                      </td>
                      <td className='text-center px-4'>
                        <button
                          onClick={() => handleRemoveItem(item.cartId)}
                          className='text-red-500 hover:text-red-700 text-sm'
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Shared Summary Actions */}
            <div className='mt-4 border rounded p-4 text-sm bg-gray-50'>
              <div className='flex justify-between mb-1'>
                <span>Subtotal</span>
                <span>
                  <Currency amount={supplierSubtotal} />
                </span>
              </div>
              <div className='flex justify-between mb-1'>
                <span>Shipping</span>
                <Currency amount={supplierShipping} />
              </div>
              <div className='flex justify-between mb-1'>
                <span>VAT (15%)</span>
                <Currency amount={supplierTax} />
              </div>
              <div className='flex justify-between mb-1'>
                <span>Discount</span>
                <span>
                  - <Currency amount={discount} />
                </span>
              </div>
              <div className='flex justify-between font-semibold text-base mt-2'>
                <span>Total</span>
                <span>
                  {supplierTotal > 0 ? (
                    <Currency amount={supplierTotal} />
                  ) : (
                    "Contact Supplier"
                  )}
                </span>
              </div>

              {/* CTA Buttons */}
              <div className='mt-4 flex flex-col gap-2'>
                {showCouponInput && (
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      className='w-full border rounded px-2 py-1 text-sm'
                      placeholder='Enter Coupon Code'
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className='bg-black text-white px-3 py-1 text-sm rounded'
                    >
                      Apply
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowCouponInput((prev) => !prev)}
                  className='text-xs text-[#2c6449] underline'
                >
                  {showCouponInput ? "Hide Coupon" : "Add Coupon"}
                </button>

                <div className='flex flex-col md:flex-row gap-2 mt-2'>
                  <button
                    disabled={isCheckoutDisabled}
                    className={`py-2 px-4 text-sm rounded text-white ${
                      isCheckoutDisabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#2c6449]"
                    }`}
                    onClick={() =>
                      navigate("/checkout", {
                        state: { cartItems: items, supplierId },
                      })
                    }
                  >
                    Checkout
                  </button>
                  <button
                    onClick={() => handleContactSupplier(supplierId, items)}
                    className='py-2 px-4 text-sm rounded text-white bg-red-600 hover:bg-red-700'
                  >
                    Contact Supplier
                  </button>
                  <button
                    onClick={() => handleReviewOrder(supplierId)}
                    className='py-2 px-4 text-sm rounded text-white bg-blue-600 hover:bg-blue-700'
                  >
                    Review Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
