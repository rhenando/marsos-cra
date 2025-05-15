import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { BrowserRouter as Router } from "react-router-dom";
import { initAuthPersistence } from "./firebase/initAuth";

import "./styles/global.css";
import "./i18n";

// Wait for Firebase Auth persistence to be set before rendering the app
initAuthPersistence().then(() => {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
});
