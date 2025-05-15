import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { Search, Camera } from "react-feather";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase/config";
import { getDocs, collection } from "firebase/firestore";

const ProductSearch = () => {
  const [productQuery, setProductQuery] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  // Normalize text
  const normalize = (str) => {
    if (typeof str !== "string") return "";
    return str.toLocaleLowerCase().normalize("NFKD");
  };

  const filteredProducts =
    productQuery === ""
      ? productOptions
      : productOptions.filter((item) =>
          normalize(item.name).includes(normalize(productQuery))
        );

  // Fetch products based on language
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const name =
          i18n.language === "ar"
            ? data.productName_ar || data.productName || data.productName_en
            : data.productName_en || data.productName || data.productName_ar;

        return {
          id: doc.id,
          name:
            typeof name === "string" ? name : String(name || "Unnamed Product"),
        };
      });

      setProductOptions(items);
      setSelectedProduct(null); // Reset selection on language switch
    };

    fetchProducts();
  }, [i18n.language]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    if (product?.id) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div dir={i18n.language} className='relative w-[50%]'>
      <Combobox
        value={selectedProduct}
        onChange={handleProductSelect}
        as='div'
        className='w-full'
      >
        {/* Input + icons */}
        <div className='relative flex items-center w-full bg-white border border-[#2c6449] rounded-full overflow-hidden'>
          <Combobox.Input
            className='w-full h-10 px-4 text-sm text-[#2c6449] placeholder-[#2c6449] bg-transparent outline-none focus:ring-0 text-start rtl:text-end'
            displayValue={(item) => item?.name || ""}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder={t("header.searchPlaceholder")}
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
          />

          <div className='h-10 w-10 flex items-center justify-center'>
            <Camera size={16} className='text-[#2c6449]' />
          </div>

          <button
            type='submit'
            className='h-10 w-10 flex items-center justify-center bg-[#2c6449] text-white rtl:rounded-l-full rtl:rounded-r-none rounded-r-full hover:opacity-90 transition-all duration-200'
          >
            <Search size={16} />
          </button>
        </div>

        {/* Dropdown options */}
        {filteredProducts.length > 0 && (
          <Combobox.Options className='absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded z-50 text-sm text-[#2c6449] max-h-60 overflow-auto transition-all duration-150'>
            {filteredProducts.map((product) => (
              <Combobox.Option
                key={product.id}
                value={product}
                className={({ active }) =>
                  `px-4 py-2 cursor-pointer transition-colors ${
                    active ? "bg-[#2c6449] text-white" : "hover:bg-gray-100"
                  }`
                }
              >
                {product.name}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}

        {/* No results */}
        {productQuery.length > 0 && filteredProducts.length === 0 && (
          <div className='absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded z-50 px-4 py-2 text-sm text-gray-400'>
            {t("header.noResults")}
          </div>
        )}
      </Combobox>
    </div>
  );
};

export default ProductSearch;
