import React, { useState, useEffect } from "react";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import LoadingSpinner from "./components/global/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HelmetProvider } from "react-helmet-async";
import DirectionWrapper from "./components/global/DirectionWrapper";

const App = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time. Replace with actual loading logic later.
    const timeout = setTimeout(() => setIsAppLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  if (isAppLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-white'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <DirectionWrapper>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <ToastContainer position='top-right' autoClose={3000} />
              <AppRoutes />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </DirectionWrapper>
    </HelmetProvider>
  );
};

export default App;
