import {
  awardLoyaltyPoints,
  createOffer,
  getBusinessOffers,
  getLoyaltyOptions,
} from "../services/businessToolsService.js";

export async function getLoyaltyAwardOptions(request, response) {
  const data = await getLoyaltyOptions(request.auth.businessId);
  response.status(200).json(data);
}

export async function awardCustomerLoyaltyPoints(request, response) {
  const result = await awardLoyaltyPoints(request.auth.businessId, request.body);
  response.status(201).json({
    message: `${request.body.points} loyalty points added successfully.`,
    result,
  });
}

export async function createDashboardOffer(request, response) {
  const offer = await createOffer(request.auth.businessId, request.body);
  response.status(201).json({ message: "Offer published successfully.", offer });
}

export async function getDashboardOffers(request, response) {
  const offers = await getBusinessOffers(request.auth.businessId);
  response.status(200).json({ offers });
}
