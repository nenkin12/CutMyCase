import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Admin email - only this user can access admin panel
export const ADMIN_EMAIL = "nukicben@gmail.com";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID and admin status to session
      if (session.user) {
        session.user.id = token.sub!;
        session.user.isAdmin = session.user.email === ADMIN_EMAIL;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: true,
});

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }
}
