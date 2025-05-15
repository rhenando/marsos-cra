import React from "react";
import ProductCard from "../components/ProductCard";

const products = [
  {
    id: 1,
    name: "Classic White Blouse",
    price: "499",
    image: "/images/noimage.png",
  },
  {
    id: 2,
    name: "School Polo Shirt",
    price: "450",
    image: "/images/noimage.png",
  },
  {
    id: 3,
    name: "PE Jogger Pants",
    price: "390",
    image: "/images/noimage.png",
  },
  {
    id: 4,
    name: "Embroidered Patch",
    price: "99",
    image: "/images/noimage.png",
  },
];

function Shop() {
  return (
    <section className='px-6 py-16 bg-gray-50'>
      <div className='max-w-6xl mx-auto text-center mb-10'>
        <h2 className='text-3xl md:text-4xl font-serif text-gray-800 mb-2'>
          Shop All Products
        </h2>
        <p className='text-gray-600 text-sm'>
          Tailored garments for every need
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default Shop;
