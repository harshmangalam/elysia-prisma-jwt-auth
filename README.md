# JWT Authentication with Bun(Elysia)

## Tech Stack

- Bun
- Elysia
- Prisma
- Postgresql
- Typescript

## Setup

Install dependencies

```
bun i
```

Copy `.env.example` to `.env`

```
cp .env.example .env
```

Sync prisma schema with db

```
bun run prisma:push
```

## Route

- POST `/api/auth/sign-up` - Create new account
- POST `/api/auth/sign-in` - Sign in to existing account
- GET `/api/auth/me` - Fetch current user
- POST `/api/auth/logout` - Logout current user
- POST `/api/auth/refresh` - Create new pair of access & refresh token from existing refresh token

## Authentication work flow

- Sign in

  - Verify user email & password
  - Create pair of access token and refresj token
  - Save refresh token in db for further uses
  - Set access token and refresh token in response cookies

- Protected route `/me`
  - verify jwt access token in plugin
  - If access token is missing raise 401 status code error
  - If access token is available but incorrect/expire raise 403 status code error
  - In case of 403 error client can request for `/refresh` to generate new pair of access/refresh token
  - In success case find the user from db and set using `derive` function
  - Now `/me` can get user and return as a response
