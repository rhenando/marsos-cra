import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import marsosLogo from "../../assets/logo.png";
import TermsAndConditions from "../global/TermsAndConditions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ReviewInvoice = () => {
  const { billNumber } = useParams();
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!billNumber) return;

      try {
        setLoading(true);

        // 🔍 Query Firestore where billNumber matches the field value
        console.log("Fetching invoice for billNumber:", billNumber);

        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("billNumber", "==", billNumber));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          const data = orderDoc.data();

          console.log("Fetched Order Data:", data);

          // Format createdAt timestamp
          const createdAt = data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000).toLocaleString()
            : "Unknown Date";

          // 🔍 Extract supplierId & buyerId from first item in items array
          const firstItem = data.items?.[0] || {};
          const supplierIdFromInvoice = firstItem.supplierId || null;

          const buyerId = firstItem.buyerId || null;

          console.log("Extracted Supplier ID:", supplierIdFromInvoice);
          console.log("Extracted Buyer ID:", buyerId);

          let supplierData = {
            name: "N/A",
            address: "N/A",
            crNumber: "N/A",
            vatNumber: "N/A",
          };

          let buyerData = {
            name: "N/A",
            address: "N/A",
            crNumber: "N/A",
            vatNumber: "N/A",
          };

          // ✅ Fetch supplier details if supplierId exists
          if (supplierIdFromInvoice) {
            console.log(
              "Fetching supplier info for ID:",
              supplierIdFromInvoice
            );
            const supplierRef = doc(db, "users", supplierIdFromInvoice);
            const supplierSnap = await getDoc(supplierRef);

            if (supplierSnap.exists()) {
              const supplier = supplierSnap.data();
              console.log("✅ Fetched Supplier Data:", supplier);

              supplierData = {
                name: supplier.name || "N/A",
                address: supplier.address || "N/A",
                crNumber: supplier.crNumber || "N/A",
                vatNumber: supplier.vatNumber || "N/A",
              };
            } else {
              console.warn("Supplier document not found in users collection.");
            }
          } else {
            console.warn("No supplierId found in order items.");
          }

          // ✅ Fetch buyer details if buyerId exists
          if (buyerId) {
            console.log("Fetching buyer info for ID:", buyerId);

            const buyerRef = doc(db, "users", buyerId);
            const buyerSnap = await getDoc(buyerRef);

            if (buyerSnap.exists()) {
              const buyer = buyerSnap.data();
              console.log("✅ Fetched Buyer Data:", buyer);

              buyerData = {
                name: buyer.name || "N/A",
                address: buyer.address || "N/A",
                crNumber: buyer.crNumber || "N/A",
                vatNumber: buyer.vatNumber || "N/A",
              };
            } else {
              console.warn("Buyer document not found in users collection.");
            }
          } else {
            console.warn("No buyerId found in order items.");
          }

          // ✅ Update State
          const updatedInvoiceDetails = {
            date: createdAt,
            invoiceNumber: data.billNumber || "N/A",
            supplier: supplierData,
            buyer: buyerData,
            items: data.items || [],
            supplierId: supplierIdFromInvoice, // ✅ Add this
          };

          console.log("🚀 Updated Invoice Details:", updatedInvoiceDetails);
          setInvoiceDetails(updatedInvoiceDetails);
        } else {
          console.log("No matching invoice found!");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [billNumber]);

  if (loading) return <p className='text-center mt-5'>Loading invoice...</p>;
  if (!invoiceDetails)
    return <p className='text-center mt-5'>Invoice not found.</p>;

  // Calculate totals safely
  const vatRate = 0.15;
  const totalExclVAT = invoiceDetails.items.reduce(
    (sum, item) =>
      sum + (item.price || 0) * (item.quantity || 1) + (item.shippingCost || 0),
    0
  );
  const vatValue = totalExclVAT * vatRate;
  const grandTotal = invoiceDetails.items.reduce(
    (sum, item) =>
      sum +
      (item.totalAmount ||
        item.price * item.quantity + item.shippingCost + vatValue ||
        0),
    0
  );

  const handleDownload = async () => {
    const invoiceElement = document.getElementById("invoice-container");

    if (!invoiceElement) {
      console.error(
        "❌ Invoice container not found! Make sure #invoice-container exists."
      );
      return;
    }

    try {
      console.log("🔄 Capturing invoice...");

      const canvas = await html2canvas(invoiceElement, {
        scale: 2, // Improves quality
        useCORS: true, // ✅ Allows Firebase images
        allowTaint: true,
      });

      console.log("✅ Invoice captured successfully!");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${invoiceDetails.invoiceNumber || "Unknown"}.pdf`);
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
    }
  };

  if (loading) return <p className='text-center mt-5'>Loading invoice...</p>;
  if (!invoiceDetails)
    return <p className='text-center mt-5'>Invoice not found.</p>;

  return (
    <div
      className='container mt-3'
      style={{
        maxWidth: "80vw",
        margin: "auto",
        padding: "20px",
      }}
    >
      <div
        id='invoice-container'
        ref={invoiceRef}
        style={{
          backgroundColor: "transparent",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Invoice Title */}
        <h1 className='text-center fw-bold fs-4'>Invoice</h1>

        {/* Logo at the Top */}
        <div className=' mb-3'>
          <img
            src={marsosLogo}
            alt='Company Logo'
            style={{ maxWidth: "100px", height: "auto" }}
          />
        </div>

        {/* Tax Invoice Label & Date/Invoice Table */}
        <div className='row align-items-center'>
          <div className='col-md-6'>
            <p className='text-center fw-bold mb-1 fs-6'>Tax Invoice</p>
            <table className='table table-sm table-bordered text-center'>
              <thead className='table-light'>
                <tr>
                  <th className='fw-bold fs-7'>Date & Time</th>
                  <th className='fw-bold fs-7'>Invoice Number</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='fs-7'>{invoiceDetails.date}</td>
                  <td className='fs-7'>{invoiceDetails.invoiceNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className='col-md-6 text-end'>
            <QRCodeCanvas
              value={`https://example.com/invoice/${invoiceDetails.invoiceNumber}`}
              size={120}
              bgColor='#ffffff'
              fgColor='#000000'
            />
          </div>
        </div>

        {/* Supplier Information */}
        <section className='mt-3'>
          <h5 className='fs-6'>Supplier Information</h5>
          <table
            className='table table-sm table-bordered text-center w-100'
            style={{ tableLayout: "fixed" }}
          >
            <thead className='table-light'>
              <tr>
                <th className='fs-7' style={{ width: "25%" }}>
                  Name
                </th>
                <th className='fs-7' style={{ width: "25%" }}>
                  Address
                </th>
                <th className='fs-7' style={{ width: "25%" }}>
                  CR Registration Number
                </th>
                <th className='fs-7' style={{ width: "25%" }}>
                  VAT Registration Number
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='fs-7'>{invoiceDetails.supplier.name}</td>
                <td className='fs-7'>{invoiceDetails.supplier.address}</td>
                <td className='fs-7'>{invoiceDetails.supplier.crNumber}</td>
                <td className='fs-7'>{invoiceDetails.supplier.vatNumber}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Buyer Information */}
        <section className='mt-3'>
          <h5 className='fs-6'>Buyer Information</h5>
          <table className='table table-sm table-bordered text-center w-100'>
            <thead className='table-light'>
              <tr>
                <th className='fs-7' style={{ width: "25%" }}>
                  Name
                </th>
                <th className='fs-7' style={{ width: "25%" }}>
                  Address
                </th>
                <th className='fs-7' style={{ width: "25%" }}>
                  CR Registration Number
                </th>
                <th className='fs-7' style={{ width: "25%" }}>
                  VAT Registration Number
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='fs-7'>{invoiceDetails?.buyer?.name || "N/A"}</td>
                <td className='fs-7'>
                  {invoiceDetails?.buyer?.address || "N/A"}
                </td>
                <td className='fs-7'>
                  {invoiceDetails?.buyer?.crNumber || "N/A"}
                </td>
                <td className='fs-7'>
                  {invoiceDetails?.buyer?.vatNumber || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Product Details */}
        <h5 className='mt-3 fs-6'>Product Details</h5>
        <table className='table table-sm table-bordered text-center'>
          <thead>
            <tr>
              {/* <th className='fs-7'>Product Image</th> */}
              <th className='fs-7'>Product Name</th>
              <th className='fs-7'>Color</th>
              <th className='fs-7'>Unit Price</th>
              <th className='fs-7'>Quantity</th>
              <th className='fs-7'>Shipping Cost</th>
              <th className='fs-7'>Total Excl. VAT</th>
              <th className='fs-7'>Tax Value (15%)</th>
              <th className='fs-7'>Total Incl. VAT</th>
            </tr>
          </thead>
          <tbody>
            {invoiceDetails.items.map((item, index) => {
              const unitPrice = item.price || 0;
              const quantity = item.quantity || 1;
              const shippingCost = item.shippingCost || 0;
              const totalExclVAT = unitPrice * quantity + shippingCost;
              const taxValue = totalExclVAT * vatRate;
              const totalInclVAT = item.totalAmount || totalExclVAT + taxValue;

              return (
                <tr key={index}>
                  {/* <td>
                    <img
                      src={
                        item.mainImageUrl || "https://via.placeholder.com/50"
                      }
                      alt={item.name || "Product"}
                      style={{ width: "40px", height: "40px" }}
                    />
                  </td> */}
                  <td className='fs-7'>{item.name || "Unnamed Product"}</td>
                  <td className='fs-7'>{item.color || "N/A"}</td>
                  <td className='fs-7'>{unitPrice.toFixed(2)}</td>
                  <td className='fs-7'>{quantity}</td>
                  <td className='fs-7'>{shippingCost.toFixed(2)}</td>
                  <td className='fs-7'>{totalExclVAT.toFixed(2)}</td>
                  <td className='fs-7'>{taxValue.toFixed(2)}</td>
                  <td className='fs-7'>{totalInclVAT.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Grand Total Section */}
        <div className='text-end mt-3 fs-7'>
          <p>
            <strong>Total Excl. VAT:</strong> {totalExclVAT.toFixed(2)}
          </p>
          <p>
            <strong>VAT (15%):</strong> {vatValue.toFixed(2)}
          </p>
          <p>
            <strong>Grand Total:</strong> {grandTotal.toFixed(2)}
          </p>
        </div>

        {/* Terms & Conditions Component */}
        <TermsAndConditions supplierId={invoiceDetails?.supplierId} />
      </div>
      {/* Action Buttons */}
      <div className='text-center mt-3'>
        <button className='btn btn-secondary btn-sm me-2'>Print</button>
        <button className='btn btn-primary btn-sm' onClick={handleDownload}>
          Download
        </button>
      </div>
    </div>
  );
};

export default ReviewInvoice;
