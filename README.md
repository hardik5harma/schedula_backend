# Schedula Backend API

This is a simple backend API for managing doctors, patients, and authentication using NestJS.

## API Endpoints

### Auth Endpoints (`/api/v1/auth`)
- `POST /signup` — Register a new user (doctor or patient). Body: `{ email, password, role, ...fields }`
- `POST /signin` — Login and receive JWT tokens. Body: `{ email, password }`
- `POST /signout` — Sign out a doctor. Body: `{ doctorId }`
- `POST /refresh` — Refresh access token. Body: `{ doctorId, refreshToken }`

### Patient Endpoints (`/api/v1/patient`)
- `GET /profile` — Get the profile of the authenticated patient. (Requires Bearer JWT and patient role)

### Doctor Endpoints (`/api/v1/doctor`)
- `GET /profile` — Get the profile of the authenticated doctor. (Requires Bearer JWT and doctor role)

## Testing with Postman

1. **Signup**
   - Send a `POST` request to `/api/v1/auth/signup` with user details in the body.
2. **Signin**
   - Send a `POST` request to `/api/v1/auth/signin` with `{ email, password }`.
   - Copy the `access_token` from the response.
3. **Authenticated Requests**
   - For endpoints like `/api/v1/patient/profile` or `/api/v1/doctor/profile`, add an `Authorization` header:
     - `Authorization: Bearer <access_token>`
4. **Refresh Token**
   - Use `/api/v1/auth/refresh` with the required body to get a new access token.

## Notes
- Use the correct role (`doctor` or `patient`) when signing up.
- JWT secret and other environment variables should be set in your environment.

---
For more details, check the controller files in `src/`. 