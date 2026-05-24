import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on all paths except Next.js internals, static assets, and API routes.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
