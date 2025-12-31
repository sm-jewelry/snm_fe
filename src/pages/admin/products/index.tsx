import React, { useEffect, useState } from "react";
import { fetcher } from "../../../lib/api";

interface Product {
  _id: string;
  title: string;
  price: number;
  collectionId: { _id: string; name: string };
  URL: string;
  description: string;
  stock: number;
  SKU: string;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  isFeatured?: boolean;
}

interface Collection {
  _id: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState<Partial<Product>>({
    title: "",
    price: 0,
    collectionId: { _id: "", name: "" },
    URL: "",
    description: "",
    stock: 0,
    SKU: "",
    rating: 0,
    reviewCount: 0,
    brand: "",
    isFeatured: false,
  });
  const [preview, setPreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load products & collections
  const loadProducts = async () => {
    const data = await fetcher("/api/catalogs");
    setProducts(data);
  };

  const loadCollections = async () => {
    const data = await fetcher("/api/collections");
    setCollections(data);
  };

  useEffect(() => {
    loadProducts();
    loadCollections();
  }, []);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Use fetcher which automatically adds API_BASE and auth headers
    const res = await fetcher("/api/catalogs/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) {
      setPreview(data.url);
      setForm((prev) => ({ ...prev, URL: data.url }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      price: form.price,
      collectionId: form.collectionId?._id || form.collectionId,
      URL: preview || form.URL,
      description: form.description,
      stock: form.stock,
      SKU: form.SKU,
      rating: form.rating || 0,
      reviewCount: form.reviewCount || 0,
      brand: form.brand || "",
      isFeatured: form.isFeatured || false,
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/catalogs/${editingId}` : "/api/catalogs";

    await fetcher(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setForm({
      title: "",
      price: 0,
      collectionId: { _id: "", name: "" },
      URL: "",
      description: "",
      stock: 0,
      SKU: "",
      rating: 0,
      reviewCount: 0,
      brand: "",
      isFeatured: false,
    });
    setPreview("");
    setEditingId(null);
    await loadProducts();
  };

  // Edit existing product
  const handleEdit = (p: Product) => {
    setForm({
      title: p.title,
      price: p.price,
      collectionId: p.collectionId,
      URL: p.URL,
      description: p.description,
      stock: p.stock,
      SKU: p.SKU,
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      brand: p.brand || "",
      isFeatured: p.isFeatured || false,
    });
    setPreview(p.URL);
    setEditingId(p._id);
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await fetcher(`/api/catalogs/${id}`, { method: "DELETE" });
      await loadProducts();
    }
  };

  return (
    <div className="admincollectionproduct-container">
      <h2 className="admincollectionproduct-title">🧤 Manage Products</h2>

      <form className="admincollectionproduct-form" onSubmit={handleSubmit}>
        <input
          placeholder="Product Title"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
        />
        <input
          placeholder="SKU"
          value={form.SKU || ""}
          onChange={(e) => setForm({ ...form, SKU: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock || ""}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
        <select
          value={form.collectionId?._id || ""}
          onChange={(e) =>
            setForm({
              ...form,
              collectionId: { _id: e.target.value, name: "" },
            })
          }
        >
          <option value="">Select Collection</option>
          {collections.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Brand (optional)"
          value={form.brand || ""}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            id="isFeatured"
            checked={form.isFeatured || false}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          <label htmlFor="isFeatured">Featured Product (Brands We Love)</label>
        </div>

        <input
          type="number"
          placeholder="Rating (0-5)"
          min="0"
          max="5"
          step="0.1"
          value={form.rating || ""}
          onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
        />

        <input
          type="number"
          placeholder="Review Count"
          min="0"
          value={form.reviewCount || ""}
          onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })}
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && (
          <div className="admincollectionproduct-image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <button type="submit">
          {editingId ? "Update Product" : "Add Product"}
        </button>
        {editingId && (
          <button
            type="button"
            className="admincollectionproduct-cancel-btn"
            onClick={() => {
              setEditingId(null);
              setForm({
                title: "",
                price: 0,
                collectionId: { _id: "", name: "" },
                URL: "",
                description: "",
                stock: 0,
                SKU: "",
                rating: 0,
                reviewCount: 0,
                brand: "",
                isFeatured: false,
              });
              setPreview("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="admincollectionproduct-grid">
  {products.map((p) => (
    <div key={p._id} className="admincollectionproduct-card">
      <img src={p.URL} alt={p.title} />
      <h3>{p.title}</h3>
      <p>₹{p.price}</p>
      <p className="sku">{p.SKU}</p>
      <p>
        <strong>Stock:</strong> {p.stock}
      </p>
      <p>
        <strong>Collection:</strong> {p.collectionId?.name || "—"}
      </p>
      <div className="admincollectionproduct-actions">
        <button className="edit-btn" onClick={() => handleEdit(p)}>
          ✏️ Edit
        </button>
        <button className="delete-btn" onClick={() => handleDelete(p._id)}>
          🗑 Delete
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
