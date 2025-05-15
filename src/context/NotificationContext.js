import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Importing AuthContext

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth(); // Get the authenticated user
  const [notifications, setNotifications] = useState([]);
  const [seenNotifications, setSeenNotifications] = useState(new Set());

  // Function to get user-specific storage keys
  const getNotificationKey = (userId) => `notifications_${userId}`;
  const getSeenKey = (userId) => `seenNotifications_${userId}`;

  // ✅ Load notifications only when `user` is defined
  useEffect(() => {
    if (user && user.id) {
      // Ensure `user` exists before accessing `user.id`
      const storedNotifications =
        JSON.parse(localStorage.getItem(getNotificationKey(user.id))) || [];
      const storedSeen = new Set(
        JSON.parse(localStorage.getItem(getSeenKey(user.id))) || []
      );

      setNotifications(storedNotifications);
      setSeenNotifications(storedSeen);
    }
  }, [user]); // Only run when `user` changes

  // ✅ Save notifications only when `user` is available
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem(
        getNotificationKey(user.id),
        JSON.stringify(notifications)
      );
      localStorage.setItem(
        getSeenKey(user.id),
        JSON.stringify([...seenNotifications])
      );
    }
  }, [notifications, seenNotifications, user]);

  // ✅ Ensure `user` is available before adding notifications
  const addNotification = (notification) => {
    if (!user || !user.id) return; // Prevent adding if user is undefined

    setNotifications((prev) => {
      if (
        prev.some((notif) => notif.id === notification.id) ||
        seenNotifications.has(notification.id)
      ) {
        return prev;
      }

      const updatedNotifications = [...prev, notification];
      localStorage.setItem(
        getNotificationKey(user.id),
        JSON.stringify(updatedNotifications)
      );
      return updatedNotifications;
    });
  };

  // ✅ Ensure `user` is available before removing notifications
  const removeNotification = (id) => {
    if (!user || !user.id) return; // Prevent errors if user is undefined

    setNotifications((prev) => {
      const updatedNotifications = prev.filter((notif) => notif.id !== id);
      localStorage.setItem(
        getNotificationKey(user.id),
        JSON.stringify(updatedNotifications)
      );
      return updatedNotifications;
    });

    setSeenNotifications((prev) => {
      const updatedSeen = new Set(prev).add(id);
      localStorage.setItem(
        getSeenKey(user.id),
        JSON.stringify([...updatedSeen])
      );
      return updatedSeen;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        seenNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
