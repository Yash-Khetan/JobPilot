// src/utils/api.js — API helper with auth token management

const API_BASE = "http://localhost:3000/api";

/**
 * Wrapper around fetch that automatically attaches the JWT
 * Authorization header from localStorage when available.
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("jobpilot_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Allow browser to set boundary for multipart/form-data
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ── Auth API ──────────────────────────────────────────────────────
export const authAPI = {
  signup: (name, email, password) =>
    apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch("/auth/me"),
};

// ── Tracker API ───────────────────────────────────────────────────
export const trackerAPI = {
  getAll: () => apiFetch("/tracker"),

  save: (job) =>
    apiFetch("/tracker", {
      method: "POST",
      body: JSON.stringify(job),
    }),

  update: (id, data) =>
    apiFetch(`/tracker/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    apiFetch(`/tracker/${id}`, {
      method: "DELETE",
    }),
};

// ── Resume API ────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return apiFetch("/resume/upload", {
      method: "POST",
      body: formData,
    });
  },
};
