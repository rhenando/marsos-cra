import React, { useEffect, useState, useRef } from "react";
import {
  List,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  ThumbsUp,
  Clock,
} from "react-feather";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import RfqModal from "../pages/RfqPage";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";

import firstBanner from "../assets/1stbanner.png";
import secondBanner from "../assets/2ndbanner.png";
import thirdBanner from "../assets/3rdbanner.png";
import heroBackground from "../assets/hero-background.png";

const cardData = [
  {
    titleKey: "hero.cards.choice",
    descriptionKey: "hero.cards.choiceDesc",
    icon: <ThumbsUp size={20} />,
  },
  {
    titleKey: "hero.cards.secure",
    descriptionKey: "hero.cards.secureDesc",
    icon: <Shield size={20} />,
  },
  {
    titleKey: "hero.cards.topSupplier",
    descriptionKey: "hero.cards.topSupplierDesc",
    icon: <Award size={20} />,
  },
  {
    titleKey: "hero.cards.fastResponse",
    descriptionKey: "hero.cards.fastResponseDesc",
    icon: <Clock size={20} />,
  },
];

const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-ا-ي]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

function HeroSection() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [showRFQModal, setShowRFQModal] = useState(false);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const allProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const counts = {};
      allProducts.forEach((product) => {
        const category = product.category?.trim() || "Uncategorized";
        counts[category] = (counts[category] || 0) + 1;
      });
      setCategoryCounts(counts);
      setRandomProducts(
        allProducts.sort(() => 0.5 - Math.random()).slice(0, 3)
      );
    };

    fetchRandomProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const categoryMap = {};
      snapshot.docs
        .map((doc) => doc.data())
        .forEach((product) => {
          const category = product.category?.trim() || "Uncategorized";
          const slug = slugify(category);
          if (!categoryMap[slug]) categoryMap[slug] = { name: category, slug };
        });
      setCategories(Object.values(categoryMap));
    };

    fetchCategories();
  }, []);

  const getLocalizedProductName = (product) => {
    const name = product.productName;
    return typeof name === "string"
      ? name
      : name?.[i18n.language] || name?.en || t("product.unnamed");
  };

  const banners = [
    {
      title: t("hero_title"),
      description: `${t("hero_paragraph1")}\n\n${t("hero_paragraph2")}`,
      buttonText: t("hero.banner1.cta"),
      backgroundImage: firstBanner,
      route: "/",
    },
    {
      title: t("hero.banner2.title"),
      description: t("hero.banner2.desc"),
      buttonText: t("hero.banner2.cta"),
      backgroundImage: secondBanner,
      route: "/top-supplier",
    },
    {
      title: t("hero.banner3.title"),
      description: t("hero.banner3.desc"),
      buttonText: t("hero.banner3.cta"),
      backgroundImage: thirdBanner,
      route: "/products",
    },
  ];

  return (
    <>
      <section
        className='w-full bg-cover bg-center relative'
        style={{
          backgroundImage: `url(${heroBackground})`,
          height: "calc(100vh - 104px)",
        }}
      >
        <div className='absolute inset-0 bg-[#2c6449]/80 z-0'></div>

        <div className='relative z-10 w-full flex flex-col items-center pt-7'>
          <div className='w-[90%] flex flex-col lg:flex-row h-auto gap-4 lg:h-[75%]'>
            {/* Sidebar */}
            <div className='w-full lg:w-1/5 bg-white p-4 border-r rounded'>
              <h2 className='font-semibold mb-4 flex items-center gap-2 text-[#2c6449]'>
                <List size={18} className='mt-[2px]' />
                <span>{t("hero.categories")}</span>
              </h2>
              <ul className='space-y-2 text-base text-gray-700'>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className='flex justify-between items-center p-2 rounded-md hover:bg-[#e6f4ec] transition duration-200 group cursor-pointer'
                    >
                      <span className='font-semibold text-gray-700 group-hover:text-[#2c6449]'>
                        {cat.name}
                      </span>
                      <span className='text-xs text-gray-400'>
                        {categoryCounts[cat.name?.trim()] || 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slider */}
            <div className='w-full lg:w-3/5 relative'>
              <Swiper
                modules={[Autoplay, Navigation]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                onBeforeInit={(swiper) => {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
                loop={true}
                className='h-full w-full'
              >
                {banners.map((banner, index) => (
                  <SwiperSlide key={index}>
                    <div
                      className='h-full w-full relative'
                      style={{
                        backgroundImage: `url(${banner.backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className='absolute inset-0 bg-[#2c6449]/60'></div>
                      <div className='relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-8'>
                        <h1 className='text-3xl font-bold mb-4 max-w-2xl leading-snug'>
                          {banner.title}
                        </h1>
                        <p className='mb-6 text-base whitespace-pre-line max-w-2xl leading-relaxed'>
                          {banner.description}
                        </p>
                        <button
                          onClick={() => navigate(banner.route)}
                          className='bg-white text-[#2c6449] px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#2c6449] hover:text-white transition'
                        >
                          {banner.buttonText}
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className='absolute top-1/2 -translate-y-1/2 left-4 z-20'>
                <button
                  ref={prevRef}
                  className='text-[#2c6449] hover:text-white transition'
                >
                  <ChevronLeft size={32} />
                </button>
              </div>
              <div className='absolute top-1/2 -translate-y-1/2 right-4 z-20'>
                <button
                  ref={nextRef}
                  className='text-[#2c6449] hover:text-white transition'
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            </div>

            {/* Product Recommendations */}
            <div className='w-full lg:w-1/5 bg-white p-4 border-l rounded'>
              <h2 className='font-semibold mb-4'>
                {t("hero.recommendations")}
              </h2>
              <ul className='space-y-4 text-sm'>
                {randomProducts.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${product.id}`}
                      className='flex items-start gap-2 hover:bg-[#e6f4ec] p-1 rounded transition cursor-pointer'
                    >
                      <div className='w-12 h-12 bg-gray-200 rounded-sm overflow-hidden border border-gray-200'>
                        {product.mainImageUrl ? (
                          <img
                            src={product.mainImageUrl}
                            alt={getLocalizedProductName(product)}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-300'></div>
                        )}
                      </div>
                      <div>
                        <p className='font-small capitalize'>
                          {getLocalizedProductName(product)}
                        </p>
                        <p className='text-gray-500 text-xs'>
                          {product.category}
                        </p>
                        <p className='text-gray-400 text-[11px]'>
                          {categoryCounts[product.category?.trim()] || 0}{" "}
                          {t("hero.productsInCategory")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowRFQModal(true)}
                className='mt-6 w-full bg-[#2c6449] text-white text-sm py-2 rounded-full border border-[#2c6449] transition-colors duration-200 hover:bg-white hover:!text-[#2c6449]'
              >
                {t("hero.requestRFQ")}
              </button>
            </div>
          </div>

          {/* Bottom Cards */}
          <div className='w-[90%] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-7'>
            {cardData.map((card) => (
              <div
                key={card.titleKey}
                className='bg-white shadow-sm rounded p-4 sm:p-5 text-sm text-[#2c6449] hover:shadow-md hover:scale-[1.02] transform transition duration-200 ease-in-out cursor-pointer'
              >
                <div className='flex items-start gap-3'>
                  <div className='text-[#2c6449] mt-1'>{card.icon}</div>
                  <div>
                    <div className='font-semibold'>{t(card.titleKey)}</div>
                    <p className='text-xs text-gray-500 mt-1'>
                      {t(card.descriptionKey)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RfqModal show={showRFQModal} onClose={() => setShowRFQModal(false)} />
    </>
  );
}

export default HeroSection;
