import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { JWT_NAME } from "./config/constant";
import { prisma } from "./lib/prisma";

export const authenticationPlugin = (app: Elysia) =>
  app
    .use(
      jwt({
        name: JWT_NAME,
        secret: Bun.env.JWT_SECRET!,
      })
    )
    .derive(async ({ jwt, cookie: { accessToken }, set }) => {
      if (!accessToken.value) {
        // handle error for access token is not available
        set.status = "Unauthorized";
        throw new Error("Access token is missing");
      }
      const jwtPayload = await jwt.verify(accessToken.value);
      if (!jwtPayload) {
        // handle error for access token is tempted ot incorrect
        set.status = "Forbidden";
        throw new Error("Access token is invalid");
      }

      const userId = jwtPayload.sub;
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        // handle error for user not found from the provided access token
        set.status = "Forbidden";
        throw new Error("Access token is invalid");
      }

      return {
        user,
      };
    });
