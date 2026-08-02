const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

class ApiError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new ApiError(error.message || "Network request failed.", {
      code: "network_error",
    });
  }

  const payload = await response.text().then((text) => {
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  });

  if (!response.ok) {
    const message = payload.error || `Request failed with status ${response.status}.`;
    throw new ApiError(message, {
      code: payload.code,
      status: response.status,
    });
  }

  return payload;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export async function createAccount(form) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function login(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function loginWithGoogle(credential) {
  return request("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}
