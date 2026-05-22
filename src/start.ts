import { renderErrorPage } from "./lib/error-page";

export const startInstance = {
  getOptions: async () => ({ requestMiddleware: [] }),
};
