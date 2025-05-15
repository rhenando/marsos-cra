import React, { useEffect } from "react";

const PaymentForm = ({ checkoutId }) => {
  const formAction = window.location.href;

  useEffect(() => {
    if (!checkoutId) return;

    // ✅ Configure HyperPay widget for production
    window.wpwlOptions = {
      style: "card",
      locale: "en",
      styleObject: {
        input: {
          backgroundColor: "#ffffff",
          color: "#2c6449",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        },
        label: {
          color: "#2c6449",
          fontWeight: "bold",
        },
        ".wpwl-button-pay": {
          backgroundColor: "#2c6449",
          color: "#ffffff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
        },
      },
    };

    // ✅ Add optional background styling to the card form
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      .wpwl-form-card {
        background-color: #2c6449 !important;
        padding: 20px;
        border-radius: 8px;
      }
    `;
    document.head.appendChild(styleSheet);

    // ✅ Load HyperPay production widget script
    const script = document.createElement("script");
    script.src = `https://eu-prod.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`; // ✅ Live endpoint
    script.async = true;
    script.id = "hyperpay-script";
    document.body.appendChild(script);

    return () => {
      document.getElementById("hyperpay-script")?.remove();
      document.head.removeChild(styleSheet);
      delete window.wpwlOptions;
    };
  }, [checkoutId]);

  return (
    <form
      action={formAction}
      method='GET'
      className='paymentWidgets'
      data-brands='VISA MASTER MADA'
    ></form>
  );
};

export default PaymentForm;
