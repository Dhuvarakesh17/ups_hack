import { createAuthClient } from "better-auth/react";

function getClientBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  let raw = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  if (raw.includes("||")) {
    const parts = raw.split("||").map((p) => p.trim()).filter(Boolean);
    raw = parts.find((p) => p.includes("vercel.app") || p.startsWith("https")) || parts[0] || "";
  }
  if (!raw && process.env.NEXT_PUBLIC_VERCEL_URL) {
    raw = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (raw && !raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }
  return raw || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getClientBaseUrl()
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
