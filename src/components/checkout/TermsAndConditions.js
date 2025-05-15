// src/components/CheckOut/TermsAndConditions.js

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config"; // adjust path if needed

const TermsAndConditions = ({ supplierId }) => {
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      if (!supplierId) return;

      try {
        const termsRef = doc(db, "terms_and_conditions", supplierId);
        const termsSnap = await getDoc(termsRef);

        if (termsSnap.exists()) {
          setTerms(termsSnap.data().content || "");
        } else {
          setTerms("No terms and conditions available.");
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
        setTerms("Error loading terms and conditions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [supplierId]);

  if (loading) return <p>Loading terms and conditions...</p>;

  return (
    <div className='mt-4'>
      <h5 className='fs-6'>Terms & Conditions</h5>
      <p className='fs-7' style={{ whiteSpace: "pre-wrap" }}>
        {terms}
      </p>
    </div>
  );
};

export default TermsAndConditions;
