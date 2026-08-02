import { RequestError } from "../errors/RequestError.js";

export function requireJsonBody(request, response, next) {
  if (request.body === undefined || request.headers["content-length"] === "0") {
    next(new RequestError(400, "Request body is required."));
    return;
  }

  next();
}
