import { getStoredSession } from "./session.js";

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
    const accessToken = getStoredSession()?.accessToken;
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

export async function getDashboardData() {
  return request("/api/dashboard");
}

export async function getLoyaltyAwardOptions() {
  return request("/api/dashboard/loyalty-options");
}

export async function awardLoyaltyPoints(form) {
  return request("/api/dashboard/loyalty-points", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function getBusinessOffers() {
  return request("/api/dashboard/offers");
}

export async function createBusinessOffer(form) {
  return request("/api/dashboard/offers", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function getCustomerBusinessCategories() {
  return request("/api/customer/business-categories");
}

export async function getCustomerBusinesses(category) {
  return request(`/api/customer/businesses?category=${encodeURIComponent(category)}`);
}

export async function createCustomerAccount(form) {
  return request("/api/customer-auth/signup", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function loginCustomer(credentials) {
  return request("/api/customer-auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getCustomerDashboardData() {
  return request("/api/customer-dashboard");
}
