import React, { useEffect, useState } from "react";

import { db } from "../firebase/config"; // Import Firebase config
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard"; // Adjust path as needed

const ProductsPage = () => {
  const [products, setProducts] = useState([]); // State to hold all products
  const [loading, setLoading] = useState(true); // State for loading status
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered product list
  const [activeTab, setActiveTab] = useState("Newest"); // Default active tab
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Track screen size

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products")); // Replace 'products' with your Firestore collection name
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList); // Update state with fetched data
        setFilteredProducts(productList); // Initially set filtered products
        setLoading(false); // Turn off loading spinner
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const locale = navigator.language || "en-US";
  const currencySymbol = "SR"; // Replace with your actual symbol

  const formatNumber = (number, locale) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);

  // Apply sorting based on the active tab
  useEffect(() => {
    let sortedProducts = [...products];
    switch (activeTab) {
      case "Lowest":
        sortedProducts.sort(
          (a, b) =>
            (a.priceRanges?.[0]?.price || 0) - (b.priceRanges?.[0]?.price || 0)
        );
        break;
      case "Highest":
        sortedProducts.sort(
          (a, b) =>
            (b.priceRanges?.[0]?.price || 0) - (a.priceRanges?.[0]?.price || 0)
        );
        break;
      case "Newest":
        sortedProducts.sort((a, b) => b.createdAt - a.createdAt); // Assuming `createdAt` is a timestamp
        break;
      case "Oldest":
        sortedProducts.sort((a, b) => a.createdAt - b.createdAt); // Assuming `createdAt` is a timestamp
        break;
      case "Locations":
        sortedProducts.sort((a, b) =>
          (a.mainLocation || "").localeCompare(b.mainLocation || "")
        );
        break;
      default:
        break;
    }
    setFilteredProducts(sortedProducts);
  }, [activeTab, products]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading products...</p>;
  }

  if (products.length === 0) {
    return <p style={{ textAlign: "center" }}>No products available.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Header Row */}

      <div
        style={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "500",
            color: "#2c6449",
            margin: 0,
          }}
        >
          Total {filteredProducts.length} Products
        </h2>

        {/* Tabs or Dropdown */}
        {isSmallScreen ? (
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "14px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              background: "#fff",
              color: "#555",
            }}
          >
            {["Newest", "Oldest", "Lowest", "Highest", "Locations"].map(
              (tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              )
            )}
          </select>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            {["Newest", "Oldest", "Lowest", "Highest", "Locations"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 15px",
                    background: activeTab === tab ? "#2c6449" : "transparent",
                    color: activeTab === tab ? "#fff" : "#555",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: activeTab === tab ? "bold" : "normal",
                  }}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            currencySymbol={currencySymbol}
            formatNumber={formatNumber}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
