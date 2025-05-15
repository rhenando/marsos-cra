import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "supplier")
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuppliers(fetched);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = supplier.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesIndustry = industryFilter
      ? supplier.industry === industryFilter
      : true;
    return matchesSearch && matchesIndustry;
  });

  const industries = [
    ...new Set(suppliers.map((s) => s.industry).filter(Boolean)),
  ];

  return (
    <section className='max-w-6xl mx-auto px-6 py-12'>
      <h1 className='text-3xl font-bold text-[#2c6449] mb-4'>
        Verified Top Suppliers
      </h1>
      <p className='text-gray-600 mb-6 max-w-2xl'>
        Discover top-rated manufacturers and suppliers across the Kingdom of
        Saudi Arabia. All suppliers are verified for quality, communication, and
        operational excellence.
      </p>

      {/* Filters */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search suppliers...'
          className='w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm'
        />
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className='w-full md:w-1/4 px-4 py-2 border rounded-lg shadow-sm'
        >
          <option value=''>All Categories</option>
          {industries.map((ind, idx) => (
            <option key={idx} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Supplier Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className='border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition'
          >
            <div className='flex flex-col sm:flex-row items-start gap-4 mb-3'>
              {/* Avatar */}
              {supplier.logo ? (
                <img
                  src={supplier.logo}
                  alt={supplier.name}
                  className='w-14 h-14 rounded-full border border-gray-300 object-cover'
                />
              ) : (
                <div className='w-14 h-14 rounded-full bg-[#2c6449] flex items-center justify-center text-white font-semibold text-sm border border-gray-300'>
                  {supplier.name?.charAt(0).toUpperCase() || "S"}
                </div>
              )}

              {/* Info */}
              <div>
                <div className='flex items-center gap-2'>
                  <h2 className='font-semibold text-[#2c6449]'>
                    {supplier.name}
                  </h2>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      supplier.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  <span className='text-xs text-gray-500'>
                    {supplier.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
                <p className='text-xs text-gray-500'>{supplier.location}</p>
                <span className='text-xs bg-gray-100 text-[#2c6449] px-2 py-[2px] rounded-full mt-1 inline-block'>
                  {supplier.industry || "General"}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className='text-sm text-gray-700 mb-3'>{supplier.description}</p>

            {/* Buttons Row */}
            <div className='flex gap-2 flex-wrap justify-end'>
              <Link
                // to={`/supplier/${supplier.id}`}
                to={"/"}
                className='text-sm bg-[#2c6449] text-white px-3 py-1 rounded-full hover:bg-[#24523b] transition'
              >
                Contact Supplier
              </Link>
              <Link
                // to={`/supplier/${supplier.id}/products`}
                to={"/"}
                className='text-sm border border-[#2c6449] text-[#2c6449] px-3 py-1 rounded-full hover:bg-[#2c6449] hover:text-white transition'
              >
                View Products
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SuppliersPage;
