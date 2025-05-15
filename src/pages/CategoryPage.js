import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";

// ✅ Exact same slugify used in CategoryGrid
const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-ا-ي]+/g, "") // Remove special characters, allow Arabic
    .replace(/--+/g, "-") // Collapse multiple dashes
    .replace(/^-+/, "") // Trim leading dash
    .replace(/-+$/, ""); // Trim trailing dash

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currencySymbol = locale === "ar" ? "ر.س." : "SR ";

  const formatNumber = (number, locale) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(number);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ✅ Match products by slug using slugify
        const matchedProducts = allProducts.filter((product) => {
          const productSlug = product.category ? slugify(product.category) : "";
          return productSlug === slug;
        });

        if (matchedProducts.length > 0) {
          setCategoryName(matchedProducts[0].category); // Set readable name
        }

        setProducts(matchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  const readableCategory = categoryName || slug.replace(/-/g, " ");

  return (
    <div className='container py-4'>
      <h2 className='mb-4 text-success text-center'>
        {readableCategory} {t("hero.category")}
      </h2>

      {loading ? (
        <p>{t("loading")}</p>
      ) : products.length > 0 ? (
        <div className='row g-2'>
          {products.map((product) => (
            <div key={product.id} className='col-12 col-sm-6 col-md-3'>
              <ProductCard
                product={product}
                locale={locale}
                currencySymbol={currencySymbol}
                formatNumber={formatNumber}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center'>{t("hero.no_products_found")}</p>
      )}
    </div>
  );
};

export default CategoryPage;
