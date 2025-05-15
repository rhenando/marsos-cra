import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";

const TrendingProductsSection = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("trending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useTranslation();

  const locale = navigator.language || "en-US";
  const currencySymbol = "SR";

  const formatNumber = (number, locale) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllProducts(fetched);
        setError(null);
      } catch (err) {
        console.error("Error fetching data", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTrendingProducts = () => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  };

  return (
    <section className='bg-gray-50 py-8'>
      <div className='w-[90%] mx-auto'>
        {/* Nav */}
        <div className='flex flex-wrap gap-4 mb-6'>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-2 text-sm font-medium rounded ${
              activeTab === "trending"
                ? "bg-[#2c6449] text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            {t("section.trending")}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium rounded ${
              activeTab === "all"
                ? "bg-[#2c6449] text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            {t("section.allProducts")}
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <p className='text-center text-gray-500'>{t("loading")}</p>
        ) : error ? (
          <p className='text-center text-red-600'>{error}</p>
        ) : (
          <>
            {activeTab === "all" && (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {allProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    currencySymbol={currencySymbol}
                    formatNumber={formatNumber}
                  />
                ))}
              </div>
            )}

            {activeTab === "trending" && (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {getTrendingProducts().map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    currencySymbol={currencySymbol}
                    formatNumber={formatNumber}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default TrendingProductsSection;
