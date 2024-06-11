import { t } from "elysia";

const loginSchema = {
  body: t.Object({
    email: t.String(),
    password: t.String({ minLength: 8 }),
  }),
};

export { loginSchema };
