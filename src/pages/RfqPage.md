import React, { useState, useEffect } from "react";
import Select from "react-select/creatable";
import { db, storage } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

// List of all countries
const countryOptions = [
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
  { value: "Argentina", label: "Argentina" },
  { value: "Armenia", label: "Armenia" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Barbados", label: "Barbados" },
  { value: "Belarus", label: "Belarus" },
  { value: "Belgium", label: "Belgium" },
  { value: "Belize", label: "Belize" },
  { value: "Benin", label: "Benin" },
  { value: "Bhutan", label: "Bhutan" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
  { value: "Botswana", label: "Botswana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Brunei", label: "Brunei" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cabo Verde", label: "Cabo Verde" },
  { value: "Cambodia", label: "Cambodia" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Canada", label: "Canada" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Chad", label: "Chad" },
  { value: "Chile", label: "Chile" },
  { value: "China", label: "China" },
  { value: "Colombia", label: "Colombia" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo (Congo-Brazzaville)", label: "Congo (Congo-Brazzaville)" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Croatia", label: "Croatia" },
  { value: "Cuba", label: "Cuba" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Czechia (Czech Republic)", label: "Czechia (Czech Republic)" },
  {
    value: "Democratic Republic of the Congo",
    label: "Democratic Republic of the Congo",
  },
  { value: "Denmark", label: "Denmark" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Dominica", label: "Dominica" },
  { value: "Dominican Republic", label: "Dominican Republic" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egypt", label: "Egypt" },
  { value: "El Salvador", label: "El Salvador" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Estonia", label: "Estonia" },
  {
    value: "Eswatini (fmr. 'Swaziland')",
    label: "Eswatini (fmr. 'Swaziland')",
  },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Fiji", label: "Fiji" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Germany", label: "Germany" },
  { value: "Ghana", label: "Ghana" },
  { value: "Greece", label: "Greece" },
  { value: "Grenada", label: "Grenada" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guinea-Bissau", label: "Guinea-Bissau" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haiti", label: "Haiti" },
  { value: "Holy See", label: "Holy See" },
  { value: "Honduras", label: "Honduras" },
  { value: "Hungary", label: "Hungary" },
  { value: "Iceland", label: "Iceland" },
  { value: "India", label: "India" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Iran", label: "Iran" },
  { value: "Iraq", label: "Iraq" },
  { value: "Ireland", label: "Ireland" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Japan", label: "Japan" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kazakhstan", label: "Kazakhstan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Kiribati", label: "Kiribati" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Kyrgyzstan", label: "Kyrgyzstan" },
  { value: "Laos", label: "Laos" },
  { value: "Latvia", label: "Latvia" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libya", label: "Libya" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malawi", label: "Malawi" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Maldives", label: "Maldives" },
  { value: "Mali", label: "Mali" },
  { value: "Malta", label: "Malta" },
  { value: "Marshall Islands", label: "Marshall Islands" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Mexico", label: "Mexico" },
  { value: "Micronesia", label: "Micronesia" },
  { value: "Moldova", label: "Moldova" },
  { value: "Monaco", label: "Monaco" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Myanmar (formerly Burma)", label: "Myanmar (formerly Burma)" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nauru", label: "Nauru" },
  { value: "Nepal", label: "Nepal" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Niger", label: "Niger" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "North Korea", label: "North Korea" },
  { value: "North Macedonia", label: "North Macedonia" },
  { value: "Norway", label: "Norway" },
  { value: "Oman", label: "Oman" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Palau", label: "Palau" },
  { value: "Palestine State", label: "Palestine State" },
  { value: "Panama", label: "Panama" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Philippines", label: "Philippines" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Qatar", label: "Qatar" },
  { value: "Romania", label: "Romania" },
  { value: "Russia", label: "Russia" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
  { value: "Saint Lucia", label: "Saint Lucia" },
  {
    value: "Saint Vincent and the Grenadines",
    label: "Saint Vincent and the Grenadines",
  },
  { value: "Samoa", label: "Samoa" },
  { value: "San Marino", label: "San Marino" },
  { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Senegal", label: "Senegal" },
  { value: "Serbia", label: "Serbia" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Singapore", label: "Singapore" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Solomon Islands", label: "Solomon Islands" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  { value: "South Korea", label: "South Korea" },
  { value: "South Sudan", label: "South Sudan" },
  { value: "Spain", label: "Spain" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Sudan", label: "Sudan" },
  { value: "Suriname", label: "Suriname" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Syria", label: "Syria" },
  { value: "Tajikistan", label: "Tajikistan" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Thailand", label: "Thailand" },
  { value: "Timor-Leste", label: "Timor-Leste" },
  { value: "Togo", label: "Togo" },
  { value: "Tonga", label: "Tonga" },
  { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Turkey", label: "Turkey" },
  { value: "Turkmenistan", label: "Turkmenistan" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Uganda", label: "Uganda" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States of America", label: "United States of America" },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Uzbekistan", label: "Uzbekistan" },
  { value: "Vanuatu", label: "Vanuatu" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Yemen", label: "Yemen" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
];

const RfqModal = ({ show, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [productDetails, setProductDetails] = useState("");
  const [shareBusinessCard, setShareBusinessCard] = useState(false);
  const [errors, setErrors] = useState({});
  const [categorySuppliers, setCategorySuppliers] = useState({});

  // New state hooks for Size, Color, and Shipping (defaulting to Saudi Arabia)
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [shipping, setShipping] = useState({
    value: "Saudi Arabia",
    label: "Saudi Arabia",
  });

  const [file, setFile] = useState(null); // State for file selection
  const [uploading, setUploading] = useState(false); // State for tracking upload progress

  const handleFileUpload = async () => {
    if (!file) return null; // If no file is selected, return null

    setUploading(true); // Set uploading state to true while uploading

    // Create a reference to Firebase Storage
    const storageRef = ref(
      storage,
      `rfq_files/${currentUser.uid}/${file.name}`
    );

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Show upload progress (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle any errors
          console.error("Upload failed", error);
          setUploading(false);
          reject(error);
        },
        async () => {
          // Get the download URL when upload is complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);
          setUploading(false);
          resolve(downloadURL);
        }
      );
    });
  };

  // ✅ Fetch product categories with multiple suppliers from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const categoryMap = {};
        const categoryList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category && data.supplierName && data.supplierId) {
            if (!categoryList.find((c) => c.value === data.category)) {
              categoryList.push({ value: data.category, label: data.category });
            }
            if (!categoryMap[data.category]) {
              categoryMap[data.category] = new Map();
            }
            categoryMap[data.category].set(data.supplierId, {
              supplierName: data.supplierName,
              supplierId: data.supplierId,
            });
          }
        });

        const cleanedCategorySuppliers = {};
        Object.keys(categoryMap).forEach((category) => {
          cleanedCategorySuppliers[category] = Array.from(
            categoryMap[category].values()
          );
        });

        setCategories(categoryList);
        setCategorySuppliers(cleanedCategorySuppliers);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (newValue) => {
    setSelectedCategory(newValue);
    setSelectedSubcategory(null);
    if (newValue && categorySuppliers[newValue.value]) {
      console.log(`Selected Category: ${newValue.label}`);
      categorySuppliers[newValue.value].forEach((supplier, index) => {
        console.log(`#${index + 1} Supplier Name: ${supplier.supplierName}`);
        console.log(`   Supplier ID: ${supplier.supplierId}`);
      });
    }
  };

  const handleSubcategoryChange = (newValue) => {
    setSelectedSubcategory(newValue);
  };

  const handleCreateSubcategory = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setSubcategoryOptions([...subcategoryOptions, newOption]);
    setSelectedSubcategory(newOption);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to submit an RFQ.");
      return;
    }

    if (uploading) {
      alert("Please wait for the file to finish uploading before submitting.");
      return;
    }

    const buyerId = currentUser?.uid;
    let fileURL = null;

    if (file) {
      try {
        fileURL = await handleFileUpload();
      } catch (error) {
        console.error("File upload error:", error);
        alert("File upload failed. Please try again.");
        return;
      }
    }

    try {
      // ✅ Fetch user role from Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User not found.");
        return;
      }

      const userData = userSnap.data();
      const userRole = userData.role || "buyer"; // Default to buyer if role is not found

      const selectedCategoryName = selectedCategory?.value || "";
      const selectedSubcategoryName = selectedSubcategory?.value || "";
      const suppliers = categorySuppliers[selectedCategoryName] || [];

      if (suppliers.length === 0) {
        alert("No suppliers found for the selected category.");
        return;
      }

      let createdChats = [];

      // ✅ Create RFQs and Corresponding Chats
      const rfqPromises = suppliers.map(async (supplier) => {
        // ✅ Step 1: Create RFQ in Firestore
        const docRef = await addDoc(collection(db, "rfqs"), {
          buyerId,
          category: selectedCategoryName,
          subcategory: selectedSubcategoryName,
          productDetails,
          fileURL,
          size,
          color,
          shipping: shipping.label,
          shareBusinessCard,
          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName,
          timestamp: new Date(),
        });

        // ✅ Step 2: Generate Chat ID
        const chatId = `chat_${buyerId}_${supplier.supplierId}`;

        // ✅ Step 3: Check if Chat Already Exists
        const chatRef = doc(db, "rfqChats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
          // ✅ Step 4: Create a New Chat Room if It Doesn't Exist
          await setDoc(chatRef, {
            chatId,
            buyerId,
            supplierId: supplier.supplierId,
            supplierName: supplier.supplierName,
            messages: [],
            createdAt: new Date(),
            rfqId: docRef.id, // ✅ Links RFQ to the Chat
          });

          createdChats.push({
            chatId,
            supplierId: supplier.supplierId,
            supplierName: supplier.supplierName,
          });
        }
      });

      await Promise.all(rfqPromises);

      alert("RFQs and Chat Rooms Created Successfully!");

      // ✅ Reset Fields
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSubcategoryOptions([]);
      setProductDetails("");
      setSize("");
      setColor("");
      setShipping({ value: "Saudi Arabia", label: "Saudi Arabia" });
      setFile(null);
      setShareBusinessCard(false);
      setErrors({});
      setUploading(false);

      onClose();

      // ✅ Conditional Redirect
      if (userRole === "buyer") {
        navigate("/buyer-dashboard");
      } else if (userRole === "supplier") {
        navigate("/supplier-dashboard");
      } else {
        navigate("/"); // Fallback route
      }
    } catch (error) {
      console.error("Error submitting RFQs:", error);
      alert("Failed to submit RFQs. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <div className='modal fade show d-block' tabIndex='-1' role='dialog'>
      <div
        className='modal-dialog modal-dialog-centered modal-lg'
        role='document'
      >
        <div className='modal-content p-3'>
          <div className='modal-header'>
            <h5 className='modal-title' style={{ fontSize: "1rem" }}>
              Request for Quotation
            </h5>
            <button
              type='button'
              className='btn-close'
              onClick={onClose}
            ></button>
          </div>
          <div className='modal-body'>
            <form onSubmit={handleSubmit}>
              {/* Product Category & Subcategory */}
              <div className='row'>
                <div className='col-sm-12 col-md-6 mb-2'>
                  <label className='form-label fw-bold small'>
                    Product Category *
                  </label>
                  <Select
                    options={categories}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    isClearable
                    placeholder='Select category...'
                  />
                  {errors.selectedCategory && (
                    <small className='text-danger'>
                      {errors.selectedCategory}
                    </small>
                  )}
                </div>
                <div className='col-sm-12 col-md-6 mb-2'>
                  <label className='form-label fw-bold small'>
                    Product 111Subcategory *
                  </label>
                  <Select
                    options={subcategoryOptions}
                    value={selectedSubcategory}
                    onChange={handleSubcategoryChange}
                    onCreateOption={handleCreateSubcategory}
                    isClearable
                    placeholder='Select or create subcategory...'
                  />
                  {errors.selectedSubcategory && (
                    <small className='text-danger'>
                      {errors.selectedSubcategory}
                    </small>
                  )}
                </div>
              </div>

              {/* New Row for Size, Color, Shipping */}
              <div className='row'>
                <div className='col-sm-12 col-md-4 mb-2'>
                  <label className='form-label fw-bold small'>Size</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Enter size'
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </div>
                <div className='col-sm-12 col-md-4 mb-2'>
                  <label className='form-label fw-bold small'>Color</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Enter color'
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                <div className='col-sm-12 col-md-4 mb-2'>
                  <label className='form-label fw-bold small'>
                    Shipping To
                  </label>
                  <Select
                    options={countryOptions}
                    value={shipping}
                    onChange={(newValue) => setShipping(newValue)}
                    placeholder='Select shipping country...'
                  />
                </div>
              </div>

              {errors.supplierError && (
                <div className='alert alert-danger small mt-2'>
                  {errors.supplierError}
                </div>
              )}

              <div className='mb-2'>
                <label className='form-label fw-bold small'>
                  Detailed Product Requirements *
                </label>
                <textarea
                  className='form-control'
                  rows='3'
                  placeholder='Enter details'
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  style={{ fontSize: "0.875rem" }}
                />
                {errors.productDetails && (
                  <small className='text-danger'>{errors.productDetails}</small>
                )}
              </div>
              <div className='mb-2'>
                <label className='form-label fw-bold small'>
                  Upload File *
                </label>
                <input
                  type='file'
                  className='form-control'
                  onChange={(e) => setFile(e.target.files[0])} // ✅ Updates file state
                  accept='.jpg,.png,.pdf,.docx'
                />
                {uploading && (
                  <small className='text-primary'>Uploading...</small>
                )}
              </div>

              <div className='mb-2 form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  id='shareBusinessCard'
                  checked={shareBusinessCard}
                  onChange={() => setShareBusinessCard(!shareBusinessCard)}
                />
                <label
                  className='form-check-label small'
                  htmlFor='shareBusinessCard'
                >
                  I agree to share my business card with suppliers providing
                  quotes
                </label>
              </div>

              <button
                type='submit'
                className='btn text-white fw-bold px-3 py-2 small'
                disabled={uploading} // ✅ Prevents submission during file upload
                style={{ backgroundColor: "#2c6449", borderColor: "#2c6449" }}
              >
                {uploading ? "Uploading..." : "Submit RFQ"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RfqModal;
