import { RequestError } from "../errors/RequestError.js";
import { verifyAccessToken } from "../services/tokenService.js";

export function authenticate(request, response, next) {
  const authorization = request.get("Authorization");
  const [scheme, token] = authorization?.split(" ") || [];

  if (scheme !== "Bearer" || !token) {
    next(new RequestError(401, "A Bearer access token is required.", "missing_token"));
    return;
  }

  try {
    request.auth = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
