import React, { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import RfqModal from "../../pages/RfqPage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";
import firstBanner from "../../assets/1stbanner.png";
import { Grid, MousePointer, Shield, Video } from "react-feather";

const banners = [
  {
    title: "Effortless Shopping",
    description: "Unite all Saudi products in one place.",
    buttonText: "View More",
    backgroundImage: firstBanner,
  },
  {
    title: "Explore Verified Suppliers",
    description: "Global Connections at Your Fingertips",
    buttonText: "Start Exploring",
    backgroundImage: "/images/suppliers-banner.jpg",
  },
  {
    title: "Smart Manufacturing",
    description: "Discover the Latest Innovations",
    buttonText: "Join Now",
    backgroundImage: "/images/manufacturing-banner.jpg",
  },
];

const getLocalizedText = (value, locale = "en") => {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null)
    return value[locale] || value["en"] || Object.values(value)[0];
  return "";
};

function MobileHeroSection() {
  const [categories, setCategories] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const productsSnapshot = await getDocs(collection(db, "products"));
      const categorySet = new Set();

      productsSnapshot.forEach((doc) => {
        const product = doc.data();
        if (product.category) {
          categorySet.add(product.category);
        }
      });

      setCategories(Array.from(categorySet));
    };

    const fetchRandomProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        setRandomProducts(shuffled.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch random products:", err);
      }
    };

    fetchCategories();
    fetchRandomProducts();
  }, []);

  return (
    <section className='lg:hidden w-full bg-white pb-8'>
      {/* Banner Swiper */}
      <div className='w-full h-[200px]'>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
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
                <div className='absolute inset-0 bg-black/40' />
                <div className='relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-4'>
                  <h2 className='text-lg font-bold mb-2'>{banner.title}</h2>
                  <p className='text-xs mb-3'>{banner.description}</p>
                  <button className='bg-white text-[#2c6449] text-xs px-3 py-1 rounded-full'>
                    {banner.buttonText}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Icon Buttons */}
      <div className='flex justify-around text-center text-xs py-3 bg-[#f7f7f7] text-[#2c6449]'>
        <button onClick={() => navigate("/categories")}>
          <div className='flex flex-col items-center'>
            <Grid size={24} />
            <span>All Categories</span>
          </div>
        </button>
        <button onClick={() => setShowRFQModal(true)}>
          <div className='flex flex-col items-center'>
            <MousePointer size={24} />
            <span>Buyer's Choice</span>
          </div>
        </button>
        <button onClick={() => navigate("/secured")}>
          <div className='flex flex-col items-center'>
            <Shield size={24} />
            <span>Secured Trading</span>
          </div>
        </button>
        <button onClick={() => navigate("/videos")}>
          <div className='flex flex-col items-center'>
            <Video size={24} />
            <span>Leading Supplier</span>
          </div>
        </button>
      </div>

      {/* Categories */}
      <div className='mt-2 px-4'>
        <h3 className='text-sm font-semibold text-[#2c6449] mb-1'>
          Categories
        </h3>
        <div className='relative w-full overflow-hidden'>
          <div className='flex w-max animate-slide whitespace-nowrap gap-2'>
            {categories.map((cat) => (
              <span
                key={cat}
                className='inline-block border border-[#2c6449] text-xs text-gray-700 px-3 py-1 rounded-full cursor-pointer hover:bg-[#2c6449] hover:text-white transition'
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* You May Like */}
      <div className='px-4 mt-4'>
        <h3 className='text-sm font-semibold text-[#2c6449] mb-2'>
          You May Like
        </h3>

        {/* 🔄 Auto-scrolling horizontal section */}
        <div className='relative w-full overflow-hidden'>
          <div className='flex w-max animate-slide whitespace-nowrap gap-4'>
            {randomProducts.map((product) => (
              <div
                key={product.id}
                className='min-w-[180px] bg-white border rounded shadow-sm p-3 flex-shrink-0'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-gray-100 rounded-full overflow-hidden'>
                    {product.mainImageUrl ? (
                      <img
                        src={product.mainImageUrl}
                        alt={
                          getLocalizedText(
                            product.productName,
                            navigator.language || "en"
                          ) || "Product"
                        }
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-300'></div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium line-clamp-1'>
                      {getLocalizedText(
                        product.productName,
                        navigator.language || "en"
                      ) || "Unnamed Product"}
                    </p>

                    <p className='text-xs text-gray-500'>123,000+ Products</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 📦 CTA Button */}
        <button
          onClick={() => setShowRFQModal(true)}
          className='mt-4 w-full border border-[#2c6449] text-[#2c6449] text-sm py-2 rounded hover:bg-[#2c6449] hover:text-white transition'
        >
          Request RFQ Now
        </button>
      </div>

      <RfqModal show={showRFQModal} onClose={() => setShowRFQModal(false)} />
    </section>
  );
}

export default MobileHeroSection;
