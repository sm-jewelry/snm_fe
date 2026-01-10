"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";

interface CheckoutItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  url?: string;
}

interface CartResponse {
  _id?: string;
  items: CheckoutItem[];
  total: number;
}

interface Address {
  _id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

/* 👇 ADD THIS — extends user type to include addresses */
interface User {
  email?: string;
  addresses?: Address[];
  [key: string]: any;
}

// All API calls now go through the API Gateway for enhanced security
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { user, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAuth() as {
      user: User | null;
      addAddress: any;
      updateAddress: any;
      deleteAddress: any;
      setDefaultAddress: any;
    };

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] =
    useState<"cod" | "online">("cod");

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");

  const [addressFormData, setAddressFormData] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
    isDefault: false,
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  useEffect(() => {
    const fetchCart = async (cartId: string) => {
      try {
        const res = await fetch(`${API_GATEWAY_URL}/api/cart/${cartId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json();
        setCart(data.data);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch cart", "error");
      } finally {
        setLoading(false);
      }
    };

    const checkoutItem = localStorage.getItem("checkoutItem");

    if (checkoutItem) {
      const item = JSON.parse(checkoutItem);
      setCart({
        items: [
          {
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            url: item.image,
          },
        ],
        total: item.total,
      });
      localStorage.removeItem("checkoutItem");
      setLoading(false);
    } else {
      const params = new URLSearchParams(window.location.search);
      const cartId = params.get("cartId");
      if (!token || !cartId) {
        Swal.fire("Cart not found", "Please add products again", "warning");
        setLoading(false);
        return;
      }
      fetchCart(cartId);
    }
  }, []);

  /* Auto-select default address */
  useEffect(() => {
    if (user?.addresses?.length) {
      const defaultAddr = user.addresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        populateFormFromAddress(defaultAddr);
      }
    }

    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (selectedAddressId && user?.addresses?.length) {
      const addr = user.addresses.find((a) => a._id === selectedAddressId);
      if (addr) populateFormFromAddress(addr);
    }
  }, [selectedAddressId]);

  const populateFormFromAddress = (addr: Address) => {
    const [fName, ...lNameParts] = addr.fullName.split(" ");
    setFirstName(fName || "");
    setLastName(lNameParts.join(" ") || "");
    setAddress(addr.addressLine1);
    setApartment(addr.addressLine2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPinCode(addr.zipCode);
    setPhone(addr.phone);
    setCountry(addr.country);
  };

  const handleAddAddress = () => {
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setAddressFormData({
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      phone: "",
      isDefault: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (addr: Address) => {
    setIsEditingAddress(true);
    setEditingAddressId(addr._id);
    setAddressFormData({
      fullName: addr.fullName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleAddressFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditingAddress && editingAddressId) {
        await updateAddress(editingAddressId, addressFormData);
      } else {
        await addAddress(addressFormData);
      }
      setShowAddressModal(false);
    } catch (error: any) {
      alert(error.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Delete this address?")) return;

    try {
      await deleteAddress(addressId);
      Swal.fire("Deleted", "Address removed successfully", "success");
      if (selectedAddressId === addressId) setSelectedAddressId(null);
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to delete address", "error");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
      setSelectedAddressId(addressId);
    } catch (err: any) {
      alert(err.message || "Failed to set default address");
    }
  };

  if (loading) return <p>Loading checkout...</p>;
  if (!cart || cart.items.length === 0)
    return <p style={{ textAlign: "center", marginTop: 50 }}>No cart found</p>;

  const { items, total } = cart;

  const handleCreateOrder = async () => {
    if (!email || !address || !city || !state || !pinCode)
      return Swal.fire("Missing Info", "Please fill all required fields", "warning");

    const shippingAddress = {
      email,
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      pinCode,
    };

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod: selectedPayment === "cod" ? "COD" : "Razorpay",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order creation failed");

      if (selectedPayment === "cod") {
        // For COD, order is directly in data.data (not nested)
        const orderId = data.data._id || data.data.order?._id;
        Swal.fire({
          icon: "success",
          title: "Order Placed",
          text: "Cash on Delivery order created successfully",
        })
        router.push(`/order-success?orderId=${orderId}`);
      } else if (selectedPayment === "online") {
        // For Razorpay, response has { order, rzpOrder }
        const rzpOrder = data.data.rzpOrder;
        const orderId = data.data.order._id;

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "SNM Jewelry",
          description: "Order Payment",
          order_id: rzpOrder.id,
          handler: async function (response: any) {
            try {
              // Get fresh token from localStorage at time of verification
              const currentToken = typeof window !== "undefined"
                ? localStorage.getItem("access_token")
                : null;

              if (!currentToken) {
                // If no token, redirect to success anyway since webhook will handle verification
                router.push(`/order-success?orderId=${orderId}`);
                return;
              }

              const verifyRes = await fetch(`${API_GATEWAY_URL}/api/payments/verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${currentToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderId,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                // If verification fails, redirect to success anyway since webhook will handle it
                router.push(`/order-success?orderId=${orderId}`);
                return;
              }

              // Payment verified successfully
              router.push(`/order-success?orderId=${orderId}`);
            } catch (err: any) {
              // Even on error, redirect to success since webhook will handle verification
              router.push(`/order-success?orderId=${orderId}`);
            }
          },
          modal: {
            ondismiss: function() {
              // User closed the payment modal without completing payment
              router.push(`/order-failure?orderId=${orderId}&reason=${encodeURIComponent("Payment cancelled by user")}`);
            }
          },
          prefill: {
            email,
            name: firstName + " " + lastName,
          },
          theme: { color: "#ffd700" },
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (err: any) {
          // Razorpay failed to load
          const errorMessage = err.message || "Failed to load payment gateway";
          router.push(`/order-failure?orderId=${orderId}&reason=${encodeURIComponent(errorMessage)}`);
        }
      }
    } catch (err: any) {
      Swal.fire("Order Failed", err.message || "Something went wrong", "error");
    }
  };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* LEFT SECTION - FORM */}
                <div className="checkout-left">
                    <h2 className="checkout-section-title">Contact</h2>
                    <input
                        type="email"
                        placeholder="Email or mobile phone number"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="checkout-input"
                    />

                    <h3 className="checkout-section-title">Delivery Address</h3>

                    {/* Saved Addresses Section */}
                    {user?.addresses && user.addresses.length > 0 && (
                        <div className="checkout-saved-addresses">
                            <div className="checkout-addresses-header">
                                <span className="checkout-addresses-label">Select a saved address</span>
                                <button
                                    type="button"
                                    onClick={handleAddAddress}
                                    className="checkout-add-new-btn"
                                >
                                    + Add New Address
                                </button>
                            </div>

                            <div className="checkout-addresses-grid">
                                {user.addresses.map((addr: Address) => (
                                    <div
                                        key={addr._id}
                                        className={`checkout-address-card ${selectedAddressId === addr._id ? 'selected' : ''} ${addr.isDefault ? 'default' : ''}`}
                                        onClick={() => setSelectedAddressId(addr._id)}
                                    >
                                        {addr.isDefault && (
                                            <span className="checkout-default-badge">Default</span>
                                        )}
                                        <div className="checkout-address-content">
                                            <p className="checkout-address-name">{addr.fullName}</p>
                                            <p>{addr.addressLine1}</p>
                                            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                            <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                                            <p>{addr.country}</p>
                                            <p className="checkout-address-phone">📞 {addr.phone}</p>
                                        </div>
                                        <div className="checkout-address-actions">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditAddress(addr);
                                                }}
                                                className="checkout-edit-btn"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAddress(addr._id);
                                                }}
                                                className="checkout-delete-btn"
                                            >
                                                Delete
                                            </button>
                                            {!addr.isDefault && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetDefault(addr._id);
                                                    }}
                                                    className="checkout-set-default-btn"
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Manual Address Entry (shown if no saved addresses or user wants to enter manually) */}
                    {(!user?.addresses || user.addresses.length === 0) && (
                        <button
                            type="button"
                            onClick={handleAddAddress}
                            className="checkout-add-first-address-btn"
                        >
                            + Add Delivery Address
                        </button>
                    )}

                    <div className="checkout-delivery-form">
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="checkout-select"
                        >
                            <option>India</option>
                            <option>United States</option>
                            <option>United Kingdom</option>
                        </select>

                        <div className="checkout-form-row">
                            <input
                                type="text"
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="checkout-input"
                            />
                            <input
                                type="text"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="checkout-input"
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="checkout-input"
                        />
                        <input
                            type="text"
                            placeholder="Apartment, suite, etc. (optional)"
                            value={apartment}
                            onChange={(e) => setApartment(e.target.value)}
                            className="checkout-input"
                        />

                        <div className="checkout-form-row">
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="checkout-input"
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="checkout-input"
                            />
                        </div>

                        <div className="checkout-form-row">
                            <input
                                type="text"
                                placeholder="PIN Code"
                                value={pinCode}
                                onChange={(e) => setPinCode(e.target.value)}
                                className="checkout-input"
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="checkout-input"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="checkout-payment-section">
                        <h3 className="checkout-section-title">Payment Method</h3>
                        <div className="checkout-payment-options">
                            <label className="checkout-payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={selectedPayment === "cod"}
                                    onChange={() => setSelectedPayment("cod")}
                                />
                                <div className="checkout-payment-label">
                                    <span className="checkout-payment-icon">💵</span>
                                    <span>Cash on Delivery</span>
                                </div>
                            </label>
                            <label className="checkout-payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="online"
                                    checked={selectedPayment === "online"}
                                    onChange={() => setSelectedPayment("online")}
                                />
                                <div className="checkout-payment-label">
                                    <span className="checkout-payment-icon">💳</span>
                                    <span>Online Payment</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button className="checkout-place-order-btn" onClick={handleCreateOrder}>
                        Place Order - ₹{total}
                    </button>
                </div>

                {/* RIGHT SECTION - SUMMARY */}
                <div className="checkout-right">
                    <h3 className="checkout-summary-title">Order Summary</h3>
                    <div className="checkout-items">
                        {items.map((item) => (
                            <div key={item.productId} className="checkout-item">
                                <div className="checkout-item-img">
                                    <img src={item.url} alt={item.title} />
                                    <span className="checkout-qty-badge">{item.quantity}</span>
                                </div>
                                <div className="checkout-item-info">
                                    <p className="checkout-item-title">{item.title}</p>
                                    <p className="checkout-item-price">₹{item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-summary-divider"></div>

                    <div className="checkout-summary-row">
                        <span>Subtotal</span>
                        <span>₹{total.toLocaleString()}</span>
                    </div>
                    <div className="checkout-summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="checkout-summary-total">
                        <span>Total</span>
                        <span className="checkout-total-amount">₹{total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="checkout-modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="checkout-modal-header">
                            <h2>{isEditingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                            <button
                                className="checkout-modal-close"
                                onClick={() => setShowAddressModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="checkout-address-form">
                            <div className="checkout-modal-body">
                                <div className="checkout-form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={addressFormData.fullName}
                                        onChange={handleAddressFormChange}
                                        required
                                        className="checkout-input"
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={addressFormData.phone}
                                        onChange={handleAddressFormChange}
                                        required
                                        className="checkout-input"
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>Address Line 1 *</label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        value={addressFormData.addressLine1}
                                        onChange={handleAddressFormChange}
                                        required
                                        className="checkout-input"
                                    />
                                </div>

                                <div className="checkout-form-group">
                                    <label>Address Line 2</label>
                                    <input
                                        type="text"
                                        name="addressLine2"
                                        value={addressFormData.addressLine2}
                                        onChange={handleAddressFormChange}
                                        className="checkout-input"
                                    />
                                </div>

                                <div className="checkout-form-row">
                                    <div className="checkout-form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={addressFormData.city}
                                            onChange={handleAddressFormChange}
                                            required
                                            className="checkout-input"
                                        />
                                    </div>

                                    <div className="checkout-form-group">
                                        <label>State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={addressFormData.state}
                                            onChange={handleAddressFormChange}
                                            required
                                            className="checkout-input"
                                        />
                                    </div>
                                </div>

                                <div className="checkout-form-row">
                                    <div className="checkout-form-group">
                                        <label>ZIP Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={addressFormData.zipCode}
                                            onChange={handleAddressFormChange}
                                            required
                                            className="checkout-input"
                                        />
                                    </div>

                                    <div className="checkout-form-group">
                                        <label>Country *</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={addressFormData.country}
                                            onChange={handleAddressFormChange}
                                            required
                                            className="checkout-input"
                                        />
                                    </div>
                                </div>

                                <div className="checkout-checkbox-wrapper">
                                    <label className="checkout-checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={addressFormData.isDefault}
                                            onChange={handleAddressFormChange}
                                        />
                                        <span>Set as default address</span>
                                    </label>
                                </div>
                            </div>

                            <div className="checkout-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(false)}
                                    className="checkout-cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="checkout-save-btn">
                                    {isEditingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
