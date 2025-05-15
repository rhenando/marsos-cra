import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const EmployeeLoginPage = ({ setUserRole, setSupplierId }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Verify props are being passed correctly
  useEffect(() => {
    if (!setUserRole || !setSupplierId) {
      console.error("Missing props: setUserRole or setSupplierId.");
    }
  }, [setUserRole, setSupplierId]);

  const handleLogin = async () => {
    setError(null); // Reset error state
    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    try {
      console.log("Attempting login for:", email);

      // Query Firestore for employee with matching email and password
      const q = query(
        collection(db, "employees"),
        where("email", "==", email),
        where("password", "==", password) // Plaintext comparison - not secure!
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Successful login: extract user role and supplierId
        const employeeData = querySnapshot.docs[0].data();
        console.log("Employee data:", employeeData);

        if (!employeeData.role || !employeeData.supplierId) {
          setError("User role or supplier ID missing in Firestore.");
          return;
        }

        setUserRole(employeeData.role); // Pass role to parent
        setSupplierId(employeeData.supplierId); // Pass supplierId to parent
        navigate("/employee-dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err.message || err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className='container mt-5'>
      <h4>Employee Login</h4>
      <div>
        <label>Email:</label>
        <input
          type='email'
          placeholder='Enter your email'
          className='form-control'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type='password'
          placeholder='Enter your password'
          className='form-control'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className='text-danger mt-2'>{error}</p>}
      <button onClick={handleLogin} className='btn btn-success mt-3'>
        Login
      </button>
    </div>
  );
};

export default EmployeeLoginPage;
