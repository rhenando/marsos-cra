import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import LoadingSpinner from "../global/LoadingSpinner";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { clearCartInFirestore, cartItems } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getResourcePath = () => {
      const params = new URLSearchParams(location.search);
      return params.get("resourcePath");
    };

    const saveOrder = async (data) => {
      try {
        const orderData = {
          userId: currentUser?.uid || "anonymous",
          userEmail: data.customerEmail || "unknown",
          userName: data.customerName || "Guest Buyer",
          totalAmount: data.amount || "0.00",
          cardBrand: data.cardBrand || "N/A",
          transactionId: data.transactionId || "N/A",
          createdAt: new Date(),
          paymentMethod: data.paymentType || "Card",
          items: cartItems,
          orderStatus: "Paid",
        };

        await addDoc(collection(db, "orders"), orderData);
        console.log("✅ Order saved to Firestore:", orderData);

        await clearCartInFirestore();
        console.log("🧹 Cart cleared");

        setTimeout(() => navigate("/orders"), 2000);
      } catch (error) {
        console.error("🔥 Error saving order:", error);
      }
    };

    const verifyAndSave = async () => {
      const resourcePath = getResourcePath();
      if (!resourcePath) {
        console.warn("⚠️ No resourcePath found in URL.");
        return;
      }

      try {
        const response = await axios.post(
          "https://marsos.com.sa/api3/api/verify-payment",
          { resourcePath }
        );

        if (response.data?.success) {
          console.log("✅ Payment verified:", response.data);

          await saveOrder({
            amount: response.data.amount,
            paymentType: response.data.paymentType,
            cardBrand: response.data.cardBrand,
            customerEmail: response.data.customerEmail,
            customerName: response.data.customerName || "Buyer",
            transactionId:
              response.data.transactionId || response.data.resourcePath,
          });
        } else {
          console.error("❌ Payment verification failed:", response.data);
        }
      } catch (err) {
        console.error("🔥 Axios error during payment verification:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyAndSave();
  }, [currentUser, cartItems, clearCartInFirestore, navigate, location.search]);

  return (
    <div className='container my-5 text-center'>
      {loading ? (
        <>
          <LoadingSpinner />
          <h4>Verifying your payment... please wait.</h4>
        </>
      ) : (
        <h4>✅ Payment successful! Redirecting to your orders...</h4>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
