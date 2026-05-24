import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Type-safe locale-aware navigation helpers scoped to the app's routing config.
 * Import Link, redirect, usePathname, useRouter from here instead of next/navigation.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
