// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, onIdTokenChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intendedRoute, setIntendedRoute] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const setUserAndRole = async (user) => {
      try {
        setCurrentUser(user);

        if (user) {
          const idToken = await user.getIdToken();
          setToken(idToken);

          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserData(userData);
            setRole(userData.role);
            // 🧠 Don't override Firebase user object!
            // Merge if needed like: { ...user, customData: userData }
          } else {
            console.warn("No document found for user in Firestore.");
            setUserData({ role: "guest" });
            setRole("guest");
          }

          if (intendedRoute) {
            navigate(intendedRoute);
            setIntendedRoute(null);
          }
        } else {
          setRole(null);
          setUserData(null);
          setToken(null);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error setting user, token, or role:", error);
      } finally {
        setLoading(false);
      }
    };

    // 🔁 Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setUserAndRole(user);
    });

    // 🧠 Extra token listener for refresh support
    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const refreshedToken = await user.getIdToken(true);
          setToken(refreshedToken);
        } catch (err) {
          console.error("Failed to refresh token", err);
        }
      }
    });

    // 🔁 Cross-tab logout sync
    const handleLogoutSync = (event) => {
      if (event.key === "logout") {
        console.log("🔁 Logout detected from another tab.");
        signOut(auth)
          .then(() => {
            setCurrentUser(null);
            setUserData(null);
            setRole(null);
            setToken(null);
            navigate("/user-login");
          })
          .catch((err) => {
            console.error("Error syncing logout across tabs:", err);
          });
      }
    };

    window.addEventListener("storage", handleLogoutSync);

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
      window.removeEventListener("storage", handleLogoutSync);
    };
  }, [intendedRoute, navigate]);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.setItem("logout", Date.now()); // cross-tab sync

      setCurrentUser(null);
      setUserData(null);
      setRole(null);
      setToken(null);

      if (role === "admin") {
        navigate("/admin-login");
      } else {
        navigate("/user-login");
      }

      // ❌ Removed window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const hasRole = (requiredRole) => role === requiredRole;

  const value = {
    currentUser,
    userData,
    role,
    token,
    loading,
    hasRole,
    setIntendedRoute: (path) => {
      if (!intendedRoute) setIntendedRoute(path);
    },
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading, setIntendedRoute, hasRole } = useAuth();
  const location = window.location.pathname;

  if (loading) {
    return <div className='spinner-border text-primary' role='status'></div>;
  }

  if (!currentUser) {
    setIntendedRoute(location);
    return <Navigate to='/user-login' />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to='/' />;
  }

  return children;
};
