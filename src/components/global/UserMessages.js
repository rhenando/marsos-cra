import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const UserMessages = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserRoleAndChats = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const role = userSnap.data().role;
          setUserRole(role);

          const chatSources = [
            {
              collectionName: "rfqChats",
              label: "RFQ Inquiry",
              pathBuilder: (id) => `/rfq-chat/${id}`,
              filterKey: role === "supplier" ? "supplierId" : "buyerId",
            },
            {
              collectionName: "productChats",
              label: "Product Inquiry",
              pathBuilder: (id) => `/product-chat/${id}`,
              filterKey: role === "supplier" ? "supplierId" : "buyerId",
            },
            {
              collectionName: "cartChats",
              label: "Cart Inquiry",
              pathBuilder: (id) => `/cart-chat/${id}`,
              filterKey: role === "supplier" ? "supplierId" : "buyerId",
            },
            {
              collectionName: "orderChats",
              label: "Order Inquiry",
              pathBuilder: async (id, data) => {
                let billNumber = data.billNumber || null;
                let totalAmount = null;
                let orderStatus = null;

                if (billNumber) {
                  const orderSnap = await getDoc(doc(db, "orders", billNumber));
                  if (orderSnap.exists()) {
                    const orderData = orderSnap.data();
                    totalAmount = orderData.totalAmount || null;
                    orderStatus = orderData.orderStatus || null;
                  }
                }

                const encoded = encodeURIComponent(
                  JSON.stringify({ billNumber, totalAmount, orderStatus })
                );
                return `/order-chat/${id}?extraData=${encoded}`;
              },
              filterKey: role === "supplier" ? "supplierId" : "buyerId",
            },
          ];

          const unsubscribes = [];

          for (const source of chatSources) {
            const q = query(
              collection(db, source.collectionName),
              where(source.filterKey, "==", currentUser.uid)
            );

            const unsubscribe = onSnapshot(q, async (snap) => {
              const updatedChats = [];

              for (const docSnap of snap.docs) {
                const data = docSnap.data();

                const otherPartyId =
                  role === "supplier" ? data.buyerId : data.supplierId;

                let otherPartyName = "Unknown";
                if (otherPartyId) {
                  const userSnap = await getDoc(doc(db, "users", otherPartyId));
                  if (userSnap.exists()) {
                    otherPartyName = userSnap.data().name || "Unknown";
                  }
                }

                const path =
                  typeof source.pathBuilder === "function"
                    ? await source.pathBuilder(docSnap.id, data)
                    : source.pathBuilder;

                const readBy = data.readBy || [];
                const isRead = readBy.includes(currentUser.uid);

                updatedChats.push({
                  id: docSnap.id,
                  name: otherPartyName,
                  concernType: source.label,
                  chatPath: path,
                  lastUpdated: data.lastUpdated?.toDate() || new Date(0),
                  unread: !isRead,
                  collectionName: source.collectionName,
                });
              }

              setChats((prev) => {
                const filtered = prev.filter(
                  (c) => c.concernType !== source.label
                );
                const merged = [...filtered, ...updatedChats];
                return merged.sort((a, b) => b.lastUpdated - a.lastUpdated);
              });
            });

            unsubscribes.push(unsubscribe);
          }

          return () => {
            unsubscribes.forEach((unsub) => unsub());
          };
        }
      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndChats();
  }, [currentUser]);

  const getBadge = (type) => {
    const base =
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full";

    switch (type) {
      case "RFQ Inquiry":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            📄 RFQ
          </span>
        );
      case "Product Inquiry":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            📦 Product
          </span>
        );
      case "Cart Inquiry":
        return (
          <span className={`${base} bg-purple-100 text-purple-800`}>
            🛒 Cart
          </span>
        );
      case "Order Inquiry":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            🧾 Order
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-200 text-gray-700`}>❔ Other</span>
        );
    }
  };

  const handleMarkAsRead = async (chatId, collectionName) => {
    try {
      const chatRef = doc(db, collectionName, chatId);
      await updateDoc(chatRef, {
        readBy: arrayUnion(currentUser.uid),
      });

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, unread: false } : chat
        )
      );
    } catch (err) {
      console.error("❌ Failed to mark as read:", err);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesName = chat.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "All" || chat.concernType === selectedType;
    return matchesName && matchesType;
  });

  if (loading || !userRole) {
    return <p className='text-center text-sm mt-4'>Loading messages...</p>;
  }

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <h2 className='text-xl font-semibold mb-4'>Your Messages</h2>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-4 mb-4'>
        <input
          type='text'
          placeholder='Search by name...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='border border-gray-300 px-3 py-1 rounded w-48 text-sm'
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className='border border-gray-300 px-3 py-1 rounded text-sm'
        >
          <option value='All'>All Types</option>
          <option value='RFQ Inquiry'>RFQ Inquiry</option>
          <option value='Product Inquiry'>Product Inquiry</option>
          <option value='Cart Inquiry'>Cart Inquiry</option>
          <option value='Order Inquiry'>Order Inquiry</option>
        </select>
      </div>

      {filteredChats.length === 0 ? (
        <p className='text-gray-500 text-center text-sm'>No messages found.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm text-left border border-gray-200'>
            <thead className='bg-[#2c6449] text-white'>
              <tr>
                <th className='px-4 py-2'>
                  {userRole === "supplier" ? "Buyer" : "Supplier"}
                </th>
                <th className='px-4 py-2'>Concern Type</th>
                <th className='px-4 py-2'>Last Updated</th>
                <th className='px-4 py-2'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredChats.map((chat) => (
                <tr key={chat.id} className={chat.unread ? "bg-yellow-50" : ""}>
                  <td className='px-4 py-2'>{chat.name}</td>
                  <td className='px-4 py-2'>{getBadge(chat.concernType)}</td>
                  <td className='px-4 py-2 whitespace-nowrap'>
                    {chat.lastUpdated.toLocaleString()}
                  </td>
                  <td className='px-4 py-2 flex gap-2'>
                    <Link
                      to={chat.chatPath}
                      className='text-white bg-[#2c6449] px-3 py-1 rounded hover:bg-green-700 text-xs'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Open
                    </Link>

                    {chat.unread && (
                      <button
                        onClick={() =>
                          handleMarkAsRead(chat.id, chat.collectionName)
                        }
                        className='text-xs text-gray-700 bg-yellow-200 px-2 py-1 rounded hover:bg-yellow-300'
                      >
                        Mark as Read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserMessages;
