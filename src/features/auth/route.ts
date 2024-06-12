import { Elysia } from "elysia";
import { loginBodySchema, signupBodySchema } from "./schema";
import { prisma } from "../../lib/prisma";
import { reverseGeocodingAPI } from "../../lib/geoapify";
import { jwt } from "@elysiajs/jwt";
import {
  ACCESS_TOKEN_EXP,
  JWT_NAME,
  REFRESH_TOKEN_EXP,
} from "../../config/constant";
import { getExpTimestamp } from "../../lib/util";
import { authPlugin } from "../../plugin";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: JWT_NAME,
      secret: Bun.env.JWT_SECRET!,
    })
  )
  .post(
    "/sign-in",
    async ({ body, jwt, cookie: { accessToken, refreshToken } }) => {
      // match user email
      const user = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
          id: true,
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

      // create access token
      const accessJWTToken = await jwt.sign({
        sub: user.id,
        exp: getExpTimestamp(ACCESS_TOKEN_EXP),
      });
      accessToken.set({
        value: accessJWTToken,
        httpOnly: true,
        maxAge: ACCESS_TOKEN_EXP,
        path: "/",
      });

      // create refresh token
      const refreshJWTToken = await jwt.sign({
        sub: user.id,
        exp: getExpTimestamp(REFRESH_TOKEN_EXP),
      });
      refreshToken.set({
        value: refreshJWTToken,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXP,
        path: "/",
      });

      // set user profile as online
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isOnline: true,
          refreshToken: refreshJWTToken,
        },
      });

      return {
        message: "Sig-in successfully",
        data: {
          user: updatedUser,
        },
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
  .use(authPlugin)
  .post("/logout", async ({ cookie: { accessToken, refreshToken }, user }) => {
    // remove refresh token and access token from cookies
    accessToken.remove();
    refreshToken.remove();

    // remove refresh token from db & set user online status to offline
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isOnline: false,
        refreshToken: null,
      },
    });
    return {
      message: "Logout successfully",
    };
  })
  .use(authPlugin)
  .get("/me", ({ user }) => {
    return {
      user,
    };
  });
