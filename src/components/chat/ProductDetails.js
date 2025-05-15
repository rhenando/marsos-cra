import React, { useState, useEffect } from "react";
import { doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Notification from "../global/Notification";
import { useLocation } from "react-router-dom";

const ProductCartDetails = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // ✅ From location.state passed during navigation
  const productId = location.state?.productId;
  const supplierId = location.state?.supplierId;
  const cartId = currentUser?.uid;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previousValues, setPreviousValues] = useState({});
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    if (!cartId || !productId || !supplierId) {
      console.warn("Missing cartId, productId, or supplierId");
      setLoading(false);
      return;
    }

    const cartRef = doc(db, "carts", cartId);

    const unsubscribe = onSnapshot(cartRef, (cartSnap) => {
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();

        const items = (cartData.items || []).map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          shippingCost: Number(item.shippingCost) || 0,
        }));

        const filteredItems = items.filter(
          (item) =>
            item.productId === productId && item.supplierId === supplierId
        );

        setCartItems(filteredItems);

        const prevValues = {};
        filteredItems.forEach((item, index) => {
          prevValues[index] = {
            quantity: item.quantity,
            price: item.price,
            shippingCost: item.shippingCost,
          };
        });
        setPreviousValues(prevValues);
      } else {
        setCartItems([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [cartId, productId, supplierId]);

  const showNotification = (message) => {
    setNotificationMessage(message);
    setIsNotificationOpen(true);
    setTimeout(() => setIsNotificationOpen(false), 3000);
  };

  const handleFieldChange = (index, field, value) => {
    const parsed = value === "" ? 0 : parseFloat(value) || 0;
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: parsed } : item))
    );
  };

  const handleFieldBlur = async (index, field) => {
    const updatedCart = [...cartItems];
    const updatedItem = updatedCart[index];

    if (updatedItem[field] === null || isNaN(updatedItem[field])) {
      showNotification(`${field} cannot be empty! Resetting.`);
      updatedItem[field] = previousValues[index][field] ?? 0;
    }

    updatedItem.quantity = Number(updatedItem.quantity) || 1;
    updatedItem.price = Number(updatedItem.price) || 0;
    updatedItem.shippingCost = Number(updatedItem.shippingCost) || 0;

    try {
      const cartRef = doc(db, "carts", cartId);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        const allItems = cartSnap.data().items || [];

        // Only update the specific item that matches productId + supplierId
        const updatedItems = allItems.map((item) => {
          if (
            item.productId === productId &&
            item.supplierId === supplierId &&
            item.cartId === updatedItem.cartId
          ) {
            return updatedItem;
          }
          return item;
        });

        await updateDoc(cartRef, { items: updatedItems });
      }
    } catch (error) {
      console.error(`❌ Error updating cart:`, error);
    }
  };

  if (loading) return <p>Loading cart details...</p>;

  return (
    <div>
      <h3>Cart Details</h3>

      {isNotificationOpen && (
        <Notification
          isOpen={isNotificationOpen}
          message={notificationMessage}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}

      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>Image</th>
            <th>Item</th>
            <th>Color</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Shipping</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, index) => (
            <tr key={index}>
              <td>
                <img
                  src={item.mainImageUrl || "https://via.placeholder.com/100"}
                  alt={item.name}
                  className='img-thumbnail'
                  style={{ maxWidth: "50px", maxHeight: "50px" }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.color || "—"}</td>
              <td>{item.size || "—"}</td>
              <td>
                <input
                  type='number'
                  min='1'
                  value={item.quantity}
                  onChange={(e) =>
                    handleFieldChange(index, "quantity", e.target.value)
                  }
                  onBlur={() => handleFieldBlur(index, "quantity")}
                  className='form-control form-control-sm'
                  style={{ width: "80px" }}
                />
              </td>
              <td>
                <input
                  type='number'
                  value={item.price}
                  onChange={(e) =>
                    handleFieldChange(index, "price", e.target.value)
                  }
                  onBlur={() => handleFieldBlur(index, "price")}
                  className='form-control form-control-sm'
                  style={{ width: "100px" }}
                />
              </td>
              <td>
                <input
                  type='number'
                  value={item.shippingCost}
                  onChange={(e) =>
                    handleFieldChange(index, "shippingCost", e.target.value)
                  }
                  onBlur={() => handleFieldBlur(index, "shippingCost")}
                  className='form-control form-control-sm'
                  style={{ width: "100px" }}
                />
              </td>
              <td>
                <strong>
                  SAR{" "}
                  {(
                    Number(item.quantity) * Number(item.price) +
                    Number(item.shippingCost)
                  ).toFixed(2)}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductCartDetails;
