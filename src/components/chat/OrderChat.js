// File: OrderChat.js
import React, { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import LoadingSpinner from "../global/LoadingSpinner";
import ChatMessages from "../chat/shared/ChatMessages";

const OrderChat = () => {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supplierName, setSupplierName] = useState("Unknown Supplier");
  const [userName, setUserName] = useState("Buyer");
  const [extraData, setExtraData] = useState(null);
  const [billNumber, setBillNumber] = useState(null);

  // ✅ Fetch current user name
  useEffect(() => {
    if (!currentUser) return;

    const fetchUserName = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserName(userSnap.data().name || "Buyer");
        }
      } catch (error) {
        console.error("❌ Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, [currentUser]);

  // ✅ Fetch or Create Chat Document
  useEffect(() => {
    if (!currentUser) return;

    const fetchChat = async () => {
      try {
        const chatRef = doc(db, "orderChats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          const chatData = chatSnap.data();

          if (
            chatData.buyerId !== currentUser.uid &&
            chatData.supplierId !== currentUser.uid
          ) {
            console.error("❌ Unauthorized access to chat!");
            navigate("/");
            return;
          }

          setChatDetails(chatData);
          setSupplierName(chatData.supplierName || "Unknown Supplier");
        } else {
          const chatParts = chatId.split("_");
          if (chatParts.length < 3) {
            console.error("❌ Invalid chat ID format:", chatId);
            navigate("/");
            return;
          }

          const buyerId = chatParts[1];
          const supplierId = chatParts[2];

          const supplierRef = doc(db, "users", supplierId);
          const supplierSnap = await getDoc(supplierRef);
          const supplierName = supplierSnap.exists()
            ? supplierSnap.data().name || "Unknown Supplier"
            : "Unknown Supplier";

          const newChatData = {
            chatId,
            buyerId,
            supplierId,
            supplierName,
            messages: [],
            createdAt: new Date().toISOString(),
            rfqId: null,
            billNumber,
          };

          await setDoc(chatRef, newChatData);
          setChatDetails(newChatData);
          setSupplierName(supplierName);
        }
      } catch (error) {
        console.error("❌ Error fetching or creating chat:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, currentUser, navigate, billNumber]);

  // ✅ Real-time message updates
  useEffect(() => {
    if (!currentUser) return;

    const chatRef = doc(db, "orderChats", chatId);
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(snapshot.data().messages || []);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  // ✅ Parse searchParams
  useEffect(() => {
    const extraDataParam = searchParams.get("extraData");
    if (extraDataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(extraDataParam));
        setExtraData(parsed);
        setBillNumber(parsed.billNumber || null);
      } catch (error) {
        console.error("❌ Error parsing extra data:", error);
      }
    }
  }, [searchParams]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    try {
      const chatRef = doc(db, "orderChats", chatId);
      await updateDoc(chatRef, {
        messages: arrayUnion({
          senderId: currentUser.uid,
          senderName: userName,
          message: messageText.trim(),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className='badge bg-success'>{status}</span>;
      case "PENDING":
        return <span className='badge bg-warning text-dark'>{status}</span>;
      default:
        return <span className='badge bg-danger'>{status}</span>;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!chatDetails) return <p>⚠️ Chat not found. Please try again.</p>;

  return (
    <div className='container py-3'>
      <h6 className='fw-bold mb-3 text-center text-md-start'>
        Order Chat with {supplierName}
      </h6>

      <div className='row g-3'>
        {/* LEFT COLUMN: Order Summary */}
        <div className='col-12 col-md-5'>
          {extraData?.billNumber ? (
            <div className='card shadow-sm'>
              <div className='card-body'>
                <h6 className='fw-bold mb-2'>
                  Invoice: {extraData.billNumber}
                </h6>
                <p className='mb-1'>
                  <strong>Total:</strong> {extraData.totalAmount} SR
                </p>
                <p className='mb-3'>
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(extraData.orderStatus)}
                </p>

                {/* ✅ View Invoice - Always shown, disabled if not approved */}
                <Link
                  to={
                    extraData.orderStatus === "APPROVED"
                      ? `/review-invoice/${extraData.billNumber}`
                      : "#"
                  }
                  className={`btn btn-sm fw-semibold w-100 ${
                    extraData.orderStatus !== "APPROVED"
                      ? "btn-secondary disabled"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      extraData.orderStatus === "APPROVED"
                        ? "#2c6449"
                        : undefined,
                    borderColor:
                      extraData.orderStatus === "APPROVED"
                        ? "#2c6449"
                        : undefined,
                    color:
                      extraData.orderStatus === "APPROVED" ? "#fff" : undefined,
                    cursor:
                      extraData.orderStatus === "APPROVED"
                        ? "pointer"
                        : "not-allowed",
                  }}
                  onClick={(e) => {
                    if (extraData.orderStatus !== "APPROVED") {
                      e.preventDefault();
                    }
                  }}
                >
                  View Invoice
                </Link>
              </div>
            </div>
          ) : (
            <p className='text-muted'>No order details found.</p>
          )}
        </div>

        {/* RIGHT COLUMN: Chat Interface */}
        <div className='col-12 col-md-7'>
          <ChatMessages messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default OrderChat;
