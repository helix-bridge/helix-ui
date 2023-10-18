export function isProduction() {
  return process.env.NEXT_PUBLIC_APP_ENV === "production";
}

export function isDevelopment() {
  return process.env.NEXT_PUBLIC_APP_ENV === "development";
}

export function isTest() {
  return process.env.NEXT_PUBLIC_APP_ENV === "test";
}
