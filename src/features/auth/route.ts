import { Elysia } from "elysia";
import { loginBodySchema, signupBodySchema } from "./schema";
import { prisma } from "../../lib/prisma";
import { reverseGeocodingAPI } from "../../lib/geoapify";

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
      // hash password
      const password = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 10,
      });

      // fetch user location from lat & lon
      let location: any;
      if (body.location) {
        const [lat, lon] = body.location;
        location = await reverseGeocodingAPI(lat, lon);
      }
      const user = await prisma.user.create({
        data: {
          ...body,
          password,
          location,
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
