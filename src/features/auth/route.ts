import { Elysia } from "elysia";
import { loginBodySchema, signupBodySchema } from "./schema";
import { prisma } from "../../lib/prisma";

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
    async ({ body }) => {
      const user = await prisma.user.create({
        data: {
          ...body,
        },
      });
      return {
        message: "Account created successfully",
        data: {
          user,
        },
      };
    },
    {
      body: signupBodySchema,
      error({ code, set, body }) {
        switch (code as unknown) {
          // handle duplicate email
          case "P2002":
            set.status = "Conflict";
            return {
              error: `The email address provided ${body.email} already exists`,
            };
        }
      },
    }
  )
  .post("/logout", () => {
    return {
      message: "Logout successfully",
    };
  });
