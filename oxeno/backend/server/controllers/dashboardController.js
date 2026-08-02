import { getDashboardData } from "../services/dashboardService.js";

export async function getDashboard(request, response) {
  const businessId = request.auth?.businessId;
  const data = await getDashboardData(businessId);
  response.status(200).json(data);
}
