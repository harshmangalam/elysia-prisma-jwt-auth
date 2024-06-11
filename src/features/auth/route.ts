import { Elysia } from "elysia";
import { loginSchema, signupSchema } from "./schema";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/sign-in",
    ({ body }) => {
      return {
        message: "Sig-in successfully",
      };
    },
    loginSchema
  )
  .post(
    "/sign-up",
    ({ body }) => {
      return {
        message: "Account created successfully",
      };
    },
    signupSchema
  )
  .post("/logout", () => {
    return {
      message: "Logout successfully",
    };
  });
