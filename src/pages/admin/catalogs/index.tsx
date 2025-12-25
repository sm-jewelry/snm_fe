import React, { useEffect, useState } from "react";
import { fetcher } from "../../../lib/api";

interface Category {
  _id: string;
  name: string;
  parents?: any[];
  level?: string;
}

interface Catalog {
  _id: string;
  title: string;
  price: number;
  stock: number;
  SKU: string;
  URL: string;
  category?: string;
  c1?: Category | null;
  c2?: Category | null;
  c3?: Category | null;
}

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Catalog>>({
    title: "",
    price: 0,
    stock: 0,
    SKU: "",
    URL: "",
    category: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>("");

  // Load catalogs
  const loadCatalogs = async () => {
    const data = await fetcher("/api/catalogs");
    setCatalogs(data);
  };

  // Load categories
  const loadCategories = async () => {
    const data = await fetcher("/api/categories");
    setCategories(data);
  };

  useEffect(() => {
    loadCatalogs();
    loadCategories();
  }, []);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetcher("/api/catalogs/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.url) {
    setPreview(data.url);
    setForm((prev) => ({ ...prev, URL: data.url })); // ✅ callback form
  }
};

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/catalogs/${editingId}` : "/api/catalogs";
    await fetcher(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        URL: preview || form.URL || "", // ensure not empty
      }),
    });

    setForm({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "" });
    setPreview("");
    setEditingId(null);
    await loadCatalogs();
  };

  // Edit existing
  const handleEdit = (catalog: Catalog) => {
    setForm({
      title: catalog.title,
      price: catalog.price,
      stock: catalog.stock,
      SKU: catalog.SKU,
      URL: catalog.URL,
      category: catalog.category || "",
    });
    setPreview(catalog.URL);
    setEditingId(catalog._id);
  };

  // Delete catalog
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this catalog?")) {
      await fetcher(`/api/catalogs/${id}`, { method: "DELETE" });
      await loadCatalogs();
    }
  };

  // 🧠 Build recursive readable path from any category object
  const buildCategoryPath = (cat: Category): string => {
    if (!cat) return "";
    if (!cat.parents || cat.parents.length === 0) return cat.name;
    const parent = cat.parents[0];
    if (typeof parent === "object") {
      return `${buildCategoryPath(parent)} → ${cat.name}`;
    } else {
      const parentObj = categories.find((c) => c._id === parent);
      return parentObj ? `${buildCategoryPath(parentObj)} → ${cat.name}` : cat.name;
    }
  };

  // 🧩 For dropdown (show only level C3)
  const categoryOptions = categories
    .filter((cat) => cat.level === "C3")
    .map((cat) => ({
      ...cat,
      path: buildCategoryPath(cat),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  // Display readable path in catalog cards
  const getCategoryPath = (catalog: Catalog) => {
    if (catalog.c3) return buildCategoryPath(catalog.c3);
    if (catalog.c2) return buildCategoryPath(catalog.c2);
    if (catalog.c1) return buildCategoryPath(catalog.c1);
    return "";
  };

  return (
    <div className="catalog-container">
      <h2>📦 Product Catalog</h2>

      <form className="catalog-form" onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
        />
        <input
          placeholder="Stock"
          type="number"
          value={form.stock || ""}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          required
        />
        <input
          placeholder="SKU"
          value={form.SKU || ""}
          onChange={(e) => setForm({ ...form, SKU: e.target.value })}
        />

        {/* Category Dropdown */}
        <select
          value={form.category || ""}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categoryOptions.map((cat) => (
            <option key={cat._id} value={cat._id}>
              📂 {cat.path}
            </option>
          ))}
        </select>

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <button type="submit">{editingId ? "Update" : "Add"} Catalog</button>
        {editingId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "" });
              setPreview("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Catalog list */}
      <div className="catalog-grid">
        {catalogs.map((c) => (
          <div key={c._id} className="catalog-card">
            <img src={c.URL} alt={c.title} />
            <h3>{c.title}</h3>
            <p>Price: ₹{c.price}</p>
            <p>Stock: {c.stock}</p>
            <p className="sku">SKU: {c.SKU}</p>
            <p className="category-path">📂 {getCategoryPath(c)}</p>

            <div className="actions">
              <button className="edit-btn" onClick={() => handleEdit(c)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(c._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
