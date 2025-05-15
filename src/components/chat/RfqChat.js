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
import ChatMessages from "../chat/shared/ChatMessages"; // ✅ Reusable chat UI

const RfqChat = () => {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supplierName, setSupplierName] = useState("Unknown Supplier");
  const [buyerName, setBuyerName] = useState("Unknown Buyer");
  const [rfqDetails, setRfqDetails] = useState(null);
  const [userName, setUserName] = useState("User");

  // ✅ Fetch chat & RFQ details
  useEffect(() => {
    if (!currentUser) return;

    const fetchChatAndRFQ = async () => {
      try {
        const chatRef = doc(db, "rfqChats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          const chatData = chatSnap.data();

          // ✅ Check authorization
          if (
            chatData.buyerId !== currentUser.uid &&
            chatData.supplierId !== currentUser.uid
          ) {
            console.error("❌ Unauthorized access!");
            navigate("/");
            return;
          }

          setChatDetails(chatData);

          // ✅ Get user’s display name
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserName(userSnap.data().name || "User");
          }

          // ✅ Fetch buyer & supplier names
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

          // ✅ Fetch linked RFQ
          if (chatData.rfqId) {
            const rfqRef = doc(db, "rfqs", chatData.rfqId);
            const rfqSnap = await getDoc(rfqRef);
            if (rfqSnap.exists()) {
              setRfqDetails(rfqSnap.data());
            } else {
              console.warn("⚠️ RFQ not found!");
            }
          }
        } else {
          console.warn("⚠️ RFQ Chat not found.");
          navigate("/");
        }
      } catch (error) {
        console.error("❌ Error fetching chat:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchChatAndRFQ();
  }, [chatId, currentUser, navigate]);

  // ✅ Listen to messages in real-time
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(doc(db, "rfqChats", chatId), (snapshot) => {
      if (snapshot.exists()) {
        setMessages(snapshot.data().messages || []);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  // ✅ Handle send message
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    try {
      const chatRef = doc(db, "rfqChats", chatId);
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

  if (loading) return <LoadingSpinner />;
  if (!chatDetails) return <p>⚠️ RFQ Chat not found.</p>;

  return (
    <div className='container py-3'>
      <h6 className='fw-bold mb-3 text-center text-md-start'>
        RFQ Query with{" "}
        {currentUser.uid === chatDetails.buyerId ? supplierName : buyerName}
      </h6>

      <div className='row g-3'>
        {/* LEFT COLUMN: RFQ Summary */}
        <div className='col-12 col-md-5'>
          {rfqDetails ? (
            <div className='card shadow-sm'>
              <div className='card-body'>
                <h6 className='fw-bold mb-2'>RFQ Summary</h6>
                <p>
                  <strong>Buyer:</strong> {buyerName}
                </p>
                <p>
                  <strong>Category:</strong> {rfqDetails.category || "N/A"}
                </p>
                <p>
                  <strong>Subcategory:</strong>{" "}
                  {rfqDetails.subcategory || "N/A"}
                </p>
                <p>
                  <strong>Product:</strong> {rfqDetails.productDetails || "N/A"}
                </p>
                <p>
                  <strong>Size:</strong> {rfqDetails.size || "N/A"}
                </p>
                <p>
                  <strong>Color:</strong> {rfqDetails.color || "N/A"}
                </p>
                <p>
                  <strong>Shipping To:</strong> {rfqDetails.shipping || "N/A"}
                </p>

                {rfqDetails.fileURL ? (
                  <p>
                    <strong>Attached File:</strong>{" "}
                    <a
                      href={rfqDetails.fileURL}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary'
                    >
                      Download File
                    </a>
                  </p>
                ) : (
                  <p>
                    <strong>Attached File:</strong> No file uploaded
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className='text-muted'>No RFQ details found.</p>
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

export default RfqChat;
