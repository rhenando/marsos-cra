import React, { useState, useEffect } from "react";
import { Lock, Loader } from "react-feather";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
} from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import Notification from "../global/Notification";
import OtpInputGroup from "../otp/OtpInputGroup";

const UserLogin = () => {
  const [otp, setOtp] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: "",
    message: "",
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const navigate = useNavigate();

  const showNotification = (title, message = "") => {
    setNotificationContent({ title, message });
    setIsNotificationOpen(true);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      if (value.startsWith("0")) {
        showNotification("Phone number cannot start with 0");
      } else {
        setPhone(value);
        setIsButtonDisabled(value.length < 9);
      }
    } else {
      showNotification("Only numbers allowed (max 10 digits)");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          localStorage.setItem(
            "user",
            JSON.stringify({ ...userData, uid: user.uid })
          );
          const role = userData.role || "buyer";
          navigate(role === "buyer" ? "/" : "/supplier-dashboard");
        } else {
          navigate("/register");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const onCaptchVerify = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            if (!auth.currentUser) onSignup();
          },
        },
        auth
      );

      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  };

  const onSignup = () => {
    if (auth.currentUser) return toast("You're already logged in.");

    setLoading(true);
    onCaptchVerify();
    const appVerifier = window.recaptchaVerifier;
    const fullPhoneNumber = `${countryCode}${phone}`.trim();

    signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setShowOTP(true);
        toast.success("OTP sent!");
      })
      .catch(() => toast.error("SMS failed. Try again."))
      .finally(() => setLoading(false));
  };

  const onOTPVerify = async () => {
    if (auth.currentUser) return toast("Already verified.");
    try {
      setLoading(true);
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      const fullPhoneNumber = `${countryCode}${phone}`.trim();
      localStorage.setItem("userPhone", fullPhoneNumber);

      const usersRef = collection(db, "users");
      let q = query(usersRef, where("uid", "==", user.uid));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        q = query(usersRef, where("phone", "==", fullPhoneNumber));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const role = userData.role || "buyer";
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("userName", userData.name || "Anonymous");
        localStorage.setItem("userRole", role);
        toast.success("Login successful!");
        navigate(role === "buyer" ? "/" : "/supplier-dashboard");
      } else {
        navigate("/register");
      }
    } catch (err) {
      toast.error("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cleanup Recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (err) {
          console.warn("Recaptcha clear failed:", err);
        }
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  return (
    <div className='flex min-h-screen'>
      <Toaster />
      <div id='recaptcha-container' />

      {/* LEFT PANEL */}
      <div className='hidden lg:flex w-1/2 bg-gradient-to-br from-[#2c6449] to-green-400 text-white flex-col items-center justify-center p-10'>
        <img src='/logo-marsos.svg' alt='Marsos Logo' className='w-28 mb-4' />
        <h1 className='text-4xl font-bold mb-4'>Welcome to Marsos</h1>
        <p className='text-lg max-w-sm text-center opacity-80'>
          Trust made visible. Trade made simple.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className='flex w-full lg:w-1/2 justify-center items-center bg-gray-50 py-12 px-6'>
        <div className='w-full max-w-md bg-white p-8 rounded-xl shadow-xl animate-fadeIn'>
          <div className='text-center mb-6'>
            <h2 className='text-2xl font-semibold text-[#2c6449]'>
              Login or Register
            </h2>
            <p className='text-gray-600 text-sm'>
              Secure sign-in with your phone
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {showOTP ? (
              <>
                <div className='flex justify-center mb-4'>
                  <Lock size={40} className='text-[#2c6449]' />
                </div>

                <OtpInputGroup onChange={(val) => setOtp(val)} />

                <button
                  onClick={onOTPVerify}
                  disabled={isButtonDisabled}
                  className='w-full mt-6 py-2 bg-[#2c6449] text-white font-semibold rounded hover:bg-[#24523b] disabled:opacity-50 flex justify-center items-center gap-2'
                >
                  {loading ? (
                    <>
                      <Loader size={20} className='animate-spin' />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </>
            ) : (
              <>
                <div className='flex mb-4'>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className='border rounded-l px-2 py-2 text-sm bg-gray-50 text-gray-700'
                  >
                    <option value='+966'>+966</option>
                    <option value='+971'>+971</option>
                    <option value='+973'>+973</option>
                    <option value='+965'>+965</option>
                    <option value='+968'>+968</option>
                    <option value='+974'>+974</option>
                    <option value='+63'>+63</option>
                  </select>
                  <input
                    type='tel'
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder='Enter phone number'
                    className='flex-1 border rounded-r px-4 py-2 text-sm focus:outline-none'
                    required
                  />
                </div>

                <label className='text-sm text-[#2c6449] mb-3 flex items-start gap-2'>
                  <input type='checkbox' className='mt-1' required />
                  <span>
                    I agree to the{" "}
                    <a
                      href='/updated-terms-and-conditions'
                      target='_blank'
                      className='text-[#2c6449] underline'
                    >
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href='/updated-privacy-policy'
                      target='_blank'
                      className='text-[#2c6449] underline'
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <button
                  onClick={onSignup}
                  disabled={isButtonDisabled}
                  className='w-full py-2 bg-[#2c6449] text-white font-semibold rounded hover:bg-[#24523b] disabled:opacity-50 flex justify-center items-center gap-2'
                >
                  {loading ? (
                    <>
                      <Loader size={20} className='animate-spin' />
                      Sending...
                    </>
                  ) : (
                    "Send code via SMS"
                  )}
                </button>
              </>
            )}
          </form>

          <Notification
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            title={notificationContent.title}
            message={notificationContent.message}
            duration={5000}
          />
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
