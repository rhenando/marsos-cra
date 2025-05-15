import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/config";
import Currency from "../global/CurrencySymbol";
import { useTranslation } from "react-i18next";

const MiniProductDetails = ({ productId, supplierId }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const isSupplier = currentUser?.uid === supplierId;
  const [buyerSubtotal, setBuyerSubtotal] = useState(0);
  const [buyerShipping, setBuyerShipping] = useState(0);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageColor, setCartMessageColor] = useState("");
  const { t } = useTranslation();

  const getMatchedPriceTier = () => {
    const qty = parseInt(quantity || "0", 10);
    if (!product?.priceRanges?.length || isNaN(qty)) return null;
    const sorted = [...product.priceRanges].sort((a, b) => a.minQty - b.minQty);
    return sorted.find((tier) => {
      const max = tier.maxQty?.toString().toLowerCase();
      return !tier.maxQty || max === "unlimited"
        ? qty >= tier.minQty
        : qty >= tier.minQty && qty <= parseInt(tier.maxQty);
    });
  };

  const getShippingCost = () => {
    const loc = deliveryLocation.trim().toLowerCase();
    for (const tier of product?.priceRanges || []) {
      const match = tier.locations?.find(
        (l) => l.location?.toLowerCase().trim() === loc
      );
      if (match) return match.locationPrice ?? 0;
    }
    return 0;
  };

  const pricePerUnit = parseFloat(getMatchedPriceTier()?.price || 0);
  const shippingCost = getShippingCost();
  const qty = parseInt(quantity || "0", 10);
  const subtotal =
    !isNaN(pricePerUnit) && !isNaN(qty) && qty > 0 ? pricePerUnit * qty : 0;
  const safeShipping = isNaN(shippingCost) ? 0 : shippingCost;

  useEffect(() => {
    const ref = doc(db, "miniProductsData", productId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProduct(data);
        if (isSupplier) {
          setBuyerSubtotal(data.buyerSubtotal || 0);
          setBuyerShipping(data.buyerShipping || 0);
        }
      }
    });
    return () => unsub();
  }, [productId, isSupplier]);

  useEffect(() => {
    if (!productId || isSupplier) return;
    const ref = doc(db, "miniProductsData", productId);
    updateDoc(ref, {
      buyerSubtotal: subtotal,
      buyerShipping: safeShipping,
    }).catch(console.warn);
  }, [subtotal, safeShipping, productId, isSupplier]);

  const isInvalid = () => {
    const tier = getMatchedPriceTier();
    return (
      !selectedColor ||
      !selectedSize ||
      !deliveryLocation ||
      isNaN(qty) ||
      qty <= 0 ||
      !tier ||
      isNaN(tier.price) ||
      tier.price <= 0 ||
      isNaN(shippingCost)
    );
  };

  const handleAddToCart = async () => {
    if (!currentUser || isInvalid()) return;
    const ref = doc(db, "carts", currentUser.uid);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? snap.data().items || [] : [];
    const exists = existing.some(
      (item) =>
        item.productId === productId &&
        item.color === selectedColor &&
        item.size === selectedSize &&
        item.deliveryLocation === deliveryLocation
    );
    if (exists) {
      setCartMessage(t("product_chats.productAlreadyInCart"));
      setCartMessageColor("text-red-500");
      return;
    }

    const newItem = {
      productId,
      name: product.productName,
      mainImageUrl: product.mainImageUrl,
      price: pricePerUnit,
      quantity: qty,
      color: selectedColor,
      size: selectedSize,
      shippingCost,
      deliveryLocation,
      supplierId,
      addedAt: Timestamp.now(),
      buyerId: currentUser.uid,
    };

    try {
      const data = {
        buyerId: currentUser.uid,
        updatedAt: serverTimestamp(),
        ...(snap.exists()
          ? { items: [...existing, newItem] }
          : { items: [newItem], createdAt: serverTimestamp() }),
      };
      await setDoc(ref, data, { merge: true });
      setCartMessage(t("product_chats.productAddedToCart"));
      setCartMessageColor("text-green-600");
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  if (!product) return <p className='text-sm'>Loading product info...</p>;

  return (
    <div className='border rounded p-4 bg-white shadow-sm space-y-4 text-sm'>
      <div className='space-y-2'>
        <h5 className='text-base font-semibold'>{product.productName}</h5>
        <img
          src={product.mainImageUrl || "https://via.placeholder.com/150"}
          alt={product.productName}
          className='w-28 rounded'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <h6 className='font-medium mb-2'>{t("product_chats.priceTiers")}</h6>
          {(product.priceRanges || []).map((tier, i) => (
            <div key={i} className='flex items-center gap-2 mb-1'>
              <span>
                {tier.minQty} - {tier.maxQty || "Unlimited"} Pc/s:
              </span>

              {isSupplier ? (
                <input
                  type='number'
                  value={tier.price}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNaN(val)) return;
                    const updated = [...product.priceRanges];
                    updated[i].price = val;
                    updateDoc(doc(db, "miniProductsData", productId), {
                      priceRanges: updated,
                    });
                    setProduct({ ...product, priceRanges: updated });
                  }}
                  className='w-24 border px-2 py-1 rounded'
                />
              ) : (
                <Currency amount={tier.price} />
              )}
            </div>
          ))}
        </div>

        <div>
          <h6 className='font-medium mb-2'>
            {t("product_chats.shippingPrices")}
          </h6>
          {(product.priceRanges || []).flatMap((tier, i) =>
            (tier.locations || []).map((loc, j) => (
              <div key={`${i}-${j}`} className='flex items-center gap-2 mb-1'>
                <span>{loc.location}:</span>

                {isSupplier ? (
                  <input
                    type='number'
                    value={loc.locationPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (isNaN(val)) return;
                      const updated = [...product.priceRanges];
                      updated[i].locations[j].locationPrice = val;
                      updateDoc(doc(db, "miniProductsData", productId), {
                        priceRanges: updated,
                      });
                      setProduct({ ...product, priceRanges: updated });
                    }}
                    className='w-24 border px-2 py-1 rounded'
                  />
                ) : (
                  <Currency amount={loc.locationPrice} />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {!isSupplier && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2'>
          <input
            type='number'
            min='1'
            className='border px-2 py-1 rounded'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t("product_chats.quantity")}
          />
          <select
            className='border px-2 py-1 rounded'
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          >
            <option value=''>{t("product_chats.color")}</option>
            {product.colors?.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className='border px-2 py-1 rounded'
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value=''>{t("product_chats.size")}</option>
            {product.sizes?.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className='border px-2 py-1 rounded'
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
          >
            <option value=''>{t("product_chats.location")}</option>
            {Array.from(
              new Set(
                (product.priceRanges || [])
                  .flatMap((p) => p.locations || [])
                  .map((l) => l.location)
              )
            ).map((loc, i) => (
              <option key={i} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='flex justify-between text-sm'>
        <span>
          <strong>{t("product_chats.subtotal")}</strong>:{" "}
          <Currency amount={isSupplier ? buyerSubtotal : subtotal} />
        </span>
        <span>
          <strong>{t("product_chats.shipping")}</strong>:{" "}
          <Currency amount={isSupplier ? buyerShipping : safeShipping} />
        </span>
      </div>

      {!isSupplier && (
        <>
          <div className='flex gap-2'>
            <button
              className={`text-white px-4 py-2 rounded ${
                isInvalid() ? "bg-red-400 cursor-not-allowed" : "bg-green-600"
              }`}
              onClick={handleAddToCart}
              disabled={isInvalid()}
            >
              {t("product_chats.addToCart")}
            </button>
            <button
              className='border px-4 py-2 rounded'
              onClick={() => console.log("Review order clicked")}
            >
              {t("product_chats.reviewOrder")}
            </button>
          </div>
          {cartMessage && (
            <div
              className={`mt-1 text-sm italic text-center ${cartMessageColor}`}
            >
              {cartMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MiniProductDetails;
