import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLocation } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import PaymentForm from "./PaymentForm";
import DeliveryAddress from "./DeliveryAddress";
import tabby from "../../assets/payment/tabby.png";
import tamara from "../../assets/payment/tamara.png";
import sadad from "../../assets/payment/sadad.png";
import { createInvoice } from "../../utils/gopayApi";
import LoadingSpinner from "../global/LoadingSpinner";
import masterCard from "../../assets/payment/master.png";
import visaCard from "../../assets/payment/visa.png";
import madaPay from "../../assets/payment/mada.png";
import applePay from "../../assets/payment/applepay.png";
import googlePay from "../../assets/payment/googlepay.jpeg";
import { ChevronDown } from "react-feather";
import { API_BASE_URL } from "../../utils/constants";
import { sendWhatsApp } from "../../utils/sendWhatsApp";

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, supplierId } = location.state || {
    cartItems: [],
    supplierId: null,
  };
  const { clearCartInFirestore } = useCart();
  const [checkoutId, setCheckoutId] = useState(null);
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openCard, setOpenCard] = useState(false);
  const [openWallet, setOpenWallet] = useState(false);
  const [openBnpl, setOpenBnpl] = useState(false);
  const [openSadad, setOpenSadad] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchUserFromFirestore = async () => {
      try {
        console.log("🛠 Fetching user from Firestore...");
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("✅ Raw User Data from Firestore:", userData);

          setUser({
            buyerId: userData.buyerId || currentUser.uid,
            name: userData.name || "Unknown Buyer",
            email: userData.email || "billing@marsos.sa",
            street: userData.street || "123 Default St",
            city: userData.city || "Riyadh",
            state: userData.state || "Riyadh",
            country: userData.country || "SA",
            postcode: userData.postcode || "12345",
          });
        } else {
          console.error("❌ No user data found.");
        }
      } catch (error) {
        console.error("🔥 Error fetching user from Firestore:", error.message);
      }
    };

    fetchUserFromFirestore();
  }, [currentUser]); // ✅ Correct closing

  const deepSanitize = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(deepSanitize);
    }

    if (obj !== null && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, deepSanitize(v)])
      );
    }

    return obj;
  };

  // 🔹 Calculate Total Amount (Only for Selected Supplier)
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price * item.quantity || 0),
    0
  );
  const shippingCost = cartItems.reduce(
    (acc, item) => acc + (item.shippingCost || 0),
    0
  ); // Dynamic Shipping Cost

  const vatRate = 0.15; // VAT is 15%
  const taxableAmount = subtotal + shippingCost; // VAT applies to both subtotal and shipping
  const tax = (taxableAmount * vatRate).toFixed(2);
  const totalAmount = (taxableAmount + parseFloat(tax)).toFixed(2);

  const [showTooltip, setShowTooltip] = useState(false);

  const fetchSupplierPhone = async (supplierId) => {
    try {
      const supplierRef = doc(db, "users", supplierId);
      const supplierSnap = await getDoc(supplierRef);

      if (supplierSnap.exists()) {
        const supplierData = supplierSnap.data();
        return {
          name: supplierData.name || "Supplier",
          phone: supplierData.phone || null,
        };
      } else {
        console.warn("⚠️ Supplier not found in Firestore.");
        return {
          name: "Supplier",
          phone: null,
        };
      }
    } catch (error) {
      console.error("🔥 Error fetching supplier:", error.message);
      return {
        name: "Supplier",
        phone: null,
      };
    }
  };

  const handleAccordionClick = (event) => {
    const clickedButton = event.target.closest(".accordion-button");
    if (!clickedButton) return;

    const allButtons = document.querySelectorAll(".accordion-button");
    const allCollapseItems = document.querySelectorAll(".accordion-collapse");

    allButtons.forEach((button) => {
      button.style.backgroundColor = "transparent";
      button.style.color = "black";
      button.style.border = "none";
      button.style.boxShadow = "none";
    });

    allCollapseItems.forEach((collapse) => {
      if (
        collapse.id !==
        clickedButton.getAttribute("data-bs-target").substring(1)
      ) {
        collapse.classList.remove("show");
      }
    });

    setTimeout(() => {
      if (!clickedButton.classList.contains("collapsed")) {
        clickedButton.style.backgroundColor = "#2c6449";
        clickedButton.style.color = "white";
        clickedButton.style.border = "none";
        clickedButton.style.boxShadow = "none";
      }
    }, 150);
  };

  useEffect(() => {
    const accordionContainer = document.getElementById("paymentAccordion");

    if (accordionContainer) {
      accordionContainer.addEventListener("click", handleAccordionClick);
    }

    return () => {
      if (accordionContainer) {
        accordionContainer.removeEventListener("click", handleAccordionClick);
      }
    };
  }, []);

  // ✅ Fetch Checkout ID for HyperPay
  useEffect(() => {
    if (!user || cartItems.length === 0) return;

    console.log("📡 Preparing checkout with:", user);

    const fetchCheckoutId = async () => {
      try {
        const requestData = {
          amount: totalAmount,
          email: user.email,
          name: user.name,
          street: user.street,
          city: user.city,
          state: user.state,
          country: user.country,
          postcode: user.postcode,
          "customParameters[3DS2_enrolled]": "true", // Enroll in 3D Secure
          "customParameters[3DS2_challenge]": "true", // Ensure a challenge occurs
        };

        console.log("📡 Sending Checkout Request:", requestData);

        const response = await axios.post(
          `${API_BASE_URL}/create-checkout`,
          requestData
        );

        console.log("✅ Checkout Request Sent. Response:", response.data);
        setCheckoutId(response.data.checkoutId);
      } catch (error) {
        console.error(
          "❌ Error fetching checkoutId:",
          error.response?.data || error.message
        );
      }
    };

    fetchCheckoutId();
  }, [user, cartItems, totalAmount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resourcePath = params.get("resourcePath");

    if (!resourcePath) return;

    const verifyAndSaveOrder = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/verify-payment`, {
          resourcePath,
        });

        const data = response.data;
        const successCodes = ["000.000.000", "000.100.110", "000.100.112"];

        if (!successCodes.includes(data.result?.code)) {
          throw new Error("Payment failed verification.");
        }

        // ✅ Fetch cart from Firestore directly (in case cartItems is empty)
        const cartRef = doc(db, "carts", currentUser?.uid);
        const cartSnap = await getDoc(cartRef);
        const firestoreCart = cartSnap.exists()
          ? cartSnap.data().items || []
          : [];

        // ✅ Save order with real cart items
        await addDoc(collection(db, "orders"), {
          userId: currentUser?.uid || "guest",
          userEmail: data.customerEmail || user?.email,
          userName: user?.name || "Guest Buyer",
          totalAmount: data.amount,
          cardBrand: data.cardBrand || "N/A",
          transactionId: data.transactionId || "N/A",
          merchantTransactionId: data.merchantTransactionId || "N/A",
          paymentMethod: data.paymentType || "Card",
          createdAt: new Date(),
          orderStatus: "Paid",
          items: firestoreCart,
        });

        console.log("✅ Order created and saved with cart items");

        // ✅ Clear cart
        await clearCartInFirestore();

        // ✅ Redirect
        navigate("/orders");
      } catch (error) {
        console.error("🔥 Error verifying payment:", error);
        alert("Payment verification failed. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyAndSaveOrder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ If no supplier is selected, prevent rendering
  if (!supplierId) {
    return (
      <div className='container my-4'>
        <h4 className='text-center text-danger'>
          No supplier selected for checkout.
        </h4>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }

    if (selectedPayment === "sadad") {
      await handleSadadPayment();
    } else {
      alert("❌ This checkout process only supports SADAD at the moment.");
    }
  };

  const handleWalletPayment = () => {
    if (selectedPayment === "applepay") {
      alert("🔒 Apple Pay is currently under development.");
      // Future: integrate Apple Pay here
    } else if (selectedPayment === "googlepay") {
      alert("🔒 Google Pay is currently under development.");
      // Future: integrate Google Pay here
    }
  };

  const storeOrderInFirestore = async (
    billNumber,
    sadadNumber,
    totalAmount,
    items,
    paymentUrl
  ) => {
    if (!currentUser?.uid) return;
    if (!user) return;

    const formattedTotalAmount = Number(totalAmount) || 0;

    const sanitizedItems = items.map((item) => ({
      name: item.name || "Unnamed Product",
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
      color: item.color || "N/A",
      size: item.size || "N/A",
      shippingCost: item.shippingCost ?? 0,
      mainImageUrl: item.mainImageUrl || "",
      productId: item.productId || "",
      supplierId: item.supplierId || "",
    }));

    const payload = {
      userId: currentUser.uid,
      userEmail: user?.email ?? currentUser?.email ?? "buyer@example.com",
      userName: user?.name ?? "Guest Buyer",
      totalAmount: formattedTotalAmount.toFixed(2),
      items: sanitizedItems,
      orderStatus: "Pending",
      createdAt: new Date(),
      paymentMethod: "Sadad",
      billNumber: billNumber ?? "Unknown",
      sadadNumber: sadadNumber ?? "N/A",
      paymentUrl: paymentUrl ?? "",
    };

    const finalPayload = deepSanitize(payload);

    console.log("🧼 Final sanitized payload before addDoc:", finalPayload);

    try {
      await addDoc(collection(db, "orders"), finalPayload);
      console.log("✅ Order successfully saved.");
    } catch (error) {
      console.error("🔥 Firestore Error in SADAD save:", error);
      alert("Error saving order, please try again.");
    }
  };

  const clearSupplierItemsFromCart = async (supplierId) => {
    if (!currentUser?.uid) return;

    const cartRef = doc(db, "carts", currentUser.uid);

    try {
      const cartSnapshot = await getDoc(cartRef);
      if (cartSnapshot.exists()) {
        const cartData = cartSnapshot.data();
        const filteredItems = (cartData.items || []).filter(
          (item) => item.supplierId !== supplierId
        );

        // ✅ Update cart in Firestore after removing supplier's items - updated
        await updateDoc(cartRef, { items: filteredItems });
        console.log("✅ Cart updated after SADAD order.");
      } else {
        // ✅ If no cart exists, create an empty cart document
        await setDoc(cartRef, { items: [] });
      }
    } catch (error) {
      console.error("🔥 Error updating cart:", error);
      alert("Error updating cart. Please try again.");
    }
  };

  // SADAD RELATED GOPAY
  const handleSadadPayment = async () => {
    setProcessing(true);
    setLoading(true);

    try {
      const issueDate = new Date().toISOString().split("T")[0];
      const expireDate = new Date(new Date().setDate(new Date().getDate() + 7))
        .toISOString()
        .split("T")[0];

      // 🔹 Ensure Buyer Name is Correctly Retrieved
      const buyerName =
        user?.name && user?.name.trim() !== "" ? user.name : "Guest Buyer";

      // 🔹 Calculate Shipping Cost
      const shippingCost = cartItems.reduce(
        (acc, item) => acc + (item.shippingCost || 0),
        0
      );

      const invoiceData = {
        customerIdType: "NAT",
        customerFullName: buyerName, // ✅ Ensure accurate buyer name is sent
        customerEmailAddress: user?.email || "buyer@example.com",
        customerMobileNumber: user?.phoneNumber || "966500000000",
        issueDate,
        expireDate,
        serviceName: "E-commerce Order",
        billItemList: [
          ...cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: item.discount || 0,
            discountType: "FIXED",
            vat: 0.15,
          })),
          ...(shippingCost > 0
            ? [
                {
                  name: "Shipping Fee",
                  quantity: 1,
                  unitPrice: shippingCost,
                  discount: 0,
                  discountType: "FIXED",
                  vat: 0,
                },
              ]
            : []),
        ],
      };

      console.log("📡 Sending Invoice Data to GoPay:", invoiceData);

      // ✅ Call `createInvoice` from `gopayApi.js`
      const invoiceResponse = await createInvoice(invoiceData);

      console.log("✅ Raw API Response from Backend:", invoiceResponse);

      // ✅ Extract `billNumber`, `sadadNumber`, and `paymentUrl`
      if (
        !invoiceResponse ||
        !invoiceResponse.data ||
        !invoiceResponse.data.billNumber ||
        !invoiceResponse.data.sadadNumber
      ) {
        console.error(
          "❌ Missing Bill Number or Sadad Number in API response."
        );
        console.error("🚨 Full API Response:", invoiceResponse);
        throw new Error("Failed to retrieve Sadad Number.");
      }

      const billNumber = invoiceResponse.data.billNumber;
      const sadadNumber = invoiceResponse.data.sadadNumber;
      const paymentUrl = invoiceResponse.paymentUrl;

      console.log("✅ Bill Number:", billNumber);
      console.log("✅ Sadad Number:", sadadNumber);
      console.log("✅ Payment Link:", paymentUrl);

      // ✅ Store order in Firestore with billNumber and sadadNumber
      await storeOrderInFirestore(
        billNumber,
        sadadNumber,
        totalAmount,
        cartItems,
        paymentUrl
      );

      // ✅ Notify Buyer via WhatsApp
      if (user?.phoneNumber) {
        const buyerMsg = `🧾 Hello ${user.name}, your order has been created successfully! Bill No: ${billNumber}, SADAD No: ${sadadNumber}. You can complete your payment here: ${paymentUrl}`;
        await sendWhatsApp(user.phoneNumber, buyerMsg);
      }

      // ✅ Notify Supplier via WhatsApp (Optional)
      console.log("📦 Fetching supplier with ID:", supplierId);

      const supplier = await fetchSupplierPhone(supplierId);
      console.log("📞 Supplier phone fetched:", supplier?.phone);
      if (supplier?.phone) {
        const supplierMsg = `📦 New order received! Buyer: ${user.name}, Total: SR ${totalAmount}, Bill No: ${billNumber}.`;
        await sendWhatsApp(supplier.phone, supplierMsg);
      }

      // ✅ Remove ordered items from the cart
      await clearSupplierItemsFromCart(supplierId);

      console.log(`✅ Order for supplier ${supplierId} saved successfully!`);

      // ✅ Redirect user to Orders Page
      navigate(`/sadad-confirmation/${billNumber}`);
    } catch (error) {
      console.error("🔥 Error processing SADAD payment:", error);
      alert(`❌ SADAD Payment failed: ${error.message}`);
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className='w-full px-4 md:px-8 my-8'>
      {/* Processing and Loading Overlays */}
      {processing && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50'>
          <LoadingSpinner />
          <h4 className='text-white mt-4'>Generating Invoice...</h4>
        </div>
      )}

      {loading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50'>
          <LoadingSpinner />
          <h4 className='text-white mt-4'>Processing Payment...</h4>
        </div>
      )}
      {/* Header */}
      <div className='mb-6 text-center bg-[#2c6449] py-2 rounded-md relative'>
        <h4 className='flex items-center justify-center gap-2 text-white text-lg font-semibold'>
          Secure Checkout
          <ChevronDown
            onClick={() => setShowTooltip((prev) => !prev)}
            className={`cursor-pointer transition-transform ${
              showTooltip ? "rotate-180" : ""
            }`}
            size={18}
          />
        </h4>

        {showTooltip && (
          <div className='absolute left-1/2 top-full transform -translate-x-1/2 bg-white text-gray-800 p-3 rounded-md shadow-md mt-2 w-[90%] max-w-md'>
            <p className='text-sm'>
              We secure your payment and personal information. We don't sell or
              share your details.
              <button className='text-[#2c6449] font-bold ml-1 underline'>
                Learn more
              </button>
            </p>
          </div>
        )}
      </div>

      <div className='flex flex-wrap -mx-2'>
        {/* Left Column - Delivery Address */}
        <div className='w-full md:w-1/3 px-2 mb-4 flex flex-col gap-3'>
          <div className='border rounded-lg p-4 bg-white shadow-sm'>
            <h5 className='text-[#2c6449] mb-3 font-semibold text-sm'>
              1. Delivery Address
            </h5>
            <DeliveryAddress />
          </div>
        </div>

        {/* Middle Column - Review Your Order */}
        <div className='w-full md:w-1/3 px-2 mb-4 flex flex-col gap-3'>
          <div className='border rounded-lg p-4 bg-white shadow-sm'>
            <h5 className='text-[#2c6449] mb-3 font-semibold text-sm'>
              2. Review Your Order
            </h5>

            {cartItems.length > 0 ? (
              <ul className='flex flex-col gap-3'>
                {cartItems.map((item, index) => (
                  <li
                    key={index}
                    className='flex items-center gap-2 border rounded-lg p-2 shadow-sm'
                  >
                    {/* Product Image */}
                    <img
                      src={item.mainImageUrl}
                      alt={item.color}
                      className='w-16 h-12 object-cover rounded-md'
                    />

                    {/* Product Details */}
                    <div className='flex-1 text-sm'>
                      <p className='font-semibold'>
                        {item.name || "Product Name"}
                      </p>
                      <p className='text-gray-500'>
                        Color: {item.color || "N/A"}
                      </p>
                      <p className='text-gray-500'>
                        Size: {item.size || "N/A"}
                      </p>
                      <p className='text-gray-500'>
                        Shipping: SR {item.shippingCost || "0.00"}
                      </p>
                      <p className='text-gray-500'>Qty: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className='font-semibold text-sm text-right'>
                      SR {item.price}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-gray-500'>
                ❌ No items found for this supplier.
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary and Payment Methods */}
        <div className='w-full md:w-1/3 px-2 mb-4 flex flex-col gap-3'>
          <div className='border rounded-lg p-4 bg-white shadow-sm'>
            {/* Order Summary */}
            <h5 className='text-[#2c6449] mb-3 font-semibold text-sm'>
              3. Order Summary
            </h5>

            <div className='bg-gray-50 rounded-md p-3 text-sm'>
              <div className='flex justify-between mb-2'>
                <span>Subtotal:</span>
                <span>SR {subtotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between mb-2'>
                <span>Shipping:</span>
                <span>SR {shippingCost.toFixed(2)}</span>
              </div>
              <div className='flex justify-between mb-2'>
                <span>VAT (15%):</span>
                <span>SR {tax}</span>
              </div>
              <hr className='my-2' />
              <div className='flex justify-between font-semibold'>
                <span>Total:</span>
                <span>SR {totalAmount}</span>
              </div>
            </div>

            {/* Payment Method Title */}
            <h5 className='text-[#2c6449] mt-6 mb-3 font-semibold text-sm'>
              4. Select Payment Method
            </h5>

            {/* Payment Options */}
            <div className='flex flex-col gap-2'>
              {/* Credit/Debit Card */}
              <div className='border rounded-md overflow-hidden'>
                <button
                  onClick={() => setOpenCard((prev) => !prev)}
                  className='w-full flex justify-between items-center py-2 px-3 bg-white hover:bg-gray-100 text-sm font-medium'
                >
                  <span className='flex items-center gap-2'>
                    Credit / Debit Card
                    <img src={madaPay} alt='Mada' className='h-6' />
                    <img src={masterCard} alt='MasterCard' className='h-6' />
                    <img src={visaCard} alt='Visa' className='h-6' />
                  </span>
                  <ChevronDown
                    className={`transition-transform ${
                      openCard ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>

                {openCard && (
                  <div className='bg-gray-50 p-3'>
                    <PaymentForm checkoutId={checkoutId} />
                  </div>
                )}
              </div>

              {/* Digital Wallets */}
              <div className='border rounded-md overflow-hidden'>
                <button
                  onClick={() => setOpenWallet((prev) => !prev)}
                  className='w-full flex justify-between items-center py-2 px-3 bg-white hover:bg-gray-100 text-sm font-medium'
                >
                  <span className='flex items-center gap-2'>
                    Digital Wallets
                    <img src={applePay} alt='ApplePay' className='h-6' />
                    <img src={googlePay} alt='GooglePay' className='h-5' />
                  </span>
                  <ChevronDown
                    className={`transition-transform ${
                      openWallet ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>

                {openWallet && (
                  <div className='bg-gray-50 p-3'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setSelectedPayment("applepay")}
                        className={`flex-1 py-2 px-3 border rounded-md text-center text-sm ${
                          selectedPayment === "applepay"
                            ? "bg-[#2c6449] text-white"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        Apple Pay
                      </button>
                      <button
                        onClick={() => setSelectedPayment("googlepay")}
                        className={`flex-1 py-2 px-3 border rounded-md text-center text-sm ${
                          selectedPayment === "googlepay"
                            ? "bg-[#2c6449] text-white"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        Google Pay
                      </button>
                    </div>
                    {(selectedPayment === "applepay" ||
                      selectedPayment === "googlepay") && (
                      <button
                        className='mt-3 w-full py-2 bg-[#2c6449] hover:bg-[#235138] text-white rounded-md text-sm'
                        onClick={handleWalletPayment}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Buy Now Pay Later */}
              <div className='border rounded-md overflow-hidden'>
                <button
                  onClick={() => setOpenBnpl((prev) => !prev)}
                  className='w-full flex justify-between items-center py-2 px-3 bg-white hover:bg-gray-100 text-sm font-medium'
                >
                  <span className='flex items-center gap-2'>
                    Buy Now, Pay Later
                    <img src={tamara} alt='Tamara' className='h-8' />
                    <img src={tabby} alt='Tabby' className='h-6' />
                  </span>
                  <ChevronDown
                    className={`transition-transform ${
                      openBnpl ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>

                {openBnpl && (
                  <div className='bg-gray-50 p-3'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setSelectedPayment("tamara")}
                        className={`flex-1 py-2 px-3 border rounded-md text-center text-sm ${
                          selectedPayment === "tamara"
                            ? "bg-[#2c6449] text-white"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        Tamara
                      </button>
                      <button
                        onClick={() => setSelectedPayment("tabby")}
                        className={`flex-1 py-2 px-3 border rounded-md text-center text-sm ${
                          selectedPayment === "tabby"
                            ? "bg-[#2c6449] text-white"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        Tabby
                      </button>
                    </div>
                    {(selectedPayment === "tamara" ||
                      selectedPayment === "tabby") && (
                      <button className='mt-3 w-full py-2 bg-[#2c6449] hover:bg-[#235138] text-white rounded-md text-sm'>
                        Pay Now
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* SADAD */}
              <div className='border rounded-md overflow-hidden'>
                <button
                  onClick={() => setOpenSadad((prev) => !prev)}
                  className='w-full flex justify-between items-center py-2 px-3 bg-white hover:bg-gray-100 text-sm font-medium'
                >
                  <span className='flex items-center gap-2'>
                    Other Payment Options
                    <img src={sadad} alt='Sadad' className='h-7' />
                  </span>
                  <ChevronDown
                    className={`transition-transform ${
                      openSadad ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>

                {openSadad && (
                  <div className='bg-gray-50 p-3'>
                    <button
                      onClick={() => setSelectedPayment("sadad")}
                      className={`w-full py-2 px-3 border rounded-md text-center text-sm ${
                        selectedPayment === "sadad"
                          ? "bg-[#2c6449] text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      SADAD
                    </button>
                    <button
                      className='mt-3 w-full py-2 bg-[#2c6449] hover:bg-[#235138] text-white rounded-md text-sm'
                      onClick={handleCheckout}
                      disabled={selectedPayment !== "sadad"}
                    >
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
