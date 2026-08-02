import { RequestError } from "../errors/RequestError.js";
import {
  createCustomer,
  findActiveBusinessById,
  findCustomerByEmail,
  findCustomerByIdAndBusiness,
  findCustomerLoyaltyPrograms,
  findCustomerByWhatsAppNumber,
  findActiveOffersForBusiness,
  findCustomerLoyaltyHistory,
  findCustomerVisitHistory,
  listActiveBusinesses,
  listBusinessCategories,
} from "../repositories/customerRepository.js";
import { hashPassword, verifyPassword } from "./passwordService.js";
import { createAccessToken } from "./tokenService.js";

function customerAccountResponse(customer) {
  return {
    user: {
      id: customer.customer_id,
      name: customer.full_name,
      email: customer.email,
      role: "customer",
    },
    business: {
      id: customer.business_id,
      name: customer.business_name,
      category: customer.business_type,
      city: customer.business_city,
    },
  };
}

function customerSessionResponse(customer) {
  const account = customerAccountResponse(customer);

  return {
    accessToken: createAccessToken(account),
    account,
    tokenType: "Bearer",
  };
}

export async function getBusinessCategories() {
  return listBusinessCategories();
}

export async function getBusinessesByCategory(category) {
  return listActiveBusinesses(category);
}

export async function createCustomerAccount(data) {
  const business = await findActiveBusinessById(data.businessId);
  if (!business) {
    throw new RequestError(404, "The selected business is not available.", "business_not_found");
  }

  const [existingCustomerByWhatsApp, existingCustomerByEmail] = await Promise.all([
    findCustomerByWhatsAppNumber(data.whatsappNumber),
    findCustomerByEmail(data.email),
  ]);
  if (existingCustomerByWhatsApp || existingCustomerByEmail) {
    throw new RequestError(
      409,
      "A customer account with this email or WhatsApp number already exists. Please log in.",
      "customer_already_exists",
    );
  }

  const customer = await createCustomer(data, await hashPassword(data.password));
  return customerSessionResponse({
    ...customer,
    business_name: business.name,
    business_type: business.business_type,
    business_city: business.city,
  });
}

export async function authenticateCustomer(data) {
  const customer = await findCustomerByEmail(data.email);
  if (!customer) {
    throw new RequestError(
      404,
      "No customer account was found for this email address.",
      "customer_not_found",
    );
  }
  if (!(await verifyPassword(data.password, customer.password_hash))) {
    throw new RequestError(
      401,
      "The email or password is incorrect.",
      "invalid_customer_credentials",
    );
  }

  return customerSessionResponse(customer);
}

export async function getCustomerDashboard(customerId, businessId) {
  const customer = await findCustomerByIdAndBusiness(customerId, businessId);
  if (!customer) {
    throw new RequestError(404, "Customer account not found.", "customer_not_found");
  }

  const [loyaltyPrograms, offers, loyaltyHistory, visits] = await Promise.all([
    findCustomerLoyaltyPrograms(customerId, businessId),
    findActiveOffersForBusiness(businessId).catch(() => []),
    findCustomerLoyaltyHistory(customerId, businessId).catch(() => []),
    findCustomerVisitHistory(customerId, businessId).catch(() => []),
  ]);

  return {
    customer: {
      name: customer.full_name,
      email: customer.email,
      whatsappNumber: customer.mobile,
      birthDate: customer.birth_date,
      anniversaryDate: customer.anniversary_date,
      gender: customer.gender,
      city: customer.customer_city,
      isMarried: customer.is_married,
    },
    business: {
      id: customer.business_id,
      name: customer.business_name,
      category: customer.business_type,
      city: customer.business_city,
    },
    loyaltyPrograms: loyaltyPrograms.map((program) => ({
      name: program.name,
      pointsBalance: Number(program.points_balance),
    })),
    offers: offers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      discountLabel: offer.discount_label,
      couponCode: offer.coupon_code,
      expiresAt: offer.expires_at,
    })),
    loyaltyHistory: loyaltyHistory.map((event) => ({
      points: Number(event.points),
      note: event.note,
      programName: event.program_name,
      createdAt: event.created_at,
    })),
    visits: visits.map((visit) => ({
      programName: visit.program_name,
      visitedAt: visit.scanned_at,
    })),
  };
}
