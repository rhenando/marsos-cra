import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";

const PlasticAndPapersSubcategories = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plasticSubcategories, setPlasticSubcategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [sortOption, setSortOption] = useState("newest");

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currencySymbol = locale === "ar" ? "ر.س. " : "SR ";

  const formatNumber = (number) => {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(
      number
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const plasticProducts = productList.filter(
          (product) => product.category === "Plastic & Papers"
        );

        const plasticSubcategoriesSet = new Set(
          plasticProducts.map((product) => product.subCategory).filter(Boolean)
        );

        setProducts(plasticProducts);
        setPlasticSubcategories([...Array.from(plasticSubcategoriesSet)]);
        setFilteredProducts(plasticProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and Sort Logic
  useEffect(() => {
    let updatedProducts = [...products];

    if (activeTab !== "All") {
      updatedProducts = updatedProducts.filter(
        (product) => product.subCategory === activeTab
      );
    }

    switch (sortOption) {
      case "newest":
        updatedProducts.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        updatedProducts.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "highest":
        updatedProducts.sort(
          (a, b) =>
            Math.max(...b.priceRanges.map((r) => Number(r.price))) -
            Math.max(...a.priceRanges.map((r) => Number(r.price)))
        );
        break;
      case "lowest":
        updatedProducts.sort(
          (a, b) =>
            Math.min(...a.priceRanges.map((r) => Number(r.price))) -
            Math.min(...b.priceRanges.map((r) => Number(r.price)))
        );
        break;
      case "location":
        updatedProducts.sort((a, b) =>
          (a.mainLocation || "").localeCompare(b.mainLocation || "")
        );
        break;
      default:
        break;
    }

    setFilteredProducts(updatedProducts);
  }, [activeTab, products, sortOption]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  const sliderSettings = {
    infinite: plasticSubcategories.length > 5,
    speed: 500,
    slidesToShow: Math.min(5, plasticSubcategories.length),
    slidesToScroll: 1,
    rtl: locale === "ar", // Enable RTL for Arabic
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(4, plasticSubcategories.length),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(3, plasticSubcategories.length),
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: Math.min(2, plasticSubcategories.length),
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: Math.min(1, plasticSubcategories.length),
        },
      },
    ],
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className='container my-5'>
        <h1 className='text-center mb-4' style={{ color: "#2c6449" }}>
          Plastic & Papers
        </h1>
        <Slider {...sliderSettings}>
          {plasticSubcategories.map((subcategory, index) => {
            const firstProduct = products.find(
              (product) => product.subCategory === subcategory
            );
            const subcategoryImage =
              firstProduct?.mainImageUrl || "https://via.placeholder.com/300";

            return (
              <div key={index}>
                <div
                  className='d-flex flex-column align-items-center text-center'
                  style={{ padding: "15px" }}
                >
                  <div
                    className='rounded-circle overflow-hidden'
                    style={{
                      width: "100px",
                      height: "100px",
                      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <img
                      src={subcategoryImage}
                      alt={subcategory}
                      className='img-fluid'
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                  <p
                    className='mt-3 text-truncate'
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      maxWidth: "120px",
                      color: "#2c6449",
                    }}
                  >
                    {subcategory}
                  </p>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      <div className='container my-5'>
        <div className='d-flex justify-content-between align-items-center flex-wrap mb-4'>
          <div className='btn-group flex-wrap mb-2'>
            {plasticSubcategories.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => setActiveTab(subcategory)}
                className={`btn ${
                  activeTab === subcategory
                    ? "btn-success"
                    : "btn-outline-success"
                } btn-sm me-2`}
                style={{
                  color: activeTab === subcategory ? "#fff" : "#2c6449",
                  backgroundColor:
                    activeTab === subcategory ? "#2c6449" : "transparent",
                }}
              >
                {subcategory}
              </button>
            ))}
          </div>

          <select
            onChange={(e) => setSortOption(e.target.value)}
            className='form-select form-select-sm w-auto'
          >
            <option value='newest'>Newest</option>
            <option value='oldest'>Oldest</option>
            <option value='highest'>Highest Price</option>
            <option value='lowest'>Lowest Price</option>
            <option value='location'>Location</option>
          </select>
        </div>

        <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4'>
          {filteredProducts.map((product) => {
            const priceRanges = product.priceRanges || [];
            const prices = priceRanges.map((range) => Number(range.price));
            const lowestPrice = prices.length ? Math.min(...prices) : "N/A";
            const highestPrice = prices.length ? Math.max(...prices) : "N/A";
            const minOrder = priceRanges[0]?.minQty || "N/A";
            const mainImage =
              product.mainImageUrl || "https://via.placeholder.com/300";
            const sizes = product.sizes?.join(", ") || t("N/A");
            const colors = product.colors?.join(", ") || t("N/A");
            const origin = product.mainLocation || t("Unknown Origin");

            return (
              <div className='col' key={product.id}>
                <div className='card shadow-sm border-0 h-100'>
                  <div
                    className='card-img-top overflow-hidden'
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src={mainImage}
                      alt={product.productName || t("Unnamed product")}
                      className='img-fluid w-100 h-100'
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <div className='card-body'>
                    <h5
                      className='card-title text-truncate'
                      style={{ color: "#2c6449", fontWeight: "bold" }}
                    >
                      {product.productName || t("Unnamed product")}
                    </h5>
                    <p
                      className='text-truncate'
                      style={{
                        fontStyle: "italic",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c6449",
                      }}
                    >
                      {product.subCategory || t("Uncategorized")}
                    </p>
                    <p className='text-muted large'>
                      <strong>
                        {`${currencySymbol}${formatNumber(
                          lowestPrice
                        )} - ${currencySymbol}${formatNumber(highestPrice)}`}
                      </strong>
                    </p>
                    <p className='text-muted small'>
                      {t("Origin")}: {origin}
                    </p>
                    <p className='text-muted small'>
                      {t("Min Order")}: {minOrder}
                    </p>
                    <p className='text-muted small'>
                      {t("Sizes")}: {sizes}
                    </p>
                    <p className='text-muted small'>
                      {t("Colors")}: {colors}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className='btn btn-success btn-sm w-100'
                    style={{
                      backgroundColor: "#2c6449",
                      borderColor: "#2c6449",
                      color: "#fff",
                    }}
                  >
                    {t("View Details")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlasticAndPapersSubcategories;
