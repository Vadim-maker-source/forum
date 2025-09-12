import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    name: string;
    email: string;
    password?: string | null;
  }
}
