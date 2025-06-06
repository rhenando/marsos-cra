import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, Mail, Heart } from "react-feather";
import Currency from "./global/CurrencySymbol";
import { getAuth } from "firebase/auth";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const priceRanges = product.priceRanges || [];
  const prices = priceRanges.map((range) => parseFloat(range.price));
  const lowestPrice = prices.length ? Math.min(...prices) : "N/A";
  const highestPrice = prices.length ? Math.max(...prices) : "N/A";
  const minOrder = priceRanges[0]?.minQty || "N/A";
  const mainImage = product.mainImageUrl || "https://via.placeholder.com/300";
  const category = product.category || t("uncategorized");

  // ✅ Localized product name
  const getLocalizedProductName = () => {
    const name = product.productName;

    if (typeof name === "string") return name;
    if (typeof name === "object" && name !== null) {
      return (
        name[i18n.language] || name["en"] || t("product_card.unnamed_product")
      );
    }

    return t("product_card.unnamed_product");
  };

  const handleContactSupplier = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please log in to contact the supplier");
      return;
    }

    if (!product?.supplierId) {
      alert("Supplier ID is missing.");
      return;
    }

    const chatId = `${currentUser.uid}_${product.supplierId}_${product.id}`;

    navigate(`/product-chat/${chatId}`, {
      state: {
        productId: product.id,
        supplierId: product.supplierId,
      },
    });
  };

  return (
    <div className='p-2'>
      <div className='relative group bg-white border rounded-xl shadow hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden'>
        {/* Wishlist Icon */}
        <div className='absolute top-2 right-2 z-10'>
          <Heart size={16} className='text-red-500' />
        </div>

        {/* HOT Badge */}
        <div className='absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow z-10'>
          Hot
        </div>

        {/* Image */}
        <div
          className='relative aspect-[4/3] bg-white overflow-hidden border-b border-gray-200 cursor-pointer'
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <img
            src={mainImage}
            alt={getLocalizedProductName()}
            className='w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 opacity-0 animate-fade-in'
            loading='lazy'
            onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
          />
        </div>

        {/* Content */}
        <div className='flex flex-col p-4 flex-1 bg-white'>
          <div className='flex-1'>
            <p className='text-xs text-gray-400 mb-1 capitalize'>{category}</p>
            <h3
              onClick={() => navigate(`/product/${product.id}`)}
              className='text-sm font-semibold text-gray-800 leading-snug hover:text-[#2c6449] cursor-pointer line-clamp-2 capitalize'
            >
              {getLocalizedProductName()}
            </h3>
            <p className='text-xs text-gray-500 mt-1 mb-2'>
              Supplier:{" "}
              <span className='capitalize font-medium'>
                {product.supplierName || "Unknown"}
              </span>
            </p>

            {/* Price Range */}
            {!isNaN(lowestPrice) && !isNaN(highestPrice) && lowestPrice > 0 ? (
              <p className='text-lg font-bold mb-1 capitalize'>
                <Currency amount={lowestPrice} /> -{" "}
                <Currency amount={highestPrice} />
              </p>
            ) : (
              <p className='text-sm italic text-[#2c6449] mb-1'>
                {t("product_card.negotiable")}
              </p>
            )}

            <p className='text-xs text-gray-500 capitalize'>
              {t("product_card.min_order", { minOrder })}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className='flex gap-2 mt-4'>
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              className='w-1/2 text-xs py-1.5 px-2 border border-[#2c6449] text-[#2c6449] font-medium rounded hover:bg-[#2c644910] transition capitalize flex items-center justify-center gap-1 whitespace-nowrap'
            >
              <Eye size={14} />
              {t("product_card.view_details")}
            </button>
            <button
              onClick={handleContactSupplier}
              className='w-1/2 text-xs py-1.5 px-2 border border-blue-600 text-blue-600 font-medium rounded hover:bg-blue-50 transition capitalize flex items-center justify-center gap-1 whitespace-nowrap'
            >
              <Mail size={14} />
              {t("product_card.contact_supplier")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
