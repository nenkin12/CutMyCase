// Simplified auth - no database required
// Full auth with Prisma will be added when Shopify integration is complete

export async function auth() {
  // Return null session - auth disabled for MVP
  return null;
}

export async function signIn() {
  // Auth disabled for MVP
  return;
}

export async function signOut() {
  // Auth disabled for MVP
  return;
}

// Placeholder handlers for API routes
export const handlers = {
  GET: async () => new Response("Auth disabled", { status: 200 }),
  POST: async () => new Response("Auth disabled", { status: 200 }),
};
