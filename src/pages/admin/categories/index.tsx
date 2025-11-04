import React, { useEffect, useState } from "react";
import { fetcher } from "../../../lib/api";


interface CategoryParent {
  _id: string;
  name: string;
  level: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  level: string;
  parents?: CategoryParent[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    level: "C1",
    parents: [] as string[],
  });

  // Parent lists
  const [c1Categories, setC1Categories] = useState<Category[]>([]);
  const [c2Categories, setC2Categories] = useState<Category[]>([]);

  const loadCategories = async () => {
    const data = await fetcher("/api/categories");
    setCategories(data);
  };

  const loadParentLists = async () => {
    const c1 = await fetcher("/api/categories/level/C1");
    const c2 = await fetcher("/api/categories/level/C2");
    setC1Categories(c1);
    setC2Categories(c2);
  };

  useEffect(() => {
    loadCategories();
    loadParentLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetcher("/api/categories", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "", level: "C1", parents: [] });
    await loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetcher(`/api/categories/${id}`, { method: "DELETE" });
    await loadCategories();
  };

  const filteredParents =
    form.level === "C2"
      ? c1Categories
      : form.level === "C3"
      ? c2Categories
      : [];

  return (
    <div className="category-container">
      <h2 className="category-title">📂 Categories</h2>

      {/* Category Form */}
      <form onSubmit={handleSubmit} className="category-form">
        <input
          placeholder="Category name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          value={form.level}
          onChange={(e) =>
            setForm({ ...form, level: e.target.value, parents: [] })
          }
        >
          <option value="C1">C1</option>
          <option value="C2">C2</option>
          <option value="C3">C3</option>
        </select>

        {/* Parent Dropdown (only for C2/C3) */}
        {filteredParents.length > 0 && (
          <select
            value={form.parents[0] || ""}
            onChange={(e) =>
              setForm({ ...form, parents: [e.target.value] })
            }
          >
            <option value="">Select Parent</option>
            {filteredParents.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.level})
              </option>
            ))}
          </select>
        )}

        <button type="submit" className="add-btn">
          ➕ Add Category
        </button>
      </form>

      {/* Categories List */}
      <ul className="category-list">
        {categories.map((cat) => (
          <li key={cat._id} className="category-item">
            <div>
              <strong>{cat.name}</strong> ({cat.level})
              {cat.description && (
                <p className="category-desc">{cat.description}</p>
              )}
              {cat.parents && cat.parents.length > 0 && (
                <small>Parent: {cat.parents.map((p) => p.name || p).join(", ")}</small>
              )}
            </div>
            <div className="actions">
              <button className="edit-btn">Edit</button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(cat._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
