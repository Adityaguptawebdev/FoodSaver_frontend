const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5050/api").replace(/\/api\/?$/, "");

// Cloudinary URLs are already absolute; older local-disk uploads were relative
// paths like "/uploads/xyz.jpg" and need the API origin prepended.
export function resolveImageUrl(url) {
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}
