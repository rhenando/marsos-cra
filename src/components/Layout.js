import React from "react";
import Header from "../components/header/Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <main className='min-h-screen lg:pt-[40px]'>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
