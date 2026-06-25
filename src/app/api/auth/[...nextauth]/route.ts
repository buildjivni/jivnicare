import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/db/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Check if user exists in database
      let dbUser = await prisma.user.findFirst({
        where: { email: user.email },
      });

      // Special bootstrap logic for seeded Admin:
      // If no user has this email, but there's a seeded Admin with no email,
      // we link the logged-in email to that Admin account.
      if (!dbUser) {
        const adminWithoutEmail = await prisma.user.findFirst({
          where: {
            role: Role.ADMIN,
            email: null,
          },
        });
        if (adminWithoutEmail) {
          dbUser = await prisma.user.update({
            where: { id: adminWithoutEmail.id },
            data: { email: user.email },
          });
        }
      }

      // If user still doesn't exist, we allow sign-in so they can link Google accounts during onboarding.
      // They will not get dashboard access because session-callback restricts access by database role.
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findFirst({
          where: { email: user.email },
          include: { doctor: true },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.doctorId = dbUser.doctor?.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).doctorId = token.doctorId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
