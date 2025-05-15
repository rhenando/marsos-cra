import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useParams, useLocation } from "react-router-dom";
import MiniProductDetails from "./MiniProductDetails";
import ChatMessages from "../chat/shared/ChatMessages";
import { useTranslation } from "react-i18next";

const ProductChat = () => {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [supplierName, setSupplierName] = useState("Supplier");
  const [buyerName, setBuyerName] = useState("Buyer");
  const [product, setProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialProductId = location.state?.productId;
  const initialSupplierId = location.state?.supplierId;
  const productId = initialProductId || chatDetails?.productId;
  const supplierId = initialSupplierId || chatDetails?.supplierId;

  const errorMessage = t("productChat.errorMessage");

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const chatRef = doc(db, "productChats", chatId);

    const fetchProduct = async (id) => {
      const productRef = doc(db, "products", id);
      const docSnap = await getDoc(productRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const miniProductRef = doc(db, "miniProductsData", chatId);
        const miniSnap = await getDoc(miniProductRef);

        if (!miniSnap.exists()) {
          await setDoc(miniProductRef, {
            ...data,
            originalProductId: id,
            createdAt: new Date().toISOString(),
          });
        }

        setProduct({
          ...data,
          name: data.productName,
          mainImage: data.mainImageUrl,
        });
      }
    };

    const initChat = async () => {
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        if (!initialProductId || !initialSupplierId) {
          setNotification(errorMessage);
          setLoading(false);
          return;
        }

        await setDoc(chatRef, {
          buyerId: currentUser.uid,
          supplierId: initialSupplierId,
          productId: initialProductId,
          messages: [],
          createdAt: new Date().toISOString(),
        });
      }

      const unsubscribe = onSnapshot(chatRef, (docSnap) => {
        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setChatDetails(chatData);
          setMessages(chatData.messages || []);
          fetchUserNames(chatData.buyerId, chatData.supplierId);
          fetchProduct(chatData.productId);
          setLoading(false);
        }
      });

      return () => unsubscribe();
    };

    const cleanup = initChat();
    return () => {
      cleanup.then((cb) => cb?.());
    };
  }, [chatId, currentUser, initialProductId, initialSupplierId, errorMessage]);

  const fetchUserNames = async (buyerId, supplierId) => {
    const buyerSnap = await getDoc(doc(db, "users", buyerId));
    const supplierSnap = await getDoc(doc(db, "users", supplierId));

    if (buyerSnap.exists()) setBuyerName(buyerSnap.data().name || "Buyer");
    if (supplierSnap.exists())
      setSupplierName(supplierSnap.data().name || "Supplier");
  };

  const handleSendMessage = async (messageText, senderName) => {
    if (!messageText.trim()) return;

    const chatRef = doc(db, "productChats", chatId);
    const message = {
      senderId: currentUser.uid,
      senderName,
      message: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    await updateDoc(chatRef, {
      messages: arrayUnion(message),
    });
  };

  if (loading) return <div className='h-[50vh]' />;

  if (!productId || !supplierId) {
    return (
      <div className='p-4'>
        <div className='bg-red-100 border border-red-400 text-red-700 text-center py-2 px-4 rounded text-sm'>
          ⚠️ {t("productChat.missingInfo")}
        </div>
      </div>
    );
  }

  return (
    <div className='p-4' dir={document.documentElement.dir}>
      <h6 className='font-bold mb-4 text-center ltr:text-left rtl:text-right text-lg'>
        {t("productChat.headingWith")}{" "}
        {currentUser.uid === supplierId ? buyerName : supplierName}
      </h6>

      <div className='flex flex-col gap-y-2 md:flex-row md:gap-4'>
        {/* Product Details - On Top (Mobile), Right (Desktop) */}
        <div className='w-full md:w-5/12 order-1 md:order-2'>
          <MiniProductDetails productId={chatId} supplierId={supplierId} />
        </div>

        {/* Chat Box - Below (Mobile), Left (Desktop) */}
        <div className='w-full md:w-7/12 order-2 md:order-1'>
          {notification && (
            <div className='bg-red-100 border border-red-400 text-red-700 py-2 px-4 mb-2 rounded text-sm'>
              {notification}
            </div>
          )}

          <div className='text-sm text-gray-600 mb-2 ltr:text-left rtl:text-right'>
            {t("productChat.productLabel")}: <strong>{product?.name}</strong>
          </div>

          <div className='h-[calc(90vh-220px)] overflow-y-auto'>
            <ChatMessages
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductChat;
