import {
  authenticateGoogleAccount,
  authenticatePasswordAccount,
  createAccount,
} from "../services/authService.js";

export async function signup(request, response) {
  const account = await createAccount(request.body);
  response.status(201).json({ message: "Account created successfully.", account });
}

export async function login(request, response) {
  const session = await authenticatePasswordAccount(request.body);
  response.status(200).json({ message: "Login successful.", ...session });
}

export async function googleLogin(request, response) {
  const session = await authenticateGoogleAccount(request.body);
  response.status(200).json({ message: "Google login successful.", ...session });
}

export function getCurrentAccount(request, response) {
  response.status(200).json({ auth: request.auth });
}
