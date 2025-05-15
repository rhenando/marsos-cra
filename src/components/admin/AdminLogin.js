import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import Notification from "../global/Notification";
import logo from "../../assets/logo.svg";

const AdminLoginRegister = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: "",
    message: "",
  });

  const ALLOWED_ADMIN_EMAIL = "marsos@ayn-almanal.com";

  const showNotification = (title, message = "") => {
    setNotificationContent({ title, message });
    setIsNotificationOpen(true);
  };

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (user.email !== ALLOWED_ADMIN_EMAIL) {
        showNotification(
          "Access denied",
          "You are not authorized as an admin."
        );
        navigate("/404");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(docRef);

      if (userDoc.exists()) {
        const { role, name } = userDoc.data();

        if (role === "admin") {
          localStorage.setItem(
            "user",
            JSON.stringify({
              uid: user.uid,
              name: name || "",
              email: user.email,
              role,
            })
          );
          showNotification("Admin logged in successfully");
          navigate("/admin-dashboard");
        } else {
          showNotification(
            "Access denied",
            "You do not have admin privileges."
          );
        }
      } else {
        showNotification("Access denied", "User role not found.");
      }
    } catch (error) {
      showNotification("Login failed", error.message);
    }
  };

  const handleForgotPassword = async () => {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      showNotification(
        "Password Reset Email Sent",
        "Please check your email to reset your password."
      );
      setIsForgotPassword(false);
    } catch (error) {
      showNotification("Password Reset Failed", error.message);
    }
  };

  return (
    <div className='h-[80vh] flex items-center justify-center bg-gray-100 px-4'>
      <div className='w-full max-w-sm bg-white p-6 rounded-xl shadow-lg'>
        <div className='flex justify-center mb-4'>
          <img src={logo} alt='Logo' className='w-20' />
        </div>
        <h2 className='text-center text-xl font-semibold text-[#2c6449] mb-4'>
          {isForgotPassword ? "Reset Password" : "Admin Login"}
        </h2>

        <input
          type='email'
          placeholder='Email'
          className='w-full mb-3 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#2c6449]'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isForgotPassword && (
          <input
            type='password'
            placeholder='Password'
            className='w-full mb-3 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#2c6449]'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <button
          onClick={isForgotPassword ? handleForgotPassword : handleLogin}
          className='w-full py-2 text-sm font-semibold text-white bg-[#2c6449] rounded hover:bg-[#24523b] transition'
        >
          {isForgotPassword ? "Send Reset Email" : "Login"}
        </button>

        {!isForgotPassword && (
          <div className='text-center mt-3'>
            <button
              onClick={() => setIsForgotPassword(true)}
              className='text-sm text-[#2c6449] underline hover:text-[#24523b]'
            >
              Forgot Password?
            </button>
          </div>
        )}
      </div>

      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title={notificationContent.title}
        message={notificationContent.message}
        duration={5000}
      />
    </div>
  );
};

export default AdminLoginRegister;
