import { betterAuth } from "better-auth";

// Sanitize process.env.BETTER_AUTH_URL so betterAuth internal validation never throws ERR_INVALID_URL
function sanitizeAndGetBaseUrl(): string {
  let raw = process.env.BETTER_AUTH_URL || "";

  // If someone put || in the env string, extract the first URL
  if (raw.includes("||")) {
    const parts = raw.split("||").map((p) => p.trim()).filter(Boolean);
    // If running on Vercel (production), look for the vercel.app or https URL
    const vercelPart = parts.find((p) => p.includes("vercel.app") || p.startsWith("https"));
    raw = vercelPart || parts[0] || "";
  }

  // Remove trailing slashes and spaces
  raw = raw.trim().replace(/\/+$/, "");

  // If missing, check VERCEL_URL or NEXT_PUBLIC_APP_URL
  if (!raw) {
    if (process.env.VERCEL_URL) {
      raw = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      raw = process.env.NEXT_PUBLIC_APP_URL;
    } else {
      raw = "http://localhost:3000";
    }
  }

  // Ensure protocol exists
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }

  try {
    const validated = new URL(raw);
    const origin = validated.origin;
    // Overwrite process.env.BETTER_AUTH_URL so betterAuth internal parser doesn't crash
    process.env.BETTER_AUTH_URL = origin;
    return origin;
  } catch {
    const fallback = "http://localhost:3000";
    process.env.BETTER_AUTH_URL = fallback;
    return fallback;
  }
}

const safeBaseUrl = sanitizeAndGetBaseUrl();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "super-secret-one-logistics-auth-key-32chars",
  baseURL: safeBaseUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    }
  }
});
