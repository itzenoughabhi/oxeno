import { RequestError } from "../errors/RequestError.js";
import {
  awardPoints,
  createBusinessOffer,
  listBusinessCustomers,
  listBusinessLoyaltyPrograms,
  listBusinessOffers,
} from "../repositories/businessToolsRepository.js";

export async function getLoyaltyOptions(businessId) {
  const [customers, loyaltyPrograms] = await Promise.all([
    listBusinessCustomers(businessId),
    listBusinessLoyaltyPrograms(businessId),
  ]);

  return {
    customers: customers.map((customer) => ({
      id: customer.id,
      name: customer.full_name,
      email: customer.email,
      mobile: customer.mobile,
    })),
    loyaltyPrograms: loyaltyPrograms.map((program) => ({
      id: program.id,
      name: program.name,
      rewardThreshold: Number(program.reward_threshold),
    })),
  };
}

export async function awardLoyaltyPoints(businessId, data) {
  try {
    return await awardPoints(businessId, data);
  } catch (error) {
    if (error.code === "customer_not_found") {
      throw new RequestError(404, "Customer not found for this business.", error.code);
    }
    if (error.code === "loyalty_program_not_found") {
      throw new RequestError(404, "Loyalty program not found for this business.", error.code);
    }
    throw error;
  }
}

export async function createOffer(businessId, data) {
  return createBusinessOffer(businessId, data);
}

export async function getBusinessOffers(businessId) {
  const offers = await listBusinessOffers(businessId);
  return offers.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description,
    discountLabel: offer.discount_label,
    couponCode: offer.coupon_code,
    expiresAt: offer.expires_at,
    isActive: offer.is_active,
    createdAt: offer.created_at,
  }));
}
