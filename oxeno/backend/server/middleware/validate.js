import { RequestError } from "../errors/RequestError.js";

export function validateBody(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Request body is invalid.";
      next(new RequestError(400, message, "validation_error"));
      return;
    }

    request.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      const message = result.error.issues[0]?.message || "Request query is invalid.";
      next(new RequestError(400, message, "validation_error"));
      return;
    }

    request.validatedQuery = result.data;
    next();
  };
}
