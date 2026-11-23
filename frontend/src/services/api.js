const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof globalThis.process !== "undefined" && globalThis.process.env && globalThis.process.env.VITE_API_URL) ||
  "http://localhost:5000/api";

const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("podsphere_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Abort the fetch if the server takes too long to respond.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      const error = new Error("Request timed out. The server took too long to respond.");
      error.status = 408;
      throw error;
    }
    const error = new Error(`Unable to connect to server. Please verify the backend is running at ${API_BASE_URL}`);
    error.status = 503;
    throw error;
  }

  clearTimeout(timeoutId);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data.message || data.error;
    if (!message) {
      if (response.status === 404) {
        message = `API endpoint '${endpoint}' was not found on the server (HTTP 404).`;
      } else if (response.status === 401) {
        message = "Invalid email or password.";
      } else if (response.status === 403) {
        message = "Access denied.";
      } else if (response.status === 408) {
        message = "Request timed out. Please try again.";
      } else if (response.status === 409) {
        message = "An account with this email already exists.";
      } else if (response.status === 429) {
        message = "Too many requests. Please wait a moment and try again.";
      } else {
        message = `Request failed with status ${response.status}`;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
