export function cors(allowedOrigins) {
  return (request, response, next) => {
    const origin = request.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      response.set("Access-Control-Allow-Origin", origin);
      response.vary("Origin");
    }

    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    // Customer and business dashboards send a JWT using the Authorization header.
    // This header must be explicitly allowed in the browser's CORS preflight response.
    response.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }

    next();
  };
}
