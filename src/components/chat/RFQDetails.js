import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const RFQDetails = ({ rfqId }) => {
  const [rfqDetails, setRfqDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rfqId) return;

    const fetchRFQ = async () => {
      try {
        const rfqRef = doc(db, "rfqs", rfqId);
        const rfqSnap = await getDoc(rfqRef);

        if (rfqSnap.exists()) {
          setRfqDetails(rfqSnap.data());
        } else {
          console.warn("RFQ not found!");
        }
      } catch (error) {
        console.error("Error fetching RFQ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRFQ();
  }, [rfqId]);

  if (loading) return <p>Loading RFQ Details...</p>;
  if (!rfqDetails) return <p>No RFQ Details Found</p>;

  return (
    <div className='rfq-details'>
      <h3>RFQ Details</h3>
      <p>
        <strong>Category:</strong> {rfqDetails.category || "N/A"}
      </p>
      <p>
        <strong>Subcategory:</strong> {rfqDetails.subcategory || "N/A"}
      </p>
      <p>
        <strong>Product:</strong> {rfqDetails.productDetails || "N/A"}
      </p>
      <p>
        <strong>Size:</strong> {rfqDetails.size || "N/A"}
      </p>
      <p>
        <strong>Color:</strong> {rfqDetails.color || "N/A"}
      </p>
      <p>
        <strong>Shipping To:</strong> {rfqDetails.shipping || "N/A"}
      </p>
      <p>
        <strong>Buyer ID:</strong> {rfqDetails.buyerId || "N/A"}
      </p>
    </div>
  );
};

export default RFQDetails;
