export function cors(allowedOrigins) {
  return (request, response, next) => {
    const origin = request.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      response.set("Access-Control-Allow-Origin", origin);
      response.vary("Origin");
    }

    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }

    next();
  };
}
