import { Elysia } from "elysia";
import { loginSchema } from "./schema";

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
  .post("/sign-up", () => {
    return {
      message: "Account created successfully",
    };
  })
  .post("/logout", () => {
    return {
      message: "Logout successfully",
    };
  });
