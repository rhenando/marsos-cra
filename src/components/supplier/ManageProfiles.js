// src/components/supplier/ManageProfiles.js

import { Fragment, useEffect, useState, useCallback } from "react";
import { Disclosure } from "@headlessui/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function ManageProfiles() {
  const { currentUser } = useAuth();
  const storage = getStorage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    companyDescription: "",
    address: "",
    crNumber: "",
    vatNumber: "",
    logoUrl: "",
    pdfUrl: "",
    bankDetails: [],
  });
  const [errors, setErrors] = useState({});

  // Fetch profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setError("No user is logged in.");
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (!snap.exists()) {
          setError("Profile not found.");
        } else {
          const data = snap.data();
          setProfile({ id: snap.id, ...data });
          setFormData({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "",
            companyDescription: data.companyDescription || "",
            address: data.address || "",
            crNumber: data.crNumber || "",
            vatNumber: data.vatNumber || "",
            logoUrl: data.logoUrl || "",
            pdfUrl: data.pdfUrl || "",
            bankDetails: Array.isArray(data.bankDetails)
              ? data.bankDetails
              : [],
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [currentUser]);

  // Validation stub
  const validateField = (name, value) => {
    let msg = "";
    if (name === "name" && !value.trim()) {
      msg = "Name is required.";
    }
    setErrors((e) => ({ ...e, [name]: msg }));
  };

  // Handlers
  const handleEditToggle = () => setIsEditing((v) => !v);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
  };
  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  const handleBankInputChange = (e, idx, field) => {
    const arr = [...formData.bankDetails];
    arr[idx][field] = e.target.value;
    setFormData((fd) => ({ ...fd, bankDetails: arr }));
  };
  const handleAddBankDetail = () =>
    setFormData((fd) => ({
      ...fd,
      bankDetails: [
        ...fd.bankDetails,
        { bankName: "", accountName: "", accountNumber: "" },
      ],
    }));
  const handleRemoveBankDetail = (idx) => {
    const arr = [...formData.bankDetails];
    arr.splice(idx, 1);
    setFormData((fd) => ({ ...fd, bankDetails: arr }));
  };

  // Upload helper
  const uploadFile = useCallback(
    (filePath, file, callback) => {
      const storageRef = ref(storage, filePath);
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        "state_changed",
        (snapshot) => {
          setUploadProgress(
            Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          );
        },
        (err) => {
          console.error(err);
          setError("Upload failed.");
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          callback(url);
          setUploadProgress(0);
        }
      );
    },
    [storage]
  );

  const handleLogoUpload = (file) => {
    if (!file) return;
    uploadFile(`logos/${currentUser.uid}/${file.name}`, file, (url) =>
      setFormData((fd) => ({ ...fd, logoUrl: url }))
    );
  };

  const handlePdfUpload = (file) => {
    if (!file) return;
    uploadFile(`brochures/${currentUser.uid}/${file.name}`, file, (url) =>
      setFormData((fd) => ({ ...fd, pdfUrl: url }))
    );
  };

  const handleSave = async () => {
    if (!currentUser) {
      setError("No user is logged in.");
      return;
    }
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        ...formData,
        bankDetails: formData.bankDetails,
      });
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  };

  // Render
  if (loading) {
    return (
      <div className='p-6 max-w-xl mx-auto'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 rounded w-1/3' />
          <div className='h-4 bg-gray-200 rounded' />
          <div className='h-4 bg-gray-200 rounded w-2/3' />
        </div>
      </div>
    );
  }
  if (error) {
    return <p className='p-6 text-red-600'>{error}</p>;
  }

  return (
    <div className='p-6 max-w-3xl mx-auto space-y-6'>
      <h1 className='text-2xl font-bold text-green-600'>Manage Profile</h1>

      {profile ? (
        <Fragment>
          {!isEditing && (
            <button
              onClick={handleEditToggle}
              className='mb-4 bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2'
            >
              Edit Profile
            </button>
          )}

          {/* ACCOUNT INFO */}
          <Disclosure as='section' defaultOpen>
            <Disclosure.Button className='w-full text-left bg-gray-100 px-4 py-2 rounded'>
              <span className='font-semibold'>Account Information</span>
            </Disclosure.Button>
            <Disclosure.Panel className='p-4 border rounded space-y-4'>
              {["name", "email", "role"].map((f) => (
                <div key={f}>
                  <label className='block font-medium mb-1'>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </label>
                  {isEditing ? (
                    <input
                      type={f === "email" ? "email" : "text"}
                      name={f}
                      value={formData[f]}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`border rounded p-2 w-full ${
                        errors[f] ? "border-red-500" : ""
                      }`}
                    />
                  ) : (
                    <p>{profile[f] || "-"}</p>
                  )}
                  {errors[f] && (
                    <p className='text-red-500 text-sm'>{errors[f]}</p>
                  )}
                </div>
              ))}
            </Disclosure.Panel>
          </Disclosure>

          {/* COMPANY DETAILS */}
          <Disclosure as='section'>
            <Disclosure.Button className='w-full text-left bg-gray-100 px-4 py-2 rounded'>
              <span className='font-semibold'>Company Details</span>
            </Disclosure.Button>
            <Disclosure.Panel className='p-4 border rounded space-y-4'>
              {[
                { key: "address", type: "text" },
                { key: "crNumber", type: "text" },
                { key: "vatNumber", type: "text" },
              ].map(({ key, type }) => (
                <div key={key}>
                  <label className='block font-medium mb-1'>
                    {key === "crNumber"
                      ? "CR Number"
                      : key === "vatNumber"
                      ? "VAT Number"
                      : "Address"}
                  </label>
                  {isEditing ? (
                    <input
                      type={type}
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      className='border rounded p-2 w-full'
                    />
                  ) : (
                    <p>{profile[key] || "-"}</p>
                  )}
                </div>
              ))}
              <div>
                <label className='block font-medium mb-1'>
                  Company Description
                </label>
                {isEditing ? (
                  <textarea
                    name='companyDescription'
                    rows='4'
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    className='border rounded p-2 w-full'
                  />
                ) : (
                  <p>{profile.companyDescription || "-"}</p>
                )}
              </div>
            </Disclosure.Panel>
          </Disclosure>

          {/* BANK DETAILS */}
          <Disclosure as='section'>
            <Disclosure.Button className='w-full text-left bg-gray-100 px-4 py-2 rounded'>
              <span className='font-semibold'>Bank Details</span>
            </Disclosure.Button>
            <Disclosure.Panel className='p-4 border rounded space-y-4'>
              {isEditing ? (
                <div className='space-y-4'>
                  {formData.bankDetails.map((bank, idx) => (
                    <div key={idx} className='border p-4 rounded relative'>
                      <button
                        type='button'
                        onClick={() => handleRemoveBankDetail(idx)}
                        className='absolute top-2 right-2 text-red-500'
                      >
                        ×
                      </button>
                      {["bankName", "accountName", "accountNumber"].map(
                        (field) => (
                          <div key={field} className='mb-2'>
                            <label className='block font-medium mb-1'>
                              {field === "bankName"
                                ? "Bank Name"
                                : field === "accountName"
                                ? "Account Name"
                                : "Account Number"}
                            </label>
                            <input
                              type='text'
                              value={bank[field]}
                              onChange={(e) =>
                                handleBankInputChange(e, idx, field)
                              }
                              className='border rounded p-2 w-full'
                            />
                          </div>
                        )
                      )}
                      <div>
                        <label className='block font-medium mb-1'>
                          Bank File (PDF)
                        </label>
                        <input
                          type='file'
                          accept='application/pdf'
                          onChange={(e) =>
                            uploadFile(
                              `bank_details/${currentUser.uid}/${e.target.files[0].name}`,
                              e.target.files[0],
                              (url) => {
                                const arr = [...formData.bankDetails];
                                arr[idx].fileUrl = url;
                                setFormData((fd) => ({
                                  ...fd,
                                  bankDetails: arr,
                                }));
                              }
                            )
                          }
                          className='mb-2'
                        />
                        {bank.fileUrl && (
                          <a
                            href={bank.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 underline'
                          >
                            View File
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={handleAddBankDetail}
                    className='bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2'
                  >
                    Add Bank Detail
                  </button>
                </div>
              ) : profile.bankDetails.length ? (
                <div className='space-y-4'>
                  {profile.bankDetails.map((bank, idx) => (
                    <div key={idx} className='border p-4 rounded'>
                      <p>
                        <strong>Bank Name:</strong> {bank.bankName}
                      </p>
                      <p>
                        <strong>Account Name:</strong> {bank.accountName}
                      </p>
                      <p>
                        <strong>Account Number:</strong> {bank.accountNumber}
                      </p>
                      <p>
                        <strong>Bank File:</strong>{" "}
                        {bank.fileUrl ? (
                          <a
                            href={bank.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 underline'
                          >
                            View File
                          </a>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No bank details added.</p>
              )}
            </Disclosure.Panel>
          </Disclosure>

          {/* BRAND ASSETS */}
          <Disclosure as='section'>
            <Disclosure.Button className='w-full text-left bg-gray-100 px-4 py-2 rounded'>
              <span className='font-semibold'>Brand Assets</span>
            </Disclosure.Button>
            <Disclosure.Panel className='p-4 border rounded space-y-4'>
              {/* Logo */}
              <div>
                <label className='block font-medium mb-1'>Logo</label>
                {profile.logoUrl && !isEditing && (
                  <img
                    src={profile.logoUrl}
                    alt='Logo'
                    className='max-h-32 mb-2'
                  />
                )}
                {isEditing && (
                  <>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => handleLogoUpload(e.target.files[0])}
                      className='border rounded p-2 w-full'
                    />
                    {uploadProgress > 0 && (
                      <progress
                        value={uploadProgress}
                        max='100'
                        className='w-full mt-2'
                      />
                    )}
                  </>
                )}
              </div>

              {/* Brochure PDF */}
              <div>
                <label className='block font-medium mb-1'>Brochure (PDF)</label>
                {profile.pdfUrl && !isEditing && (
                  <a
                    href={profile.pdfUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline mb-2 block'
                  >
                    View Brochure
                  </a>
                )}
                {isEditing && (
                  <>
                    <input
                      type='file'
                      accept='application/pdf'
                      onChange={(e) => handlePdfUpload(e.target.files[0])}
                      className='border rounded p-2 w-full'
                    />
                    {uploadProgress > 0 && (
                      <progress
                        value={uploadProgress}
                        max='100'
                        className='w-full mt-2'
                      />
                    )}
                  </>
                )}
              </div>
            </Disclosure.Panel>
          </Disclosure>

          {/* Save / Cancel */}
          {isEditing && (
            <div className='flex justify-end space-x-4'>
              <button
                onClick={handleSave}
                className='bg-green-600 hover:bg-green-700 text-white rounded px-6 py-2'
              >
                Save
              </button>
              <button
                onClick={handleEditToggle}
                className='bg-gray-300 hover:bg-gray-400 rounded px-6 py-2'
              >
                Cancel
              </button>
            </div>
          )}
        </Fragment>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
}
