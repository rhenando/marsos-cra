import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "feather-icons-react";
import SupplierAddProducts from "../supplier/SupplierProducts";
import ManageEmployees from "../supplier/ManageEmployees";

const EmployeeDashboard = ({ userRole, supplierId }) => {
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState(
    () => localStorage.getItem("selectedEmployeePage") || "dashboard"
  );

  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    localStorage.setItem("selectedEmployeePage", selectedPage);
  }, [selectedPage]);

  useEffect(() => {
    if (!userRole) {
      navigate("/employee-login", { replace: true });
    }
  }, [userRole, navigate]);

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return (
          <div>
            <h4 className='text-success fw-bold'>Dashboard</h4>
            <p>
              Welcome to your dashboard, <strong>{userRole}</strong>.
            </p>
          </div>
        );
      case "manage-profiles":
        return userRole === "Supplier Admin" ? (
          <div>
            <h4 className='text-success fw-bold'>Manage Profiles</h4>
            <p>View and update supplier profiles here.</p>
          </div>
        ) : (
          <div className='text-danger'>Unauthorized: Access Denied.</div>
        );
      case "manage-employees":
        return userRole === "Supplier Admin" ? (
          <ManageEmployees supplierId={supplierId} />
        ) : (
          <div className='text-danger'>Unauthorized: Access Denied.</div>
        );

      case "products":
        return userRole === "Supplier Admin" ||
          userRole === "Product Manager" ? (
          <SupplierAddProducts />
        ) : (
          <div className='text-danger'>Unauthorized: Access Denied.</div>
        );
      case "manage-orders":
        return userRole === "Order Manager" ? (
          <div>
            <h4 className='text-success fw-bold'>Manage Orders</h4>
            <p>Track and manage customer orders.</p>
          </div>
        ) : (
          <div className='text-danger'>Unauthorized: Access Denied.</div>
        );
      case "customer-service":
        return userRole === "Customer Service Representative" ? (
          <div>
            <h4 className='text-success fw-bold'>Customer Service</h4>
            <p>Handle customer queries and provide support.</p>
          </div>
        ) : (
          <div className='text-danger'>Unauthorized: Access Denied.</div>
        );
      case "inventory":
        return userRole === "Inventory Coordinator" ? (
          <div>
            <h4 className='text-success fw-bold'>Manage Inventory</h4>
            <p>Track and update inventory levels.</p>
          </div>
        ) : (
          <div className='text-danger'>Unauthorized: Access Denied.</div>
        );
      default:
        return (
          <div>
            <h4 className='text-danger fw-bold'>Page Not Found</h4>
            <p>The page you are looking for does not exist.</p>
          </div>
        );
    }
  };

  return (
    <div className='container-fluid' style={{ backgroundColor: "#f7f7f7" }}>
      <div className='row'>
        {/* Sidebar Toggle Button */}
        <button
          className='btn btn-success d-md-none mb-3'
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          Toggle Sidebar
        </button>

        {/* Sidebar */}
        {sidebarVisible && (
          <div
            className='col-md-3 bg-light py-4 d-none d-md-block'
            style={{ height: "100vh" }}
          >
            <h5 className='text-success fw-bold'>Employee Dashboard</h5>
            <div className='accordion' id='sidebarAccordion'>
              {/* Dashboard */}
              <div className='accordion-item'>
                <button
                  className={`accordion-button collapsed ${
                    selectedPage === "dashboard" ? "active-link" : ""
                  }`}
                  onClick={() => setSelectedPage("dashboard")}
                >
                  <Icon icon='home' className='me-2' /> Dashboard
                </button>
              </div>

              {/* Supplier Admin */}
              {userRole === "Supplier Admin" && (
                <>
                  <div className='accordion-item'>
                    <button
                      className={`accordion-button collapsed ${
                        selectedPage === "manage-profiles" ? "active-link" : ""
                      }`}
                      onClick={() => setSelectedPage("manage-profiles")}
                    >
                      <Icon icon='user' className='me-2' /> Manage Profiles
                    </button>
                  </div>
                  <div className='accordion-item'>
                    <button
                      className={`accordion-button collapsed ${
                        selectedPage === "manage-employees" ? "active-link" : ""
                      }`}
                      onClick={() => setSelectedPage("manage-employees")}
                    >
                      <Icon icon='users' className='me-2' /> Manage Employees
                    </button>
                  </div>
                  <div className='accordion-item'>
                    <button
                      className={`accordion-button collapsed ${
                        selectedPage === "products" ? "active-link" : ""
                      }`}
                      onClick={() => setSelectedPage("products")}
                    >
                      <Icon icon='box' className='me-2' /> Manage Products
                    </button>
                  </div>
                </>
              )}

              {/* Product Manager */}
              {userRole === "Product Manager" && (
                <div className='accordion-item'>
                  <button
                    className={`accordion-button collapsed ${
                      selectedPage === "products" ? "active-link" : ""
                    }`}
                    onClick={() => setSelectedPage("products")}
                  >
                    <Icon icon='box' className='me-2' /> Manage Products
                  </button>
                </div>
              )}

              {/* Order Manager */}
              {userRole === "Order Manager" && (
                <div className='accordion-item'>
                  <button
                    className={`accordion-button collapsed ${
                      selectedPage === "manage-orders" ? "active-link" : ""
                    }`}
                    onClick={() => setSelectedPage("manage-orders")}
                  >
                    <Icon icon='shopping-bag' className='me-2' /> Manage Orders
                  </button>
                </div>
              )}

              {/* Customer Service Representative */}
              {userRole === "Customer Service Representative" && (
                <div className='accordion-item'>
                  <button
                    className={`accordion-button collapsed ${
                      selectedPage === "customer-service" ? "active-link" : ""
                    }`}
                    onClick={() => setSelectedPage("customer-service")}
                  >
                    <Icon icon='headphones' className='me-2' /> Customer Service
                  </button>
                </div>
              )}

              {/* Inventory Coordinator */}
              {userRole === "Inventory Coordinator" && (
                <div className='accordion-item'>
                  <button
                    className={`accordion-button collapsed ${
                      selectedPage === "inventory" ? "active-link" : ""
                    }`}
                    onClick={() => setSelectedPage("inventory")}
                  >
                    <Icon icon='archive' className='me-2' /> Manage Inventory
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className='col-md-9 py-4'>{renderContent()}</div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
