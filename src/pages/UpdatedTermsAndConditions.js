import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // Import Firestore instance

const UpdatedTermsAndConditions = () => {
  const [terms, setTerms] = useState(""); // State to hold terms and conditions content
  const [loading, setLoading] = useState(true); // State for loading indicator

  useEffect(() => {
    // Fetch terms and conditions from Firestore
    const fetchTerms = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "policies", "termsAndConditions"); // Document path
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTerms(docSnap.data().content); // Assuming the document has a `content` field
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return (
    <div className='container mt-4'>
      <h3 className='text-success fw-bold'>Terms and Conditions</h3>
      <p className='text-muted'>{terms}</p> {/* Render content as paragraph */}
    </div>
  );
};

export default UpdatedTermsAndConditions;
