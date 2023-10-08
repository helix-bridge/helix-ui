export function isProduction() {
  return process.env.NEXT_PUBLIC_NODE_ENV === "production";
}

export function isDevelopment() {
  return process.env.NEXT_PUBLIC_NODE_ENV === "development";
}

export function isTest() {
  return process.env.NEXT_PUBLIC_NODE_ENV === "test";
}
