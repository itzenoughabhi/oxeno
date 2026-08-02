import { authenticateCustomer, createCustomerAccount } from "../services/customerService.js";

export async function signupCustomer(request, response) {
  const session = await createCustomerAccount(request.body);
  response.status(201).json({ message: "Customer account created successfully.", ...session });
}

export async function loginCustomer(request, response) {
  const session = await authenticateCustomer(request.body);
  response.status(200).json({ message: "Customer login successful.", ...session });
}

export function getCurrentCustomer(request, response) {
  response.status(200).json({ auth: request.auth });
}
