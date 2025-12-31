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
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  isFeatured?: boolean;
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
    rating: 0,
    reviewCount: 0,
    brand: "",
    isFeatured: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>("");

  // Load catalogs
  const loadCatalogs = async () => {
    const data = await fetcher("/api/catalogs");
    // Handle paginated response structure (products) or fallback to direct array
    setCatalogs(data.products || data);
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

  // 🔍 Find c1, c2, c3 from selected category
  const getCategoryHierarchy = (categoryId: string) => {
    const selectedCat = categories.find((c) => c._id === categoryId);
    if (!selectedCat) return { c1: null, c2: null, c3: null };

    let c1 = null;
    let c2 = null;
    let c3 = null;

    if (selectedCat.level === "C3") {
      c3 = selectedCat._id;
      // Find C2 parent
      if (selectedCat.parents && selectedCat.parents.length > 0) {
        const c2Parent = typeof selectedCat.parents[0] === 'object'
          ? selectedCat.parents[0]._id
          : selectedCat.parents[0];
        c2 = c2Parent;

        // Find C1 parent
        const c2Cat = categories.find((c) => c._id === c2Parent);
        if (c2Cat && c2Cat.parents && c2Cat.parents.length > 0) {
          c1 = typeof c2Cat.parents[0] === 'object'
            ? c2Cat.parents[0]._id
            : c2Cat.parents[0];
        }
      }
    } else if (selectedCat.level === "C2") {
      c2 = selectedCat._id;
      if (selectedCat.parents && selectedCat.parents.length > 0) {
        c1 = typeof selectedCat.parents[0] === 'object'
          ? selectedCat.parents[0]._id
          : selectedCat.parents[0];
      }
    } else if (selectedCat.level === "C1") {
      c1 = selectedCat._id;
    }

    return { c1, c2, c3 };
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get category hierarchy
    const hierarchy = getCategoryHierarchy(form.category || "");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/catalogs/${editingId}` : "/api/catalogs";
    await fetcher(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        URL: preview || form.URL || "", // ensure not empty
        rating: form.rating || 0,
        reviewCount: form.reviewCount || 0,
        brand: form.brand || "",
        isFeatured: form.isFeatured || false,
        c1: hierarchy.c1,
        c2: hierarchy.c2,
        c3: hierarchy.c3,
      }),
    });

    setForm({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "", rating: 0, reviewCount: 0, brand: "", isFeatured: false });
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
      rating: catalog.rating || 0,
      reviewCount: catalog.reviewCount || 0,
      brand: catalog.brand || "",
      isFeatured: catalog.isFeatured || false,
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

  // 🧩 For dropdown (show all levels: C1, C2, C3)
  const categoryOptions = categories
    .filter((cat) => cat.level === "C1" || cat.level === "C2" || cat.level === "C3")
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

        <input
          placeholder="Brand (optional)"
          value={form.brand || ""}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            id="catalogFeatured"
            checked={form.isFeatured || false}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          <label htmlFor="catalogFeatured">Featured Product (Brands We Love)</label>
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
              setForm({ title: "", price: 0, stock: 0, SKU: "", URL: "", category: "", rating: 0, reviewCount: 0, brand: "", isFeatured: false });
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
