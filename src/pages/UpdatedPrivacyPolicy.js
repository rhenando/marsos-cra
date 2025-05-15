import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // Import Firestore instance

const UpdatedPrivacyPolicy = () => {
  const [policy, setPolicy] = useState(""); // State to hold privacy policy content
  const [loading, setLoading] = useState(true); // State for loading indicator

  useEffect(() => {
    // Fetch privacy policy from Firestore
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "policies", "privacyPolicy"); // Document path
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPolicy(docSnap.data().content); // Assuming the document has a `content` field
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return (
    <div className='container mt-4'>
      <h3 className='text-success fw-bold'>Privacy Policy</h3>
      <p className='text-muted'>{policy}</p> {/* Render content as paragraph */}
    </div>
  );
};

export default UpdatedPrivacyPolicy;
