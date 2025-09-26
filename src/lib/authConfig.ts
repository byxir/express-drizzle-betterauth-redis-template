import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import db from "../db/index";
import { user, session, account, verification } from "../model/authModel";
import { and, eq, ne } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user,
      session,
      account,
      verification
    }
  }),
  emailAndPassword: {
    enabled: true
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Enforce single active session per user on email sign-in
      if (ctx.path === "/sign-in/email") {
        type ReturnedPayload = {
          session?: { id?: string; user?: { id?: string }; userId?: string };
          user?: { id?: string };
        };
        const returned = ctx.context?.returned as ReturnedPayload | undefined;
        const currentSessionId: string | undefined = returned?.session?.id;
        const userId: string | undefined =
          returned?.user?.id ?? returned?.session?.user?.id ?? returned?.session?.userId;

        if (userId) {
          if (currentSessionId) {
            await db.delete(session).where(and(eq(session.userId, userId), ne(session.id, currentSessionId)));
          } else {
            await db.delete(session).where(eq(session.userId, userId));
          }
        }
      }
    })
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    }
  }
});
