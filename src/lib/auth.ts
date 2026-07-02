import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserRole } from "@/types";
import type { NextAuthConfig } from "next-auth";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async authorized({ request: { nextUrl }, auth }) {
      const user = auth?.user;
      const isAdmin = user?.role === "ADMIN";
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      // Admin trying to access login → redirect to admin dashboard
      if (isAdmin && isOnLogin) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      // Non-admin trying to access admin → redirect home
      if (!isAdmin && isOnAdmin) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative redirects
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows same-origin URLs
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
