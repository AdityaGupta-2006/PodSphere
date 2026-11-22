const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof globalThis.process !== "undefined" && globalThis.process.env && globalThis.process.env.VITE_API_URL) ||
  "http://localhost:5000/api";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("podsphere_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    const error = new Error(`Unable to connect to server. Please verify the backend is running at ${API_BASE_URL}`);
    error.status = 503;
    throw error;
  }

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
      } else if (response.status === 409) {
        message = "An account with this email already exists.";
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
