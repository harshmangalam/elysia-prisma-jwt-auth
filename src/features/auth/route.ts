import { Elysia } from "elysia";
import { loginBodySchema, signupBodySchema } from "./schema";
import { prisma } from "../../lib/prisma";
import { reverseGeocodingAPI } from "../../lib/geoapify";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/sign-in",
    async ({ body }) => {
      // match user email
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
          email: true,
          password: true,
        },
      });

      if (!user) {
        throw new Error("INCORRECT_ACC_DATA");
      }

      // match password
      const matchPassword = await Bun.password.verify(
        body.password,
        user.password,
        "bcrypt"
      );
      if (!matchPassword) {
        throw new Error("INCORRECT_ACC_DATA");
      }
      return {
        message: "Sig-in successfully",
      };
    },
    {
      body: loginBodySchema,
      error({ error, set }) {
        if (error.message === "INCORRECT_ACC_DATA") {
          set.status = "Bad Request";
          return {
            name: "Bad Request",
            message: "The email address or password you entered is incorrect",
          };
        }
      },
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
              name: "Conflict",
              message: `The email address provided ${body.email} already exists`,
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
