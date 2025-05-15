import React, { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import MobileHeroSection from "./mobile/MobileHeroSection";
import TrendingProductsSection from "./TrendingProductsSection";
import FeaturedCategorySection from "./FeaturedCategorySection";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

// ✅ SEO imports
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

function Home() {
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const fallbackImage = "/images/fallback.png";

  const { t, i18n } = useTranslation(); // ✅

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAndGroup = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const categoryMap = {};
        allProducts.forEach((prod) => {
          const category = prod.category || "Uncategorized";
          if (!categoryMap[category]) {
            categoryMap[category] = [];
          }
          categoryMap[category].push({
            name: prod.productName || "Unnamed Product",
            img: prod.mainImageUrl || fallbackImage,
          });
        });

        const groupedArray = Object.entries(categoryMap).map(
          ([categoryName, products]) => ({
            categoryName,
            bannerImage: products[0]?.img || fallbackImage,
            products: products.slice(0, 8),
          })
        );

        setGroupedCategories(groupedArray);
      } catch (error) {
        console.error("Error fetching product categories:", error);
      }
    };

    fetchAndGroup();
  }, []);

  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>{t("home.title")}</title>
        <meta name='description' content={t("home.description")} />
        <html
          lang={i18n.language}
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
        />
        <link rel='alternate' href='https://marsos.sa/en' hreflang='en' />
        <link rel='alternate' href='https://marsos.sa/ar' hreflang='ar' />
      </Helmet>

      <div>
        {isMobile ? <MobileHeroSection /> : <HeroSection />}
        <TrendingProductsSection />

        {groupedCategories.length > 0 && (
          <FeaturedCategorySection
            categoryName={groupedCategories[0].categoryName}
            bannerImage={groupedCategories[0].bannerImage}
            products={groupedCategories[0].products}
          />
        )}
      </div>
    </>
  );
}

export default Home;
