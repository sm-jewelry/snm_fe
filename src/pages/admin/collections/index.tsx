import React, { useEffect, useState } from "react";
import { fetcher } from "../../../lib/api";

interface Collection {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState<Partial<Collection>>({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [preview, setPreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load all collections
  const loadCollections = async () => {
    const data = await fetcher("/api/collections");
    setCollections(data);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Use fetcher which automatically adds API_BASE and auth headers
    const res = await fetcher("/api/collections/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) {
      setPreview(data.url);
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `/api/collections/${editingId}`
      : "/api/collections";

    await fetcher(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        imageUrl: preview || form.imageUrl,
      }),
    });

    setForm({ name: "", description: "", imageUrl: "" });
    setPreview("");
    setEditingId(null);
    await loadCollections();
  };

  // Edit existing collection
  const handleEdit = (col: Collection) => {
    setForm({
      name: col.name,
      description: col.description,
      imageUrl: col.imageUrl,
    });
    setPreview(col.imageUrl);
    setEditingId(col._id);
  };

  // Delete collection
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      await fetcher(`/api/collections/${id}`, { method: "DELETE" });
      await loadCollections();
    }
  };

  return (
    <div className="admin-collection-container">
      <h2>🗂 Manage Collections</h2>

      <form className="admin-collection-form" onSubmit={handleSubmit}>
        <input
          placeholder="Collection Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && (
          <div className="admin-image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <button type="submit">
          {editingId ? "Update Collection" : "Add Collection"}
        </button>
        {editingId && (
          <button
            type="button"
            className="admin-cancel-btn"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", description: "", imageUrl: "" });
              setPreview("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="admin-collection-grid">
        {collections.map((col) => (
          <div key={col._id} className="admin-collection-card">
            <img src={col.imageUrl} alt={col.name} />
            <h3>{col.name}</h3>
            <p>{col.description}</p>
            <div className="admin-actions">
              <button
                className="admin-edit-btn"
                onClick={() => handleEdit(col)}
              >
                Edit
              </button>
              <button
                className="admin-delete-btn"
                onClick={() => handleDelete(col._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
