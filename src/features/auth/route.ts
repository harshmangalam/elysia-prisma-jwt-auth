import { Elysia } from "elysia";
import { loginBodySchema, signupBodySchema } from "./schema";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/sign-in",
    ({ body }) => {
      return {
        message: "Sig-in successfully",
        data: body,
      };
    },
    {
      body: loginBodySchema,
    }
  )
  .post(
    "/sign-up",
    ({ body }) => {
      try {
        return {
          message: "Account created successfully",
        };
      } catch (err) {
        console.log(err);
      }
    },
    {
      body: signupBodySchema,
    }
  )
  .post("/logout", () => {
    return {
      message: "Logout successfully",
    };
  });
