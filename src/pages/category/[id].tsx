import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Product {
  _id: string;
  title: string;
  price: number;
  URL: string;
}

const API_BASE = process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL;

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/categories/${id}/products`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch products");
        setProducts(data.data || []);
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading products...</p>;

  if (error)
    return (
      <p className="p-6 text-center text-red-600">
        ⚠️ {error}
      </p>
    );

  if (!products.length)
    return (
      <p className="p-6 text-center text-gray-600">
        No products found in this category.
      </p>
    );

  return (
    <div className="category-page max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Category Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded-2xl p-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-xl">
              <img
                src={product.URL}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="font-semibold text-lg mb-1 truncate">
              {product.title}
            </h2>
            <p className="text-gray-700 font-medium">₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
