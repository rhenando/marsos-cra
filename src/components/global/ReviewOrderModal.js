import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { QRCodeCanvas } from "qrcode.react";
import LoadingSpinner from "../global/LoadingSpinner";
import { useTranslation } from "react-i18next";
import axios from "axios";

const ReviewOrderModal = ({ isOpen, onClose, supplierId }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState(null); // Buyer information state
  const { t } = useTranslation(); // Translation hook

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-CA").replace(/-/g, "/");
    const time = now.toLocaleTimeString();
    return `${date} ${time}`;
  };

  useEffect(() => {
    if (!isOpen || !currentUser?.uid || !supplierId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Cart Items
        const cartRef = doc(db, "carts", currentUser.uid);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
          const cartData = cartSnap.data();
          const allItems = cartData.items || [];
          const supplierItems = allItems.filter(
            (item) => item.supplierId === supplierId
          );
          setCartItems(supplierItems);

          const totalAmount = supplierItems.reduce(
            (sum, item) =>
              sum + item.quantity * item.price + (item.shippingCost || 0),
            0
          );
          const vatAmount = totalAmount * 0.15;
          const grandTotalAmount = totalAmount + vatAmount;

          setTotal(totalAmount);
          setVat(vatAmount);
          setGrandTotal(grandTotalAmount);

          // Fetch Buyer Information using buyerId
          const buyerId = cartData.buyerId;
          if (buyerId) {
            const buyerRef = doc(db, "users", buyerId);
            const buyerSnap = await getDoc(buyerRef);

            if (buyerSnap.exists()) {
              setBuyerInfo(buyerSnap.data());
            } else {
              console.warn(t("review_order.errors.no_buyer_found"));
            }
          }
        }

        // Fetch Supplier Information
        const supplierRef = doc(db, "users", supplierId);
        const supplierSnap = await getDoc(supplierRef);

        if (supplierSnap.exists()) {
          setSupplierInfo(supplierSnap.data());
        } else {
          console.warn(t("review_order.errors.no_supplier_found"));
        }
      } catch (error) {
        console.error(t("review_order.errors.fetch_failed"), error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, currentUser, supplierId, t]);

  const handlePrint = () => {
    const modalBody = document.querySelector(".modal-body");

    if (!modalBody) {
      console.error("Modal body not found.");
      return;
    }

    // Clone the modal body to avoid modifying the original content
    const clonedBody = modalBody.cloneNode(true);

    // Remove Print and Checkout buttons from the cloned content
    const buttonsToRemove = clonedBody.querySelectorAll(".btn");
    buttonsToRemove.forEach((button) => button.remove());

    // Find the QRCode canvas
    const qrCanvas = document.querySelector("canvas");

    if (qrCanvas) {
      // Convert QR code canvas to a Data URL (image)
      const qrImageURL = qrCanvas.toDataURL("image/png");

      // Create an image element and replace the original QR code
      const qrImage = document.createElement("img");
      qrImage.src = qrImageURL;
      qrImage.style.width = "120px"; // Increase the width
      qrImage.style.height = "120px"; // Increase the height
      qrImage.style.display = "block"; // Center if needed
      qrImage.style.margin = "10px auto";

      // Replace canvas with the new image in the cloned content
      const qrCanvasClone = clonedBody.querySelector("canvas");
      if (qrCanvasClone) {
        qrCanvasClone.parentNode.replaceChild(qrImage, qrCanvasClone);
      }
    }

    // Open a new window with minimal UI (only the print preview)
    const printWindow = window.open("", "_blank", "width=800,height=600");

    printWindow.document.write(`
    <html>
      <head>
        <title>${document.title}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        <style>
          body { font-size: 0.75rem; }
          .modal-body { max-width: 100%; margin: 20px; }
          img { display: block; margin: 10px auto; } /* Ensures QR code is centered */
        </style>
      </head>
      <body>
        <div class="modal-body">
          ${clonedBody.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  const handleCheckout = async () => {
    if (!currentUser || cartItems.length === 0) {
      alert(t("review_order.errors.empty_cart"));
      return;
    }

    try {
      console.log("✅ Sending Checkout Request to Backend...");

      // ✅ Ask user to select a payment method
      const paymentMethods = [
        "Mada",
        "Visa",
        "Master",
        "American Express",
        "Apple Pay",
        "E-Wallet",
        "Cash",
      ];
      const selectedPaymentMethod = prompt(
        `Select a payment method:\n${paymentMethods.join("\n")}`
      );

      if (
        !selectedPaymentMethod ||
        !paymentMethods.includes(selectedPaymentMethod)
      ) {
        alert("Invalid payment method selected. Please try again.");
        return;
      }

      // ✅ Prepare the Request Payload
      const payload = {
        userId: currentUser.uid,
        supplierId: supplierId,
        cartItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount || 0,
          discountType: "FIXED",
          vat: "0.15",
        })),
        grandTotal: parseFloat(grandTotal),
        email: currentUser.email,
        name: buyerInfo?.name || "Guest",
        phone: buyerInfo?.phone || "0000000000",
        paymentMethod: selectedPaymentMethod,
      };

      // ✅ Send Request to Your Backend
      const response = await axios.post(
        "http://localhost:5000/api/checkout",
        payload
      );

      console.log("✅ Backend Response:", response.data);

      // ✅ Redirect to Payment Page if Provided
      if (response.data.paymentUrl) {
        console.log("✅ Redirecting to Payment Page...");
        window.location.href = response.data.paymentUrl;
      } else {
        console.error("❌ Payment URL not received:", response.data);
        alert("Payment URL missing. Please try again.");
      }
    } catch (error) {
      console.error(
        "❌ Checkout Error:",
        error.response?.data || error.message
      );
      alert("Checkout failed. Please try again.");
    }
  };

  const currencySymbol = t("review_order.currency", { defaultValue: "SR" });

  if (!isOpen) return null;

  return (
    <div
      className='modal d-flex justify-content-center align-items-center show'
      style={{ display: "block", overflow: "hidden" }}
    >
      <div className='modal-dialog modal-lg'>
        <div
          className='modal-content'
          style={{ fontSize: "0.75rem", maxHeight: "90vh", padding: "10px" }}
        >
          <div
            className='modal-header'
            style={{
              fontSize: "0.9rem",
              padding: "5px 10px",
              fontWeight: "bold",
            }}
          >
            <h5 className='modal-title w-100 text-start'>
              {t("review_order.title")}
            </h5>
            <button
              type='button'
              className='btn-close'
              onClick={onClose}
            ></button>
          </div>

          <div
            className='modal-body'
            style={{
              overflowY: "auto",
              maxHeight: "calc(90vh - 70px)",
              padding: "5px",
            }}
          >
            {loading ? (
              <div className='d-flex justify-content-center align-items-center'>
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className='d-flex justify-content-between align-items-center mb-3'>
                  {/* Left Static Website Logo */}
                  <div>
                    <img
                      src='logo.png'
                      alt='Website Logo'
                      style={{ maxWidth: "100px", maxHeight: "50px" }}
                    />
                  </div>

                  {/* Center Supplier Logo */}
                  <div className='text-center flex-grow-1'>
                    {supplierInfo?.logoUrl && (
                      <img
                        src={supplierInfo.logoUrl}
                        alt={`${supplierInfo.name} Logo`}
                        style={{ maxWidth: "150px", maxHeight: "100px" }}
                      />
                    )}
                  </div>
                </div>
                {/* Invoice Details */}
                <div className='d-flex justify-content-between align-items-center mb-2 mt-4'>
                  <div className='text-center'>
                    <h5
                      className='modal-title mb-1'
                      style={{ fontSize: "0.8rem", marginBottom: "4px" }}
                    >
                      {t("review_order.invoice.tax_invoice")}
                    </h5>
                    <table className='table table-bordered text-center'>
                      <tbody>
                        <tr>
                          <td>
                            <strong>
                              {t("review_order.invoice.date_time")}
                            </strong>
                            <br />
                            {getCurrentDateTime()}
                          </td>
                          <td>
                            <strong>
                              {t("review_order.invoice.serial_number")}
                            </strong>
                            <br />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className='text-end'>
                    <QRCodeCanvas
                      value='https://example.com/invoice'
                      size={120}
                      bgColor='#ffffff'
                      fgColor='#000000'
                      level='Q'
                    />
                  </div>
                </div>

                {/* Supplier Information */}
                <div className='mt-2'>
                  <h5
                    className='mb-1'
                    style={{ fontSize: "0.8rem", marginBottom: "4px" }}
                  >
                    {t("review_order.supplier_info.title")}
                  </h5>
                  <table className='table table-bordered text-center'>
                    <thead
                      className='table-light'
                      style={{ fontSize: "0.75rem" }}
                    >
                      <tr>
                        <th>{t("review_order.supplier_info.name")}</th>
                        <th>{t("review_order.supplier_info.address")}</th>
                        <th>{t("review_order.supplier_info.vat_number")}</th>
                        <th>{t("review_order.supplier_info.cr_number")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{supplierInfo?.name || t("common.na")}</td>
                        <td>{supplierInfo?.address || t("common.na")}</td>
                        <td>{supplierInfo?.vatNumber || t("common.na")}</td>
                        <td>{supplierInfo?.crNumber || t("common.na")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Buyer Information */}
                <div className='mt-2'>
                  <h5
                    className='mb-1'
                    style={{ fontSize: "0.8rem", marginBottom: "4px" }}
                  >
                    {t("review_order.buyer_info.title")}
                  </h5>
                  <table className='table table-bordered text-center'>
                    <thead
                      className='table-light'
                      style={{ fontSize: "0.75rem" }}
                    >
                      <tr>
                        <th>{t("review_order.buyer_info.name")}</th>
                        <th>{t("review_order.buyer_info.address")}</th>
                        <th>{t("review_order.buyer_info.vat_number")}</th>
                        <th>{t("review_order.buyer_info.cr_number")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{buyerInfo?.name || t("common.na")}</td>
                        <td>{buyerInfo?.address || t("common.na")}</td>
                        <td>{buyerInfo?.vatNumber || t("common.na")}</td>
                        <td>{buyerInfo?.crNumber || t("common.na")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Product Details Section */}
                <div className='mt-2'>
                  <h5
                    className='mb-1'
                    style={{ fontSize: "0.8rem", marginBottom: "4px" }}
                  >
                    {t("review_order.product_details.title")}
                  </h5>
                  <table className='table table-bordered text-center'>
                    <thead
                      className='table-light'
                      style={{ fontSize: "0.75rem" }}
                    >
                      <tr>
                        <th>{t("review_order.product_details.image")}</th>
                        <th>{t("review_order.product_details.name")}</th>
                        <th>{t("review_order.product_details.unit_price")}</th>
                        <th>{t("review_order.product_details.quantity")}</th>
                        <th>{t("review_order.product_details.shipping")}</th>
                        <th>
                          {t("review_order.product_details.total_excl_vat")}
                        </th>
                        <th>{t("review_order.product_details.tax_rate")}</th>
                        <th>{t("review_order.product_details.tax_value")}</th>
                        <th>
                          {t("review_order.product_details.total_incl_vat")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => {
                        const totalExclVAT =
                          item.quantity * item.price + (item.shippingCost || 0);
                        const taxRate = 0.15;
                        const taxValue = totalExclVAT * taxRate;
                        const totalInclVAT = totalExclVAT + taxValue;

                        return (
                          <tr key={item.cartId}>
                            <td>
                              <img
                                src={
                                  item.mainImageUrl ||
                                  "https://via.placeholder.com/50"
                                }
                                alt={item.name}
                                style={{ width: "40px", height: "40px" }}
                              />
                            </td>
                            <td>{item.name}</td>
                            <td>
                              {currencySymbol} {item.price.toFixed(2)}
                            </td>
                            <td>{item.quantity}</td>
                            <td>
                              {currencySymbol} {item.shippingCost.toFixed(2)}
                            </td>
                            <td>
                              {currencySymbol} {totalExclVAT.toFixed(2)}
                            </td>
                            <td>{(taxRate * 100).toFixed(0)}%</td>
                            <td>
                              {currencySymbol} {taxValue.toFixed(2)}
                            </td>
                            <td>
                              {currencySymbol} {totalInclVAT.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className='mt-2'>
                  <p>
                    <strong>{t("review_order.totals.total")}:</strong>{" "}
                    {currencySymbol} {total.toFixed(2)}
                  </p>
                  <p>
                    <strong>{t("review_order.totals.vat")}:</strong>{" "}
                    {currencySymbol} {vat.toFixed(2)}
                  </p>
                  <p>
                    <strong>{t("review_order.totals.grand_total")}:</strong>{" "}
                    {currencySymbol} {grandTotal.toFixed(2)}
                  </p>
                </div>

                <div className='d-flex justify-content-end mt-2'>
                  <button
                    className='btn btn-secondary btn-sm me-2'
                    onClick={handlePrint}
                  >
                    {t("review_order.actions.print")}
                  </button>
                  <button
                    className='btn btn-primary btn-sm'
                    onClick={handleCheckout}
                  >
                    {t("review_order.actions.checkout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrderModal;
