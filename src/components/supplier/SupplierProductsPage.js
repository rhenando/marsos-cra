import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { FileText } from "react-feather";
import { db } from "../../firebase/config";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ProductCard from "../ProductCard";

const Products = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const { supplierId, supplierName } = useParams();

  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [supplierData, setSupplierData] = useState(null);

  const itemsPerPage = 12;

  // 1) Fetch products
  useEffect(() => {
    const fetchSupplierProducts = async () => {
      if (!supplierId) return;
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("supplierId", "==", supplierId));
        const snap = await getDocs(q);
        const prods = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProductData(prods);
        setCategories([
          "All",
          ...new Set(prods.map((p) => p.category || "Uncategorized")),
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSupplierProducts();
  }, [supplierId]);

  // 2) Fetch supplier info (now including pdfUrl)
  useEffect(() => {
    const fetchSupplierInfo = async () => {
      if (!supplierId) return;
      try {
        const ref = doc(db, "users", supplierId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const data = snap.data();
        setSupplierData({
          id: snap.id,
          name: data.companyName || data.name,
          logoUrl: data.logoUrl,
          address: data.address,
          description: data.companyDescription,
          pdfUrl: data.pdfUrl, // ← make sure your doc has this field
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchSupplierInfo();
  }, [supplierId]);

  // 3) Filter + paginate
  const filtered = productData.filter((p) => {
    const catOk = selectedTab === "All" || p.category === selectedTab;
    const nm =
      typeof p.productName === "object"
        ? p.productName[currentLang]
        : p.productName;
    const textOk =
      !searchQuery || nm?.toLowerCase().includes(searchQuery.toLowerCase());
    const priceOk =
      (!minPrice || p.price >= +minPrice) &&
      (!maxPrice || p.price <= +maxPrice);
    return catOk && textOk && priceOk;
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <div className='w-full px-4 md:px-8 py-6'>
      {/* Page Header */}
      <div className='mb-6 text-center sm:text-left'>
        <h2 className='text-2xl font-bold' style={{ color: "#2c6449" }}>
          {supplierData?.name ||
            supplierName ||
            t("supplier-products.moreFromSupplier")}
        </h2>
        <p className='text-gray-500 text-sm'>
          {t("supplier-products.subtitle")}
        </p>
      </div>

      {/* Supplier Banner */}
      <div className='flex items-center gap-4 bg-white p-4 rounded shadow-sm mb-8'>
        {/* Logo on the left */}
        <div className='flex-shrink-0'>
          <img
            src={
              supplierData?.logoUrl ||
              "https://via.placeholder.com/60x60.png?text=Logo"
            }
            alt={supplierData?.name || "Supplier Logo"}
            className='w-24 h-24 rounded-full object-cover'
          />
        </div>

        {/* Info in the middle */}
        <div>
          <h3 className='text-xl font-bold' style={{ color: "#2c6449" }}>
            {supplierData?.name || supplierName || "Supplier Name"}
          </h3>
          <p className='text-gray-500 text-sm'>Verified Supplier</p>
          {supplierData?.address && (
            <p className='text-gray-700 text-sm mt-1'>{supplierData.address}</p>
          )}
          {supplierData?.description && (
            <p className='text-gray-600 text-sm mt-2'>
              {supplierData.description}
            </p>
          )}
        </div>

        {/* Brochure / Profile block */}
        {supplierData?.pdfUrl ? (
          <a
            href={supplierData.pdfUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='ml-auto flex items-center space-x-1 text-red-600 hover:text-red-800'
          >
            <FileText className='w-5 h-5' />
            <span className='text-sm font-medium'>Download Brochure</span>
          </a>
        ) : (
          <div className='ml-auto flex items-center space-x-1 text-gray-400'>
            <FileText className='w-5 h-5' />
            <span className='text-sm font-medium'>
              No company profile added
            </span>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
        {/* Sidebar */}
        <div className='hidden lg:block'>
          <div className='bg-white p-4 rounded shadow-sm sticky top-24'>
            <h2 className='text-xl font-bold text-gray-800 mb-6'>
              {t("supplier-products.filters")}
            </h2>
            <div>
              <h3
                className='text-lg font-semibold mb-4'
                style={{ color: "#2c6449" }}
              >
                {t("supplier-products.categories")}
              </h3>
              <div className='flex flex-col gap-2'>
                {categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedTab(cat);
                      setCurrentPage(1);
                    }}
                    className={`text-left px-3 py-2 rounded text-sm transition ${
                      selectedTab === cat
                        ? "bg-[#2c6449] text-white font-semibold"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {cat}{" "}
                    <span className='ml-2 inline-block text-xs text-gray-500'>
                      (
                      {cat === "All"
                        ? productData.length
                        : productData.filter((p) => p.category === cat).length}
                      )
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className='mt-8'>
              <h3
                className='text-lg font-semibold mb-4'
                style={{ color: "#2c6449" }}
              >
                {t("supplier-products.priceRange")}
              </h3>
              <div className='flex flex-col gap-2'>
                <input
                  type='number'
                  placeholder='Min Price'
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='border border-gray-300 rounded px-3 py-2 text-sm'
                />
                <input
                  type='number'
                  placeholder='Max Price'
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='border border-gray-300 rounded px-3 py-2 text-sm'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className='col-span-1 lg:col-span-3'>
          <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-8'>
            <input
              type='text'
              className='border border-gray-300 rounded px-3 py-2 text-sm w-full max-w-xs mx-auto sm:mx-0'
              placeholder={t("supplier-products.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {paginated.length > 0 ? (
              paginated.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  locale={currentLang}
                  currencySymbol='SAR'
                />
              ))
            ) : (
              <div className='col-span-full text-center text-gray-400 text-sm py-10'>
                {t("supplier-products.noProductsFound")}
              </div>
            )}
          </div>
          <div className='flex flex-col sm:flex-row justify-between items-center mt-8 gap-4'>
            <button
              className='border text-sm rounded px-6 py-2 hover:bg-gray-100 w-full sm:w-auto text-center'
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              {t("supplier-products.previous")}
            </button>
            <span className='text-sm text-gray-600'>
              {t("supplier-products.page")} {currentPage}{" "}
              {t("supplier-products.of")} {totalPages}
            </span>
            <button
              className='border text-sm rounded px-6 py-2 hover:bg-gray-100 w-full sm:w-auto text-center'
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              {t("supplier-products.next")}
            </button>
          </div>
        </div>
      </div>

      {/* Back to Top (mobile) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className='fixed bottom-6 right-6 text-white p-3 rounded-full shadow-lg sm:hidden transition'
        style={{ backgroundColor: "#2c6449" }}
      >
        ↑
      </button>
    </div>
  );
};

export default Products;
