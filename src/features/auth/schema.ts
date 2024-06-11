import { t } from "elysia";

const loginSchema = {
  body: t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
  }),
};

const signupSchema = {
  body: t.Object({
    name: t.String({ maxLength: 60, minLength: 1 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
    location: t.Optional(t.Tuple([t.Number(), t.Number()])),
    isAdult: t.Boolean(),
  }),
};
export { loginSchema, signupSchema };
