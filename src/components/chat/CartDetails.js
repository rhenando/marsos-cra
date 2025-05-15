// File: CartDetails.js
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Notification from "../global/Notification";

const CartDetails = ({ cartId, supplierId }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOwnerId, setCartOwnerId] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [previousValues, setPreviousValues] = useState({});

  useEffect(() => {
    if (!cartId || !currentUser) return;

    const cartRef = doc(db, "carts", cartId);

    const fetchCart = async () => {
      const snap = await getDoc(cartRef);
      if (snap.exists()) {
        const data = snap.data();
        const items =
          data.items?.map((item) => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            shippingCost: Number(item.shippingCost) || 0,
          })) || [];

        const filtered = items.filter((item) => item.supplierId === supplierId);
        setCartItems(filtered);
        setCartOwnerId(cartId);

        const prev = {};
        filtered.forEach((item, i) => {
          prev[i] = {
            quantity: item.quantity,
            price: item.price,
            shippingCost: item.shippingCost,
          };
        });
        setPreviousValues(prev);
      }
      setLoading(false);
    };

    fetchCart();

    const unsubscribe = onSnapshot(cartRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const items =
          data.items?.map((item) => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            shippingCost: Number(item.shippingCost) || 0,
          })) || [];

        const filtered = items.filter((item) => item.supplierId === supplierId);
        setCartItems(filtered);
      }
    });

    return () => unsubscribe();
  }, [cartId, currentUser, supplierId]);

  const isBuyer = currentUser?.uid === cartOwnerId;
  const isSupplier = currentUser?.uid === supplierId;

  const showNotification = (msg) => {
    setNotificationMessage(msg);
    setIsNotificationOpen(true);
    setTimeout(() => setIsNotificationOpen(false), 3000);
  };

  const handleFieldChange = (i, field, val) => {
    const parsed = val === "" ? 0 : parseFloat(val) || 0;
    setCartItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: parsed } : item))
    );
  };

  const handleFieldBlur = async (i, field) => {
    const updatedItem = cartItems[i];
    if (updatedItem[field] == null || isNaN(updatedItem[field])) {
      showNotification(`${field} can't be empty!`);
      updatedItem[field] = previousValues[i][field] ?? 0;
    }

    updatedItem.subtotal = (
      updatedItem.quantity * updatedItem.price +
      updatedItem.shippingCost
    ).toFixed(2);

    const cartRef = doc(db, "carts", cartId);
    await updateDoc(cartRef, { items: cartItems });
  };

  if (loading) return <p>Loading cart items...</p>;
  if (!isBuyer && !isSupplier)
    return <p>You are not authorized to view this cart.</p>;

  return (
    <div>
      <h6 className='fw-bold mb-3'>Cart Items</h6>

      {isNotificationOpen && (
        <Notification
          message={notificationMessage}
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}

      {/* Mobile-Friendly Cards Only */}
      <div className='d-block'>
        {cartItems.map((item, i) => (
          <div key={i} className='card mb-3 shadow-sm'>
            <div className='card-body'>
              <div className='d-flex align-items-center mb-3'>
                <img
                  src={item.mainImageUrl || "https://via.placeholder.com/50"}
                  alt={item.name}
                  className='img-thumbnail me-3'
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
                <div>
                  <h6 className='fw-bold mb-0'>{item.name}</h6>
                  <small className='text-muted'>
                    {item.color} | {item.size}
                  </small>
                </div>
              </div>

              {/* Qty */}
              <div className='mb-2 d-flex align-items-center gap-2'>
                <strong className='mb-0'>Qty:</strong>
                {isBuyer ? (
                  <input
                    type='number'
                    className='form-control form-control-sm'
                    style={{ maxWidth: "80px" }}
                    value={item.quantity}
                    onChange={(e) =>
                      handleFieldChange(i, "quantity", e.target.value)
                    }
                    onBlur={() => handleFieldBlur(i, "quantity")}
                  />
                ) : (
                  <span>{item.quantity}</span>
                )}
              </div>

              {/* Price */}
              <div className='mb-2 d-flex align-items-center gap-2'>
                <strong className='mb-0'>Price:</strong>
                {isSupplier ? (
                  <input
                    type='number'
                    className='form-control form-control-sm'
                    style={{ maxWidth: "100px" }}
                    value={item.price}
                    onChange={(e) =>
                      handleFieldChange(i, "price", e.target.value)
                    }
                    onBlur={() => handleFieldBlur(i, "price")}
                  />
                ) : (
                  <span>SAR {item.price.toFixed(2)}</span>
                )}
              </div>

              {/* Shipping */}
              <div className='mb-2 d-flex align-items-center gap-2'>
                <strong className='mb-0'>Shipping:</strong>
                {isSupplier ? (
                  <input
                    type='number'
                    className='form-control form-control-sm'
                    style={{ maxWidth: "100px" }}
                    value={item.shippingCost}
                    onChange={(e) =>
                      handleFieldChange(i, "shippingCost", e.target.value)
                    }
                    onBlur={() => handleFieldBlur(i, "shippingCost")}
                  />
                ) : (
                  <span>SAR {item.shippingCost.toFixed(2)}</span>
                )}
              </div>

              {/* Subtotal */}
              <div className='mt-2'>
                <strong>Total:</strong> SAR{" "}
                {(
                  Number(item.quantity) * Number(item.price) +
                  Number(item.shippingCost)
                ).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartDetails;
