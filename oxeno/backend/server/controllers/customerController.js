import { getBusinessesByCategory, getBusinessCategories } from "../services/customerService.js";

export async function listBusinessCategories(request, response) {
  const categories = await getBusinessCategories();
  response.status(200).json({ categories });
}

export async function listBusinesses(request, response) {
  const businesses = await getBusinessesByCategory(request.validatedQuery.category);
  response.status(200).json({ businesses });
}
