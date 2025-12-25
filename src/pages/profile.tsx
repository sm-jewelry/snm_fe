"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { apiClient } from '../lib/apiClient';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Address management state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  // Address handlers
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressFormData({
      fullName: `${user?.firstName} ${user?.lastName}`,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      phone: user?.phone || '',
      isDefault: ((user as any).addresses?.length || 0) === 0,
    });
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressFormData({
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'India',
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, addressFormData);
        setSuccess('Address updated successfully!');
      } else {
        await addAddress(addressFormData);
        setSuccess('Address added successfully!');
      }
      setShowAddressForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await deleteAddress(addressId);
      setSuccess('Address deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await setDefaultAddress(addressId);
      setSuccess('Default address updated!');
    } catch (err: any) {
      setError(err.message || 'Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const addresses = (user as any).addresses || [];

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-user-info">
              <h1>
                {user.firstName} {user.lastName}
              </h1>
              <p>{user.email}</p>
              <span className={`profile-role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="profile-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button
            className={`profile-tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            My Addresses
          </button>
        </div>

        {/* Profile Information */}
        {activeTab === 'profile' && (
        <div className="profile-info-card">
          <div className="profile-info-header">
            <h2>Profile Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="profile-edit-btn"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="profile-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="profile-alert success">
              {success}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="profile-input"
                  />
                </div>
                <div className="profile-form-group">
                  <label className="profile-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  className="profile-input"
                  placeholder="1234567890"
                />
              </div>

              <div className="profile-form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="profile-save-btn"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phone: user.phone || '',
                    });
                  }}
                  className="profile-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-display">
              <div className="profile-info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="profile-info-item">
                <label>Phone</label>
                <p>{user.phone || 'Not provided'}</p>
              </div>
              <div className="profile-info-item">
                <label>Member Since</label>
                <p>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Order History */}
        {activeTab === 'orders' && (
        <div className="profile-orders-card">
          <h2>Order History</h2>

          {loadingOrders ? (
            <div className="profile-loading">
              <div className="profile-spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="profile-empty-state">
              <svg className="profile-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>No orders yet</p>
              <button
                onClick={() => router.push('/')}
                className="profile-shop-btn"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="profile-orders-list">
              {orders.map((order) => (
                <div key={order._id} className="profile-order-item">
                  <div className="profile-order-header">
                    <div>
                      <p className="profile-order-id">Order #{order._id.slice(-8)}</p>
                      <p className="profile-order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`profile-order-status ${
                      order.status === 'completed' ? 'completed' :
                      order.status === 'paid' ? 'paid' :
                      order.status === 'pending' ? 'pending' :
                      'default'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="profile-order-footer">
                    <p className="profile-order-items">
                      {order.items?.length || 0} item(s)
                    </p>
                    <p className="profile-order-amount">
                      ₹{order.amount?.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewOrderDetails(order)}
                    className="profile-order-view-btn"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
        <div className="profile-addresses-card">
          <div className="profile-addresses-header">
            <h2>My Addresses</h2>
            <button onClick={handleAddAddress} className="profile-add-address-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Address
            </button>
          {error && <div className="profile-alert error">{error}</div>}
          {success && <div className="profile-alert success">{success}</div>}

          {addresses.length === 0 ? (
            <div className="profile-empty-state">
              <svg className="profile-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>No addresses saved</p>
              <button onClick={handleAddAddress} className="profile-shop-btn">
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="profile-addresses-list">
              {addresses.map((address: any) => (
                <div key={address._id} className={`profile-address-item ${address.isDefault ? 'default' : ''}`}>
                  {address.isDefault && (
                    <span className="profile-address-default-badge">Default</span>
                  )}
                  <div className="profile-address-content">
                    <h3>{address.fullName}</h3>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    <p>{address.country}</p>
                    <p className="profile-address-phone">Phone: {address.phone}</p>
                  </div>
                  <div className="profile-address-actions">
                    <button onClick={() => handleEditAddress(address)} className="profile-address-edit-btn">
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button onClick={() => handleSetDefault(address._id)} className="profile-address-default-btn">
                        Set as Default
                      </button>
                    )}
                    <button onClick={() => handleDeleteAddress(address._id)} className="profile-address-delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
        </div>
        )}

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="profile-modal-overlay" onClick={() => setShowAddressForm(false)}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                <button onClick={() => setShowAddressForm(false)} className="profile-modal-close">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="profile-modal-body">
                <form onSubmit={handleAddressSubmit} className="profile-address-form">
                  <div className="profile-form-row">
                    <div className="profile-form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={addressFormData.fullName}
                        onChange={handleAddressFormChange}
                        required
                        className="profile-input"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={addressFormData.phone}
                        onChange={handleAddressFormChange}
                        required
                        pattern="[0-9]{10}"
                        className="profile-input"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={addressFormData.addressLine1}
                      onChange={handleAddressFormChange}
                      required
                      className="profile-input"
                      placeholder="House No., Building Name"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={addressFormData.addressLine2}
                      onChange={handleAddressFormChange}
                      className="profile-input"
                      placeholder="Road Name, Area, Colony"
                    />
                  </div>

                  <div className="profile-form-row">
                    <div className="profile-form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={addressFormData.city}
                        onChange={handleAddressFormChange}
                        required
                        className="profile-input"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={addressFormData.state}
                        onChange={handleAddressFormChange}
                        required
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <div className="profile-form-row">
                    <div className="profile-form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={addressFormData.zipCode}
                        onChange={handleAddressFormChange}
                        required
                        pattern="[0-9]{6}"
                        className="profile-input"
                        placeholder="123456"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label>Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={addressFormData.country}
                        onChange={handleAddressFormChange}
                        required
                        className="profile-input"
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-checkbox-label">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressFormData.isDefault}
                        onChange={handleAddressFormChange}
                        className="profile-checkbox"
                      />
                      Set as default address
                    </label>
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" disabled={loading} className="profile-save-btn">
                      {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="profile-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="profile-modal-overlay" onClick={closeOrderDetails}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h2>Order Details</h2>
                <button onClick={closeOrderDetails} className="profile-modal-close">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="profile-modal-body">
                {/* Order Info */}
                <div className="profile-order-detail-section">
                  <h3>Order Information</h3>
                  <div className="profile-order-detail-grid">
                    <div>
                      <label>Order ID</label>
                      <p>#{selectedOrder._id}</p>
                    </div>
                    <div>
                      <label>Order Date</label>
                      <p>{new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <label>Status</label>
                      <span className={`profile-order-status ${
                        selectedOrder.status === 'completed' ? 'completed' :
                        selectedOrder.status === 'paid' ? 'paid' :
                        selectedOrder.status === 'pending' ? 'pending' :
                        'default'
                      }`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label>Total Amount</label>
                      <p className="profile-order-detail-amount">₹{selectedOrder.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="profile-order-detail-section">
                    <h3>Shipping Address</h3>
                    <div className="profile-order-address">
                      <p>{selectedOrder.shippingAddress.fullName || user.firstName + ' ' + user.lastName}</p>
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country || 'India'}</p>
                      <p>Phone: {selectedOrder.shippingAddress.phone || user.phone}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="profile-order-detail-section">
                  <h3>Order Items</h3>
                  <div className="profile-order-items-list">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="profile-order-item-detail">
                        <div className="profile-order-item-info">
                          <p className="profile-order-item-title">{item.title || item.productId}</p>
                          <p className="profile-order-item-meta">Quantity: {item.quantity}</p>
                        </div>
                        <div className="profile-order-item-price">
                          <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                          <p className="profile-order-item-unit-price">₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                {selectedOrder.paymentId && (
                  <div className="profile-order-detail-section">
                    <h3>Payment Information</h3>
                    <div className="profile-order-detail-grid">
                      <div>
                        <label>Payment ID</label>
                        <p>{selectedOrder.paymentId}</p>
                      </div>
                      {selectedOrder.paymentMethod && (
                        <div>
                          <label>Payment Method</label>
                          <p>{selectedOrder.paymentMethod}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
