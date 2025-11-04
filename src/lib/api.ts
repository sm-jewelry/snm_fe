const API_BASE =
  process.env.NEXT_PUBLIC_CATEGORY_API_BASE_URL || "http://localhost:4455";

export const fetcher = async (url: string, options: RequestInit = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }), // skip for form data
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "API error");
  }

  // 🔥 If it's a file upload (FormData), return Response (so caller can parse manually)
  if (isFormData) return res;

  // For JSON APIs, automatically parse
  return res.json();
};
