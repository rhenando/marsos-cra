import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const { loading, role, userData } = useAuth();
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // ✅ Stable useEffect with role === 'supplier' guard
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supplierId = userData?.uid || userData?.supplierId;
        if (!supplierId || role !== "supplier") return;

        const productsRef = collection(db, "products");
        const supplierQuery = query(
          productsRef,
          where("supplierId", "==", supplierId)
        );
        const querySnapshot = await getDocs(supplierQuery);

        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProductData(products);

        const uniqueCategories = [
          "All",
          ...new Set(
            products.map((product) => product.category || "Uncategorized")
          ),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching supplier-specific products:", error);
      }
    };

    if (!loading && userData && role === "supplier") {
      fetchProducts();
    }
  }, [loading, userData, role]);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(t("products.confirmDelete"));
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "products", productId));
        setProductData((prev) =>
          prev.filter((product) => product.id !== productId)
        );
        alert(t("products.deleteSuccess"));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(t("products.deleteFail"));
      }
    }
  };

  const filteredProducts =
    selectedTab === "All"
      ? productData
      : productData.filter((product) => product.category === selectedTab);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  // ⏳ Loading fallback
  if (loading || !userData) {
    return <div>{t("products.loading") || "Loading..."}</div>;
  }

  // ❌ Role guard
  if (role !== "supplier") {
    return <div>{t("products.notAuthorized")}</div>;
  }

  return (
    <div className='container-fluid py-3'>
      {/* Header */}
      <div className='mb-2'>
        <h4 className='text-success fw-bold'>{t("products.title")}</h4>
        <p className='text-muted small'>{t("products.subtitle")}</p>
      </div>

      {/* Dynamic Tabs */}
      <div className='mb-2 d-flex align-items-center'>
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedTab(category);
              setCurrentPage(1);
            }}
            className={`btn btn-link text-decoration-none me-2 small ${
              selectedTab === category ? "text-success fw-bold" : "text-muted"
            }`}
          >
            {category}
            <span className='badge bg-light text-dark ms-1 small'>
              {category === "All"
                ? productData.length
                : productData.filter((product) => product.category === category)
                    .length}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className='d-flex align-items-center mb-2 small'>
        <select
          className='form-select form-select-sm me-2'
          style={{ maxWidth: "150px" }}
        >
          <option value='manual'>{t("products.location")}</option>
          <option value='price'>{t("products.price")}</option>
          <option value='quantity'>{t("products.quantity")}</option>
        </select>
        <button className='btn btn-outline-primary btn-sm me-2'>
          {t("products.filter")}
        </button>
        <input
          type='text'
          className='form-control form-control-sm me-2'
          placeholder={t("products.searchPlaceholder")}
          style={{ maxWidth: "300px" }}
        />
        <button className='btn btn-primary btn-sm'>
          {t("products.search")}
        </button>
      </div>

      {/* Export & Additional Options */}
      <div className='d-flex align-items-center justify-content-between mb-2 small'>
        <button className='btn btn-outline-primary btn-sm'>
          {t("products.export")}
        </button>
        <div>
          <button className='btn btn-outline-secondary btn-sm me-2'>
            {t("products.options")}
          </button>
          <button
            className='btn btn-success btn-sm'
            onClick={() => navigate("/supplier-add-products")}
          >
            {t("products.addNew")}
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className='table-responsive'>
        <table className='table table-striped table-hover table-sm'>
          <thead className='table-light small'>
            <tr>
              <th>
                <input type='checkbox' />
              </th>
              <th>{t("products.product")}</th>
              <th>{t("products.name")}</th>
              <th>{t("products.supplierName")}</th>
              <th>{t("products.location")}</th>
              <th>{t("products.qtyPricing")}</th>
              <th>{t("products.size")}</th>
              <th>{t("products.color")}</th>
              <th>{t("products.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <input type='checkbox' />
                </td>
                <td>
                  <img
                    src={
                      product.mainImageUrl || "https://via.placeholder.com/50"
                    }
                    alt={
                      typeof product.productName === "object"
                        ? product.productName[currentLang]
                        : product.productName || "Product"
                    }
                    className='img-fluid rounded'
                    style={{ width: "40px", height: "40px" }}
                  />
                </td>
                <td className='small'>
                  {typeof product.productName === "object"
                    ? product.productName[currentLang] ||
                      product.productName["en"]
                    : product.productName}
                </td>
                <td className='small'>{product.supplierName || "N/A"}</td>
                <td className='small'>{product.mainLocation || "N/A"}</td>
                <td className='small'>
                  {product.priceRanges?.length ? (
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      {product.priceRanges.map((range, index) => (
                        <li key={index}>
                          {t("products.min")}: {range.minQty},{" "}
                          {t("products.max")}: {range.maxQty},{" "}
                          {t("products.price")}: SAR {range.price}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className='small'>
                  {product.sizes?.length ? (
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      {product.sizes.map((size, index) => (
                        <li key={index}>{size}</li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className='small'>
                  {product.colors?.length ? (
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      {product.colors.map((color, index) => (
                        <li key={index}>{color}</li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  <button
                    className='text-primary border-0 bg-transparent p-0 me-2'
                    style={{ fontSize: "0.85rem", textDecoration: "none" }}
                    onClick={() =>
                      navigate(`/supplier-edit-products/${product.id}`)
                    }
                  >
                    {t("products.edit")}
                  </button>
                  <button
                    className='text-danger border-0 bg-transparent p-0'
                    style={{ fontSize: "0.85rem", textDecoration: "none" }}
                    onClick={() => handleDelete(product.id)}
                  >
                    {t("products.remove")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className='d-flex justify-content-between align-items-center mt-3'>
        <button
          className='btn btn-outline-secondary btn-sm'
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          {t("products.previous")}
        </button>
        <span className='text-muted small'>
          {t("products.page")} {currentPage} {t("products.of")} {totalPages}
        </span>
        <button
          className='btn btn-outline-secondary btn-sm'
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          {t("products.next")}
        </button>
      </div>
    </div>
  );
};

export default Products;
