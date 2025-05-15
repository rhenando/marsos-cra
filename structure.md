# Project Structure

marsos-old-working
├── .firebase
│ └── hosting.YnVpbGQ.cache
├── public
│ ├── images
│ │ ├── boys.jpg
│ │ ├── girls.jpg
│ │ ├── hero1.jpg
│ │ ├── hero2.jpg
│ │ ├── logo.jpg
│ │ ├── midbanner.jpg
│ │ ├── noimage.png
│ │ └── pe.jpg
│ ├── locales
│ │ ├── ar
│ │ │ └── translation.json
│ │ └── en
│ │ └── translation.json
│ ├── old_photos
│ │ ├── banner-image.jpg
│ │ ├── banner.webp
│ │ ├── bricks.webp
│ │ ├── buildingcategory.jpg
│ │ ├── cement.webp
│ │ ├── coating.webp
│ │ ├── constructioncat.webp
│ │ ├── drilling.webp
│ │ ├── equipmentcategory.jpg
│ │ ├── Excavator.jpg
│ │ ├── noimage.png
│ │ ├── papercat.webp
│ │ ├── plastic-cup-1.jpg
│ │ ├── plastic-cup-2.jpg
│ │ ├── plastic-cup-3.jpg
│ │ ├── plastic-cup-4.jpg
│ │ ├── plastic-cup-5.jpg
│ │ ├── plastic-cup.jpg
│ │ ├── plasticcat.webp
│ │ ├── plasticcupcat.webp
│ │ ├── sa-flag.svg
│ │ ├── saudicategory1.jpg
│ │ ├── transportation.webp
│ │ ├── whitepapercat.webp
│ │ └── wood.webp
│ ├── favicon.ico
│ ├── index.html
│ ├── logo-header.svg
│ ├── logo-marsos.svg
│ ├── logo-white.png
│ ├── logo.png
│ ├── logo192.png
│ ├── logo512.png
│ ├── manifest.json
│ ├── robots.txt
│ ├── sand.webp
│ └── sitemap.xml
├── src
│ ├── assets
│ │ ├── payment
│ │ │ ├── applepay.png
│ │ │ ├── googlepay.jpeg
│ │ │ ├── mada.png
│ │ │ ├── master.png
│ │ │ ├── sadad.png
│ │ │ ├── tabby.png
│ │ │ ├── tamara.png
│ │ │ └── visa.png
│ │ ├── plasticandpapers
│ │ │ ├── papercups.webp
│ │ │ ├── plasticcups.webp
│ │ │ ├── plasticpackaging.webp
│ │ │ └── whitepaper.webp
│ │ ├── 1stbanner.png
│ │ ├── 2ndbanner.png
│ │ ├── 3rdbanner.png
│ │ ├── applepay.png
│ │ ├── construction.webp
│ │ ├── equipment.webp
│ │ ├── hero-background.png
│ │ ├── logo.png
│ │ ├── logo.svg
│ │ ├── mada.png
│ │ ├── mastercard.png
│ │ ├── plasticandpapers.webp
│ │ ├── sar_symbol.svg
│ │ ├── saudi_business_logo.svg
│ │ ├── saudimanufactured.webp
│ │ ├── tabby.png
│ │ ├── tabby.svg
│ │ ├── tamara.png
│ │ ├── tamara.svg
│ │ └── visa.png
│ ├── components
│ │ ├── admin
│ │ │ ├── AdminAddProducts.js
│ │ │ ├── AdminDashboard.js
│ │ │ ├── AdminEditProducts.js
│ │ │ ├── AdminLogin.js
│ │ │ ├── AdminMessages.js
│ │ │ ├── AdminProducts.js
│ │ │ ├── AdminSettings.js
│ │ │ ├── AdminSidebar.js
│ │ │ ├── AdminSuppliersAdd.js
│ │ │ ├── AdminTransactions.js
│ │ │ ├── BuyerList.js
│ │ │ ├── EditSupplier.js
│ │ │ └── Topbar.js
│ │ ├── buyer
│ │ │ ├── BuyerDashboard copy.js
│ │ │ ├── BuyerDashboard.js
│ │ │ ├── BuyerMessages.js
│ │ │ ├── BuyerProfile.js
│ │ │ └── BuyerRegistration.js
│ │ ├── cart
│ │ │ ├── CartPage copy.js
│ │ │ └── CartPage.js
│ │ ├── chat
│ │ │ ├── shared
│ │ │ │ └── ChatMessages.js
│ │ │ ├── CartChat.js
│ │ │ ├── CartDetails.js
│ │ │ ├── MiniProductDetails.js
│ │ │ ├── OrderChat.js
│ │ │ ├── ProductChat.js
│ │ │ ├── ProductDetails.js
│ │ │ ├── RfqChat.js
│ │ │ └── RFQDetails.js
│ │ ├── checkout
│ │ │ ├── CheckOutPage.js
│ │ │ ├── DeliveryAddress.js
│ │ │ ├── PaymentDetailsPage.js
│ │ │ ├── PaymentFailed.js
│ │ │ ├── PaymentForm.js
│ │ │ ├── PaymentSuccess.js
│ │ │ ├── ReviewInvoice.js
│ │ │ ├── SadadPayment.js
│ │ │ └── TermsAndConditions.js
│ │ ├── employee
│ │ │ └── EmployeeDashboard.js
│ │ ├── global
│ │ │ ├── AutocompleteInput.js
│ │ │ ├── CurrencySymbol.js
│ │ │ ├── DirectionWrapper.js
│ │ │ ├── LoadingSpinner.js
│ │ │ ├── MapSelectorModal.js
│ │ │ ├── MapView.js
│ │ │ ├── Notification.js
│ │ │ ├── OrderSummaryModal.js
│ │ │ ├── PrivacyPolicy.js
│ │ │ ├── ProductDetails copy.js
│ │ │ ├── ProductDetails.js
│ │ │ ├── ReviewOrderModal.js
│ │ │ ├── SecondaryNavbar.js
│ │ │ ├── TermsAndConditions.js
│ │ │ ├── UserLogin.js
│ │ │ └── UserMessages.js
│ │ ├── header
│ │ │ ├── Header.js
│ │ │ ├── LanguageSelector.js
│ │ │ ├── NavLinks.js
│ │ │ ├── ProductSearch.js
│ │ │ └── UserMenu.js
│ │ ├── mobile
│ │ │ ├── MobileDrawer.js
│ │ │ ├── MobileHeader.js
│ │ │ └── MobileHeroSection.js
│ │ ├── orders
│ │ │ └── OrdersPage.js
│ │ ├── otp
│ │ │ └── OtpInputGroup.js
│ │ ├── supplier
│ │ │ ├── ManageEmployees.js
│ │ │ ├── ManageProfiles.js
│ │ │ ├── ManageTerms.js
│ │ │ ├── SupplierAddProducts.js
│ │ │ ├── SupplierChatPage.js
│ │ │ ├── SupplierDashboard.js
│ │ │ ├── SupplierEditProducts.js
│ │ │ ├── SupplierMessages.js
│ │ │ ├── SupplierOrdersPage.js
│ │ │ ├── SupplierProducts.js
│ │ │ ├── SupplierProductsPage.js
│ │ │ ├── SupplierRegistration.js
│ │ │ └── SupplierRFQs.js
│ │ ├── FeaturedCategorySection.js
│ │ ├── Footer.js
│ │ ├── HeroSection.js
│ │ ├── Home.js
│ │ ├── Layout.js
│ │ ├── ProductCard.js
│ │ └── TrendingProductsSection.js
│ ├── constants
│ │ └── productOptions.js
│ ├── context
│ │ ├── AuthContext copy 2.js
│ │ ├── AuthContext copy.js
│ │ ├── AuthContext.js
│ │ ├── CartContext.js
│ │ └── NotificationContext.js
│ ├── firebase
│ │ ├── config.js
│ │ └── initAuth.js
│ ├── pages
│ │ ├── About.js
│ │ ├── BecomeSupplierForm.js
│ │ ├── Categories.js
│ │ ├── CategoryPage.js
│ │ ├── ConstructionSubcategories.js
│ │ ├── Contact.js
│ │ ├── EmployeeLoginPage.js
│ │ ├── EquipmentSubcategories.js
│ │ ├── HelpCenter.jsx
│ │ ├── NotFound.js
│ │ ├── PlasticAndPapersSubcategories.js
│ │ ├── Products.js
│ │ ├── Register.js
│ │ ├── RfqPage.js
│ │ ├── RfqPage.md
│ │ ├── SaudiManufacturedSubcategories.js
│ │ ├── ShippingAddress.js
│ │ ├── Shop.js
│ │ ├── SuppliersPage.jsx
│ │ ├── SupplierSuccess.jsx
│ │ ├── UpdatedPrivacyPolicy.js
│ │ └── UpdatedTermsAndConditions.js
│ ├── styles
│ │ └── global.css
│ ├── utils
│ │ ├── constants.js
│ │ ├── firestore.js
│ │ ├── gopayApi.js
│ │ ├── PrivateRoute.js
│ │ ├── Roles.js
│ │ ├── sendWhatsApp.js
│ │ ├── toastUtils.js
│ │ └── translate.js
│ ├── App.js
│ ├── i18n.js
│ ├── index.js
│ └── routes.js
├── .firebaserc
├── .gitignore
├── firebase-debug.log
├── firebase.json
├── generate-sitemap.js
├── package-lock.json
├── package.json
├── postcss.config.js
└── tailwind.config.js
