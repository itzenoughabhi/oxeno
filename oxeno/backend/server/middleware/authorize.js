import { RequestError } from "../errors/RequestError.js";

export function requireRoles(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.auth?.role)) {
      next(
        new RequestError(403, "You do not have permission to access this resource.", "forbidden"),
      );
      return;
    }

    next();
  };
}
