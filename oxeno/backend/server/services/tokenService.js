import jwt from "jsonwebtoken";
import { jwtExpiresIn, jwtSecret } from "../config/environment.js";
import { RequestError } from "../errors/RequestError.js";

const issuer = "oxeno-api";
const audience = "oxeno-client";

export function createAccessToken(account) {
  return jwt.sign(
    {
      sub: account.user.id,
      businessId: account.business.id,
      role: account.user.role,
    },
    jwtSecret,
    {
      algorithm: "HS256",
      audience,
      expiresIn: jwtExpiresIn,
      issuer,
    },
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      audience,
      issuer,
    });
  } catch {
    throw new RequestError(401, "The access token is invalid or expired.", "invalid_token");
  }
}
