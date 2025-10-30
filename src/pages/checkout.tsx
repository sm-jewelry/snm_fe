import React, { useEffect, useState } from "react";

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const ORDER_API_BASE = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL;

const CheckoutPage: React.FC = () => {
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<"cod" | "online">("cod");

    // Shipping form
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pinCode, setPinCode] = useState("");

    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    useEffect(() => {
        const fetchCart = async (cartId: string) => {
            try {
                const res = await fetch(`${API_BASE}/api/cart/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setCart(data.data);
            } catch (err) {
                console.error("Error fetching cart:", err);
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
                alert("Cart not found!");
                setLoading(false);
                return;
            }
            fetchCart(cartId);
        }
    }, [token]);

    if (loading) return <p>Loading checkout...</p>;
    if (!cart || cart.items.length === 0)
        return <p style={{ textAlign: "center", marginTop: "50px" }}>No cart found!</p>;

    const { items, total } = cart;

    const handleCreateOrder = async () => {
        if (!email || !address || !city || !state || !pinCode) {
            return alert("Please fill all required fields");
        }

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
            const res = await fetch(`${ORDER_API_BASE}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items,
                    shippingAddress,
                    paymentMethod: selectedPayment === "cod" ? "COD" : "Razorpay",
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Order creation failed");

            if (selectedPayment === "cod") {
                alert("Order created successfully (Cash on Delivery)");
                window.location.href = "/order-success";
            } else if (selectedPayment === "online") {
                // Trigger Razorpay checkout
                const rzpOrder = data.data.rzpOrder;
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY, // Razorpay key
                    amount: rzpOrder.amount,
                    currency: rzpOrder.currency,
                    name: "My Shop",
                    description: "Order Payment",
                    order_id: rzpOrder.id,
                    handler: async function (response: any) {
                        try {
                            const verifyRes = await fetch(`${ORDER_API_BASE}/api/payments/verify`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: data.data.order._id,
                                }),
                            });
                            const verifyData = await verifyRes.json();
                            if (!verifyRes.ok) throw new Error(verifyData.message);
                            alert("Payment successful! Order confirmed.");
                            window.location.href = "/order-success";
                        } catch (err: any) {
                            alert("Payment verification failed: " + err.message);
                        }
                    },
                    prefill: {
                        email,
                        name: firstName + " " + lastName,
                    },
                    theme: { color: "#000" },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Something went wrong");
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* LEFT SECTION - FORM
        <div className="checkout-left">
          <h2>Contact</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="name-fields">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div> */}
                {/* LEFT SECTION - FORM */}
                <div className="checkout-left">
                    <h2>Contact</h2>
                    <input type="email"
                        placeholder="Email or mobile phone number"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="checkbox">
                        <input type="checkbox" /> Email me with news and offers
                    </label>

                    <h3>Delivery</h3>
                    <select>
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                    </select>

                    <div className="name-fields">
                        <input type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} />
                        <input type="text"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)} />
                    </div>

                    <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Apartment, suite, etc."
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <div className="address-row">
                        <input
                            type="text"
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="PIN Code"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="payment-method">
                        <h3>Payment Method</h3>
                        <label className="payment-option">
                            <input
                                type="radio"
                                name="payment"
                                value="cod"
                                checked={selectedPayment === "cod"}
                                onChange={() => setSelectedPayment("cod")}
                            />
                            <span>Cash on Delivery</span>
                        </label>
                        <label className="payment-option">
                            <input
                                type="radio"
                                name="payment"
                                value="online"
                                checked={selectedPayment === "online"}
                                onChange={() => setSelectedPayment("online")}
                            />
                            <span>Online Payment</span>
                        </label>
                    </div>

                    <button className="continue-btn" onClick={handleCreateOrder}>
                        Continue to Shipping
                    </button>
                </div>

                {/* RIGHT SECTION - SUMMARY */}
                <div className="checkout-right">
                    <h3>Order Summary</h3>
                    <div className="checkout-items">
                        {items.map((item) => (
                            <div key={item.productId} className="checkout-item">
                                <div className="checkout-item-img">
                                    <img src={item.url} alt={item.title} />
                                    <span className="qty-badge">{item.quantity}</span>
                                </div>
                                <div className="checkout-item-info">
                                    <p className="title">{item.title}</p>
                                    <p className="price">₹{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{total}</span>
                    </div>
                    <div className="summary-total">
                        <span>Total</span>
                        <span className="total-amount">₹{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
