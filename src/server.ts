import "./lib/error-capture";

import { renderErrorPage } from "./lib/error-page";

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request) {
    try {
      return new Response(
        "App entry not configured for server-side rendering.",
        {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        },
      );
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
