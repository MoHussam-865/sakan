/**
 * Typed, validated access to required environment variables.
 * Throws at startup if a required variable is missing, making misconfigurations visible immediately.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  supabase: {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
} as const;
