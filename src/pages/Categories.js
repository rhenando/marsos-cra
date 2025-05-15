import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";

const CategoriesAndProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productList);

        const uniqueCategories = [
          ...new Set(productList.map((p) => p.category?.trim())),
        ].map((category) => ({
          name: category,
          image:
            productList.find((p) => p.category?.trim() === category)
              ?.mainImageUrl || "https://via.placeholder.com/300",
        }));

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!activeCategory) {
      setSubcategories([]);
      setActiveSubcategory("");
    } else {
      const relatedProducts = products.filter(
        (p) =>
          p.category?.toLowerCase().trim() ===
          activeCategory.toLowerCase().trim()
      );

      const uniqueSubcategories = [
        ...new Set(
          relatedProducts.map((p) =>
            p.subCategory ? p.subCategory.trim() : "Other"
          )
        ),
      ];

      setSubcategories(uniqueSubcategories);
      setActiveSubcategory(
        uniqueSubcategories.length > 0 ? uniqueSubcategories[0] : "Other"
      );
    }
  }, [activeCategory, products]);

  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      p.category?.toLowerCase().trim() === activeCategory.toLowerCase().trim();

    const subcategoryValue = (p.subCategory || "Other").toLowerCase().trim();
    const activeSubcategoryValue = (activeSubcategory || "Other")
      .toLowerCase()
      .trim();

    const subCategoryMatch =
      !activeSubcategory || subcategoryValue === activeSubcategoryValue;

    return categoryMatch && subCategoryMatch;
  });

  return (
    <div className='px-4 py-6'>
      {/* Categories Section */}
      <h1 className='text-center text-2xl font-bold text-[#2c6449] mb-6'>
        {t("categories.categories")}
      </h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {categories.map((category, index) => (
          <div
            key={index}
            className={`rounded-lg overflow-hidden shadow-md relative cursor-pointer transition-all duration-200 ${
              activeCategory.toLowerCase().trim() ===
              category.name?.toLowerCase().trim()
                ? "ring-2 ring-[#2c6449]"
                : "hover:ring-2 hover:ring-gray-300"
            }`}
            style={{ height: "200px" }}
            onClick={() => setActiveCategory(category.name?.trim())}
          >
            <img
              src={category.image}
              alt={category.name}
              className='w-full h-full object-cover'
            />
            <div className='absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center py-2'>
              <h5 className='text-sm font-semibold'>{category.name}</h5>
            </div>
          </div>
        ))}
      </div>

      {/* Subcategory Section */}
      {activeCategory && subcategories.length > 0 && (
        <div className='my-6'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <h5 className='text-gray-600'>
              {t("categories.products", { count: filteredProducts.length })}
            </h5>

            {isSmallScreen ? (
              <select
                value={activeSubcategory}
                onChange={(e) => setActiveSubcategory(e.target.value)}
                className='border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#2c6449]'
              >
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubcategory(sub)}
                    className={`px-4 py-2 text-sm font-medium rounded ${
                      activeSubcategory.toLowerCase().trim() ===
                      sub.toLowerCase().trim()
                        ? "bg-[#2c6449] text-white"
                        : "border border-[#2c6449] text-[#2c6449] hover:bg-[#2c6449] hover:text-white"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-8'>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/product/${product.id}`)}
              locale={navigator.language}
              currencySymbol='SR'
            />
          ))
        ) : (
          <p className='text-center col-span-full'>
            {t("categories.no_products_found")}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoriesAndProductsPage;
