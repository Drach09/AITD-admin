const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

/**
 * A wrapper around fetch that automatically includes credentials (for HttpOnly cookies)
 * and attaches the CSRF token to headers if available.
 */
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

export interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  sortOrder?: number;
  meta?: Record<string, unknown>;
}

export async function getSection(section: string): Promise<ContentItem[]> {
  const response = await apiFetch(`${API_BASE_URL}/content/${section}`);
  if (!response.ok) {
    throw new Error("Failed to load data.");
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function saveSection(section: string, items: ContentItem[]): Promise<ContentItem[]> {
  const response = await apiFetch(`${API_BASE_URL}/content/${section}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to save data.");
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append("image", file);

  const response = await apiFetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Image upload failed.");
  }

  return response.json();
}

/**
 * Call the backend to login.
 */
export async function loginAdmin(username: string, password: string): Promise<{ csrfToken: string }> {
  const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Invalid admin credentials.");
  }

  const data = await response.json();
  setCsrfToken(data.csrfToken);
  return data;
}

/**
 * Call the backend to logout.
 */
export async function logoutAdmin(): Promise<void> {
  await apiFetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
  });
  setCsrfToken(null);
}

/**
 * Check if the user has an active session on the backend.
 */
export async function checkAdminSession(): Promise<{ authenticated: boolean; username?: string }> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/me`);
    if (!response.ok) {
      return { authenticated: false };
    }
    const data = await response.json();
    if (data.authenticated) {
      setCsrfToken(data.csrfToken);
      return { authenticated: true, username: data.username };
    }
    return { authenticated: false };
  } catch (error) {
    console.error("Session check failed:", error);
    return { authenticated: false };
  }
}

/**
 * Call the backend to change the admin password.
 */
export async function changeAdminPassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ ok: boolean; message: string }> {
  const response = await apiFetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to change password.");
  }

  const data = await response.json();
  setCsrfToken(null); // Clear active CSRF token since session is destroyed after password change
  return data;
}
