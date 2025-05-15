// File: CartChat.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../global/LoadingSpinner";
import CartDetails from "./CartDetails";
import ChatMessages from "../chat/shared/ChatMessages"; // ✅ Reused shared chat UI

const CartChat = () => {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supplierName, setSupplierName] = useState("Unknown Supplier");
  const [buyerName, setBuyerName] = useState("Unknown Buyer");

  useEffect(() => {
    if (!currentUser) return;

    const fetchChat = async () => {
      try {
        const chatRef = doc(db, "cartChats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          const chatData = chatSnap.data();

          if (
            chatData.buyerId !== currentUser.uid &&
            chatData.supplierId !== currentUser.uid
          ) {
            console.error("❌ Unauthorized access!");
            navigate("/");
            return;
          }

          setChatDetails(chatData);

          if (chatData.buyerId) {
            const buyerRef = doc(db, "users", chatData.buyerId);
            const buyerSnap = await getDoc(buyerRef);
            if (buyerSnap.exists()) {
              setBuyerName(buyerSnap.data().name || "Unknown Buyer");
            }
          }

          if (chatData.supplierId) {
            const supplierRef = doc(db, "users", chatData.supplierId);
            const supplierSnap = await getDoc(supplierRef);
            if (supplierSnap.exists()) {
              setSupplierName(supplierSnap.data().name || "Unknown Supplier");
            }
          }
        } else {
          console.warn("⚠️ Cart Chat not found.");
          navigate("/");
        }
      } catch (error) {
        console.error("❌ Error fetching chat:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, currentUser, navigate]);

  // ✅ Live listener for messages
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(doc(db, "cartChats", chatId), (snapshot) => {
      if (snapshot.exists()) {
        setMessages(snapshot.data().messages || []);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  // ✅ Send handler for ChatMessages
  const handleSendMessage = async (messageText, senderName) => {
    if (!messageText.trim()) return;

    try {
      const chatRef = doc(db, "cartChats", chatId);
      await updateDoc(chatRef, {
        messages: arrayUnion({
          senderId: currentUser.uid,
          senderName,
          message: messageText.trim(),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!chatDetails) return <p>⚠️ Cart Chat not found.</p>;

  return (
    <div className='container py-3'>
      <h6 className='fw-bold mb-3 text-center text-md-start'>
        Cart Chat with{" "}
        {currentUser.uid === chatDetails.supplierId ? buyerName : supplierName}
      </h6>

      <div className='row g-3'>
        {/* LEFT COLUMN: Cart Details */}
        <div className='col-12 col-md-5'>
          {chatDetails?.buyerId ? (
            <CartDetails
              cartId={chatDetails.buyerId}
              supplierId={chatDetails.supplierId}
            />
          ) : (
            <p className='text-muted'>❌ No Cart ID Found</p>
          )}
        </div>

        {/* RIGHT COLUMN: Chat Messages */}
        <div className='col-12 col-md-7'>
          <ChatMessages messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default CartChat;
