# Eduosmosis backend

## Backend source structure

```text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── stripe.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── planController.js
│   │   └── schoolController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── models/
│   │   ├── Payment.js
│   │   ├── Plan.js
│   │   ├── School.js
│   │   └── User.js
│   └── routes/
│       ├── adminRoutes.js
│       ├── authRoutes.js
│       ├── planRoutes.js
│       └── schoolRoutes.js
├── scripts/
│   └── createPlatformAdmin.js
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

## Install and run

Node.js and MongoDB (local or Atlas) are required. From the backend directory:

```powershell
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Set `MONGO_URL`, `JWT_SECRET`, and the Stripe keys in `.env` before using database
or subscription features. Keep `.env` private; it is ignored by Git.

The API defaults to `http://localhost:5000`. Check it with
`GET /api/health`.

## Create the platform owner account

The platform owner is separate from school administrators and does not need a
school record. Set `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`,
`PLATFORM_ADMIN_FIRST_NAME`, and `PLATFORM_ADMIN_LAST_NAME` in the local `.env`
file, with `MONGO_URL` configured, then run this once:

```powershell
npm run create:platform-admin
```

The script refuses to overwrite an existing account or create a second platform
owner. Sign in at `/login`; the admin/teacher login accepts the platform owner
role too. Do not commit `.env` or share its password.

## Initial API routes

- `POST /api/schools/create` — create a school and its initial administrator.
- `POST /api/auth/login` — sign in with the account credentials.
- `POST /api/admin/create-teacher` — administrator creates a teacher account.
- `POST /api/admin/create-admin` — administrator creates another school administrator.
- `GET /api/admin/teacher-admins` — list teachers and administrators for the signed-in school.
- `POST /api/admin/create-student` — administrator creates a student account.
- `POST /api/admin/create-parent` — administrator creates a parent account.
- `GET /api/plans` — retrieve available subscription plans.

Admin account creation endpoints require a valid administrator bearer token.
