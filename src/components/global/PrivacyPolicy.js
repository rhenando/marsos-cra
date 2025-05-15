import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config"; // Import Firestore instance

const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState(""); // State to hold privacy policy content
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [saving, setSaving] = useState(false); // State for saving indicator

  const navigate = useNavigate(); // Initialize navigate hook

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "policies", "privacyPolicy");
      await updateDoc(docRef, { content: policy }); // Update Firestore document
      alert("Privacy Policy saved successfully!");
      navigate("/admin-dashboard"); // Redirect to /admin-dashboard
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return (
    <div className='container mt-4'>
      <h3 className='text-success fw-bold'>Privacy Policy</h3>
      <p className='text-muted mb-3'>
        Here you explain to your customers the privacy policy when browsing the
        site and logging in, in a clear and easy way.
      </p>
      <textarea
        className='form-control'
        rows='10'
        value={policy} // Bind textarea value to state
        onChange={(e) => setPolicy(e.target.value)} // Update state on change
        placeholder='Write your privacy policy here...'
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

export default PrivacyPolicy;
