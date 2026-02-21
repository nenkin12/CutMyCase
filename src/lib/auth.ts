// Firebase Auth is used for authentication
// See src/lib/firebase.ts for auth configuration
// See src/components/providers/auth-provider.tsx for auth context

export const ADMIN_EMAIL = "nukicben@gmail.com";

// Legacy exports for API routes (auth is handled client-side with Firebase)
export const handlers = {
  GET: async () => new Response("Use Firebase Auth", { status: 200 }),
  POST: async () => new Response("Use Firebase Auth", { status: 200 }),
};

export async function auth() {
  return null;
}
