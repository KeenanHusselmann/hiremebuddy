import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Security: escape user-provided text for HTML contexts
export function escapeHTML(input: string = ""): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

// Security: escape strings placed inside single-quoted JS/HTML attributes
export function escapeJSString(input: string = ""): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\"/g, "\\\"")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

// Security: allow only safe http/https URLs
export function safeUrl(url: string = ""): string {
  try {
    const u = new URL(url, window.location.origin);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return u.toString();
    }
    return 'about:blank';
  } catch {
    return 'about:blank';
  }
}
