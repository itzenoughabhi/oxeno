import { isProduction } from "../config/environment.js";
import { RequestError } from "../errors/RequestError.js";
import { logger } from "../logger.js";

export function notFound(request, response) {
  response.status(404).json({ error: "Route not found." });
}

export function errorHandler(error, request, response, _next) {
  if (error instanceof RequestError) {
    response.status(error.status).json({ error: error.message, code: error.code });
    return;
  }
  if (error?.type === "entity.too.large") {
    response.status(413).json({ error: "Request body is too large." });
    return;
  }
  if (error?.type === "entity.parse.failed") {
    response.status(400).json({ error: "Request body must be valid JSON." });
    return;
  }
  if (error?.code === "23505") {
    const isCustomerConflict = [
      "customers_business_id_email_key",
      "customers_mobile_unique_idx",
      "customers_email_unique_idx",
    ].includes(error.constraint);
    const isOfferCouponConflict = error.constraint === "offers_business_coupon_code_unique_idx";
    response.status(409).json({
      error: isCustomerConflict
        ? "A customer account with this email or WhatsApp number already exists. Please log in."
        : isOfferCouponConflict
          ? "This coupon code is already being used by one of your offers."
          : "An account with this business email already exists.",
    });
    return;
  }

  (request.log || logger).error({ err: error, statusCode: 500 }, "API request failed");
  const safeMessage = isProduction
    ? "Unable to complete the request. Please try again."
    : error.message || "Unable to complete the request. Please try again.";
  response.status(500).json({ error: safeMessage });
}
