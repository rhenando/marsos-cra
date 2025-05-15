import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config"; // Import the Firestore instance

const TermsAndConditions = () => {
  const [terms, setTerms] = useState(""); // State to hold the terms and conditions
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [saving, setSaving] = useState(false); // State for save button

  const navigate = useNavigate(); // Initialize navigate hook

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "policies", "termsAndConditions");
      await updateDoc(docRef, { content: terms }); // Update Firestore document
      alert("Terms and Conditions saved successfully!");
      navigate("/admin-dashboard"); // Redirect to /admin-dashboard
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  return (
    <div className='container mt-4'>
      <h3 className='text-success fw-bold'>Terms and Conditions</h3>
      <p className='text-muted mb-3'>
        Write and manage the terms and conditions for using your platform.
      </p>
      <textarea
        className='form-control'
        rows='10'
        value={terms} // Bind the textarea value to state
        onChange={(e) => setTerms(e.target.value)} // Update state on change
        placeholder='Write your terms and conditions here...'
      ></textarea>
      <button
        className='btn btn-success mt-3'
        onClick={handleSave}
        disabled={saving} // Disable button while saving
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default TermsAndConditions;
