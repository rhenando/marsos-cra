import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      className='d-flex flex-column align-items-center justify-content-center'
      style={{ minHeight: "100vh", textAlign: "center" }}
    >
      <h1 style={{ fontSize: "5rem", color: "#d9534f" }}>404</h1>
      <p style={{ fontSize: "1.5rem" }}>Page Not Found or Access Denied</p>
      <Link to='/' style={{ fontSize: "1.2rem", color: "#337ab7" }}>
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
