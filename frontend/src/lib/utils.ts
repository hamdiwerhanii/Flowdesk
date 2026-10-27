import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** First path segment, used to keep the locale on hard redirects. */
export const currentLocale = (): string =>
  typeof window === "undefined"
    ? "en"
    : window.location.pathname.split("/").filter(Boolean)[0] || "en";
