import { getCustomerDashboard } from "../services/customerService.js";

export async function getCustomerDashboardData(request, response) {
  const data = await getCustomerDashboard(request.auth.sub, request.auth.businessId);
  response.status(200).json(data);
}
