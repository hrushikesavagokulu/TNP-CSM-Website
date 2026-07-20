# TMP — CSM Department Web Platform
## Ready-to-Paste Antigravity Prompts, Phase by Phase

Each phase below is a **complete, self-contained prompt**. Copy everything inside the fenced
block for a phase into a **fresh Antigravity session** (don't reuse one long session for
multiple phases — that dilutes context and increases drift). Run backend tasks first, verify
with curl/Postman against the listed API contract, *then* let it build the frontend for that
same phase. Only start the next phase's prompt after this phase's "Definition of Done" checklist
passes for real.

**Stack (do not deviate):** React 18 + Vite, Tailwind CSS, React Router v6, @tanstack/react-query,
Axios, socket.io-client · Express.js (Node 20), Mongoose/MongoDB, Redis, Socket.io + Redis
adapter, JWT + bcrypt, Nodemailer, Google Drive API, Zoom Server-to-Server OAuth, Docker +
Docker Compose.

**Global conventions to remind the agent of in every phase (already embedded in each prompt
below, but keep in mind if you shorten anything):**
- API base path `/api/v1/...`, response envelope `{ success, data, message, error }`.
- All protected routes go through `auth.middleware.js`; admin-only routes additionally through
  `role.middleware.js` (`requireRole('admin')`).
- Never trust the frontend to hide sensitive fields — shape API responses server-side.
- Reuse shared components/services across phases instead of duplicating them (the prompts below
  explicitly call this out wherever it applies).

---

## PHASE 0 PROMPT — Infrastructure & Scaffolding

```
ROLE: You are an expert full-stack developer (Node/Express/MongoDB + React/Vite) setting up the
initial scaffolding for a new project called "TMP — CSM Department Web Platform" for the GPREC
CSM department. This is Phase 0 of 13 — pure infrastructure, no feature code yet.

STACK: React 18 + Vite + Tailwind CSS + React Router v6 + @tanstack/react-query + Axios +
socket.io-client on the frontend. Express.js (Node 20) + Mongoose/MongoDB + Redis + Socket.io on
the backend. Everything runs in Docker via docker-compose with 4 services: frontend, backend,
mongo, redis (a 5th nginx-proxy service is optional at this stage, add a placeholder folder for
it but we'll configure it fully in the final deployment phase).

YOUR TASK: Scaffold both the backend and frontend projects, wire them together, and get all
containers building and running together, with a working health-check round trip from frontend
to backend to Mongo/Redis. No feature/business logic yet.

BACKEND — create exactly this:
- Initialize `backend/` as a Node 20 project: package.json with express, mongoose, dotenv, cors,
  helmet, morgan, ioredis (or node-redis), nodemon (dev dependency).
- `backend/server.js` — entry point: creates the HTTP server, will later attach Socket.io, starts
  the Express app listening on process.env.PORT (default 5000).
- `backend/src/app.js` — Express app: middleware chain in this exact order: cors (allow only
  process.env.FRONTEND_ORIGIN with credentials), helmet, morgan('dev'), express.json(),
  express.urlencoded({extended:true}), then route mounting, then error handler last.
- `backend/src/config/env.js` — reads and validates required env vars (PORT, MONGO_URI,
  REDIS_URL, FRONTEND_ORIGIN at minimum for this phase); throws and exits process if any required
  var is missing, so failures happen at boot, not mid-request.
- `backend/src/config/db.js` — Mongoose connection to MONGO_URI with retry-on-fail (retry every
  5s up to 10 times before giving up), logs connection state changes.
- `backend/src/config/redis.js` — Redis client connected to REDIS_URL, exported as a singleton,
  logs connection state changes.
- `backend/src/utils/apiResponse.js` — exports a helper `sendResponse(res, statusCode, {success,
  data, message, error})` so every future controller uses one consistent response shape.
- `backend/src/utils/asyncHandler.js` — exports a wrapper `asyncHandler(fn)` that catches
  rejected promises from async route handlers and forwards them to Express's `next(err)`.
- `backend/src/middleware/errorHandler.middleware.js` — centralized error handler: catches any
  error forwarded via `next(err)`, logs it server-side, and responds with
  `{success:false, message, error}` and an appropriate status code (default 500). Mount this as
  the LAST middleware in app.js.
- `backend/src/routes/index.js` — mounts a health route: `GET /api/v1/health` that pings Mongo
  and Redis and returns `{success:true, data:{status:"ok", mongo:"connected", redis:"connected"}}`.
- `backend/Dockerfile` — `node:20-alpine`, copy package files, `npm ci`, copy rest, expose 5000,
  `CMD ["node","server.js"]`.

FRONTEND — create exactly this:
- Scaffold `frontend/` with Vite + React 18 (`npm create vite@latest frontend -- --template react`).
- Install and configure: tailwindcss (with postcss/autoprefixer), react-router-dom v6, axios,
  @tanstack/react-query, socket.io-client.
- `frontend/tailwind.config.js` — set up `darkMode: 'class'` or attribute-based strategy (we will
  wire dark/light theming fully in Phase 1/2, but configure the mechanism now so it isn't
  retrofitted later).
- `frontend/src/services/api.js` — a base Axios instance with `baseURL: '/api/v1'`,
  `withCredentials: true` (we'll use httpOnly cookies for auth starting Phase 1).
- `frontend/src/App.jsx` — a single placeholder route `/` that renders "TMP Platform — Coming
  Soon" and, on mount, calls `GET /api/v1/health` via the api.js instance and displays the raw
  JSON result on screen (this is our end-to-end connectivity proof for this phase only — it will
  be replaced by the real Home page in a later phase).
- `frontend/Dockerfile` — multi-stage: stage 1 `node:20-alpine`, `npm ci && npm run build`; stage
  2 `nginx:alpine`, copy the build output to `/usr/share/nginx/html`.
- `frontend/nginx.conf` — serve static files at `/`, proxy `/api/` requests to `http://backend:5000/api/`.

DOCKER — create exactly this at the project root:
- `docker-compose.yml` with 4 services (frontend, backend, mongo, redis) on a custom bridge
  network `tmp-net`. `mongo` uses image `mongo:7` with a named volume `mongo-data:/data/db`.
  `redis` uses image `redis:7-alpine` with a named volume `redis-data:/data`. `backend` depends
  on mongo and redis, reads its config from a `.env` file, exposes port 5000 internally only.
  `frontend` depends on backend, exposes port 80 to the host as `3000:80`.
  Also create `mongo-data`, `redis-data` as top-level named volumes.
- `.env.example` at the project root listing at minimum: `PORT=5000`,
  `MONGO_URI=mongodb://mongo:27017/tmp_db`, `REDIS_URL=redis://redis:6379`,
  `FRONTEND_ORIGIN=http://localhost:3000`.

WHEN DONE, VERIFY (do this yourself and report the results, don't just assume it works):
1. `docker compose build` completes for all 4 services with zero errors.
2. `docker compose up -d` brings up all 4 containers; `docker compose ps` shows all of them
   running/healthy.
3. Visiting `http://localhost:3000` in a browser shows the placeholder page and it successfully
   displays `{status:"ok", mongo:"connected", redis:"connected"}` fetched from the backend.
4. `docker compose down && docker compose up -d` — confirm data volumes persist (no need for real
   data yet, just confirm the containers reconnect without volume-related errors).

Do NOT build any authentication, user models, or UI beyond the placeholder page in this phase —
that is Phase 1's job. Keep this phase strictly to infrastructure.
```

---

## PHASE 1 PROMPT — Authentication & Authorization

```
ROLE: You are an expert full-stack developer continuing work on "TMP — CSM Department Web
Platform". Phase 0 (Docker scaffolding for frontend/backend/mongo/redis, health-check endpoint,
base Express/React setup) is already complete and working. This is Phase 1 of 13.

CONTEXT — WHAT ALREADY EXISTS: backend/src/app.js with cors/helmet/morgan/json middleware chain
and errorHandler.middleware.js mounted last; backend/src/config/db.js and redis.js;
backend/src/utils/apiResponse.js and asyncHandler.js; backend/src/routes/index.js mounting
`/api/v1/health`. frontend/src/services/api.js with an Axios instance baseURL `/api/v1` and
withCredentials true. Docker Compose brings up frontend+backend+mongo+redis successfully.

YOUR TASK THIS PHASE: Build complete authentication — OTP-verified registration, login, JWT
session handling with role-based middleware, and an OTP-verified forgot-password flow. Also
build the app's global dark/light theme system now (needed on every page from here on).

BACKEND — build exactly this:

1. Models:
   - `backend/src/models/User.model.js` — build the FULL schema now (even though most fields are
     unused until later phases, so we never have to migrate it):
     `name` (String, required), `rollNo` (String, unique, indexed, required),
     `email` (String, unique, indexed, required, lowercase),
     `passwordHash` (String, required, select:false),
     `phone` (String), `parentPhone` (String),
     `branch` (String), `year` (Number, enum [1,2,3,4]),
     `batchType` (String, enum ['smart','tap','itca','nonItca', null], default null),
     `role` (String, enum ['student','admin'], default 'student'),
     `isSuperAdmin` (Boolean, default false),
     `profileImage` (String, default null),
     `isHostel` (Boolean), `laptopAvailable` (Boolean), `mncOrHigherEd` (Boolean),
     `skills` ([String]), `links` ({linkedin, github, leetcode, portfolio}),
     `projectLinks` ([String]),
     `achievements` ([{title, fileUrl, fileType, description, date}]),
     `progress` ({roadmapChecklist: [{itemId, done: Boolean, doneAt: Date}], completionPercent:
     {type:Number, default:0}}),
     `isActive` (Boolean, default true),
     timestamps: true.
     Indexes: unique on email, unique on rollNo, compound index on {year, batchType}.
   - `backend/src/models/OtpToken.model.js` — `email` (String, required, indexed), `otpHash`
     (String, required), `purpose` (String, enum ['register','login-reset',
     'profile-password-change'], required), `expiresAt` (Date, required, with a TTL index:
     `{expireAfterSeconds: 0}` so Mongo auto-deletes expired docs), `attempts` (Number, default 0),
     `verified` (Boolean, default false).

2. Config/services:
   - `backend/src/config/mailer.js` — Nodemailer transporter built from SMTP_HOST/PORT/USER/PASS
     env vars.
   - `backend/src/services/email.service.js` — exports `sendOtpEmail(toEmail, otpCode, purpose)`
     with a clean HTML template ("Your TMP verification code is: {code}. It expires in 10
     minutes."), and a `sendGenericEmail(to, subject, html)` helper for reuse later.
   - `backend/src/services/otp.service.js` — exports:
     - `generateAndSendOtp(email, purpose)`: generates a random 6-digit numeric code, bcrypt-hashes
       it (cost 10), checks Redis for an existing cooldown key `otp-cooldown:{email}:{purpose}`
       and rejects with a clear error if present (429), otherwise deletes any prior unverified
       OtpToken docs for that email+purpose, creates a new OtpToken doc with
       `expiresAt = now + 10 minutes`, sets the Redis cooldown key with a 60s TTL, and calls
       email.service.js to actually send the code.
     - `verifyOtp(email, purpose, submittedCode)`: fetches the latest OtpToken doc for
       email+purpose, returns a clear error if none exists or it's expired, returns a clear error
       and increments `attempts` if `bcrypt.compare` fails, blocks with an error if `attempts >= 5`,
       and on success marks it `verified:true` and returns true (caller decides what to do next —
       this service does not delete the doc itself so callers can still reference it if needed;
       instead rely on the TTL index for cleanup).
   - `backend/src/utils/generateTokens.js` — exports `generateAccessToken(userId, role)` (JWT,
     15 min expiry, signed with JWT_ACCESS_SECRET) and `generateRefreshToken(userId)` (JWT, 7 day
     expiry, signed with JWT_REFRESH_SECRET), plus matching verify functions.

3. Middleware:
   - `backend/src/middleware/auth.middleware.js` — reads the access token from an httpOnly cookie
     named `accessToken`, verifies it, fetches the user from Mongo (excluding passwordHash),
     attaches it as `req.user`, calls next(); on any failure responds 401 via apiResponse.js.
   - `backend/src/middleware/role.middleware.js` — exports a factory `requireRole(...roles)` that
     checks `req.user.role` is included in `roles`, else responds 403.
   - `backend/src/middleware/rateLimiter.middleware.js` — using `express-rate-limit` with a Redis
     store (rate-limit-redis), create and export a limiter for auth routes: max 10 requests per 15
     minutes per IP for `/auth/*`.
   - `backend/src/middleware/validate.middleware.js` — a generic wrapper that takes a Joi (or Zod)
     schema and validates `req.body`, responding 400 with validation error details on failure.

4. Validators: `backend/src/validators/auth.validators.js` — Joi/Zod schemas for register
   (name, rollNo, email must match ALLOWED_EMAIL_DOMAIN from env, phone, branch, password min 8
   chars with at least one number), login (email, password), verify-otp (email, otp exactly 6
   digits), forgot-password (email), verify-reset-otp (email, otp), reset-password (resetToken,
   newPassword).

5. Controller + routes: `backend/src/controllers/auth.controller.js` +
   `backend/src/routes/auth.routes.js`, mounted at `/api/v1/auth`:
   - `POST /auth/check-availability` — body `{rollNo, email}`, returns which of the two (if any)
     is already taken, so the frontend can show inline errors before OTP is even sent.
   - `POST /auth/register` — validates body against the register schema, checks
     rollNo/email uniqueness again server-side (never trust the check-availability call alone),
     temporarily stashes the registration payload (e.g. in a short-lived Redis key keyed by email,
     TTL 15 min, NOT yet a User doc) since the User isn't created until OTP is verified, then
     calls `otp.service.generateAndSendOtp(email, 'register')`. Responds
     `{success:true, message:"OTP sent to your email"}`.
   - `POST /auth/verify-otp` — body `{email, otp}`, calls
     `otp.service.verifyOtp(email,'register',otp)`; on success, retrieves the stashed registration
     payload from Redis, bcrypt-hashes the password (cost 12), creates the User doc, deletes the
     Redis stash key, generates access+refresh JWTs, sets them as httpOnly/Secure/SameSite=strict
     cookies, responds with the created user object (passwordHash excluded).
   - `POST /auth/login` — body `{email, password}`, finds user by email (must explicitly
     `.select('+passwordHash')` since it's excluded by default), bcrypt.compare, on failure
     responds a GENERIC "Invalid email or password" error (do not reveal which field was wrong),
     on success issues JWT cookies same as above and responds with the user object.
   - `POST /auth/forgot-password` — body `{email}`; ALWAYS responds the same generic message
     ("If this email exists, an OTP has been sent") regardless of whether the email exists, to
     prevent user enumeration — but only actually calls generateAndSendOtp if the email is real.
   - `POST /auth/verify-reset-otp` — body `{email, otp}`, verifies via otp.service with purpose
     'login-reset', on success issues a short-lived (10 min) signed `resetToken` (JWT containing
     the email) and returns it in the response body (not a cookie).
   - `POST /auth/reset-password` — body `{resetToken, newPassword}`, verifies the resetToken,
     bcrypt-hashes the new password, updates the User doc, responds success.
   - `POST /auth/logout` — clears both cookies, responds success.
   - `POST /auth/refresh-token` — reads the refreshToken cookie, verifies it, issues a new access
     token cookie (and rotates the refresh token cookie too), responds success.
   Apply `rateLimiter.middleware.js` to every route in this file.

FRONTEND — build exactly this:

1. `frontend/src/context/ThemeContext.jsx` — provides `{theme, toggleTheme}`; sets
   `document.documentElement.setAttribute('data-theme', theme)`; persists to `localStorage` under
   key `tmp-theme`; defaults to `'light'` on first visit if nothing is in localStorage.
2. `frontend/src/styles/theme-variables.css` — define CSS custom properties for both
   `[data-theme="light"]` and `[data-theme="dark"]` (background, surface, text-primary,
   text-secondary, border, accent colors at minimum) — import this in `index.css` alongside
   Tailwind's base/components/utilities layers. Every component built from here on must use these
   variables (via Tailwind arbitrary values or a Tailwind theme extension), never hardcoded hex.
3. `frontend/src/components/shared/ThemeToggle.jsx` — a sun/moon icon button that calls
   `toggleTheme()`.
4. `frontend/src/context/AuthContext.jsx` — provides `{user, login(email,password),
   register(payload), verifyOtp(email,otp), logout(), loading}`; on mount, calls a
   `GET /auth/me`-equivalent (or simply attempts `/student/profile/me` once that exists in Phase
   2 — for THIS phase, it's fine if AuthContext just tracks user state purely from the
   login/register response and doesn't try to rehydrate on refresh yet; note this as a known
   limitation to revisit in Phase 2). Wire an Axios response interceptor in `services/api.js`:
   on a 401 response (and the failed request wasn't itself `/auth/refresh-token`), attempt
   `POST /auth/refresh-token` once, then retry the original request; if refresh also fails, clear
   local auth state.
5. `frontend/src/components/shared/OtpInput.jsx` — 6 individual digit boxes with auto-advance
   focus, backspace-to-previous-box behavior, a resend button with a 60-second countdown that
   disables itself until the countdown reaches zero, and an `onComplete(code)` callback fired when
   all 6 digits are filled.
6. `frontend/src/components/layout/Navbar.jsx` — logo/wordmark placeholder text on the left,
   `ThemeToggle` on the right, and auth-aware buttons on the right: if `!user`, show "Login" and
   "Register" buttons linking to `/login` and `/register`; if `user`, show a "Dashboard" button
   (the target route doesn't exist until Phase 2 — that's fine, wire the link anyway) and a
   "Logout" button that calls `logout()`.
7. `frontend/src/routes/PublicRoute.jsx` — a wrapper that redirects to `/dashboard` if `user` is
   already set in AuthContext, otherwise renders its children.
8. Pages:
   - `frontend/src/pages/public/Register.jsx` — form fields: Name, Roll No, College Gmail,
     Password, Retype Password, Phone, Branch (dropdown with a few hardcoded branch options for
     now). Debounce a `check-availability` call on rollNo/email blur. A "Send OTP" button next to
     the email field that calls `POST /auth/register` and then reveals the `OtpInput` component.
     On OTP complete, calls `POST /auth/verify-otp`; on success, updates AuthContext user state and
     navigates to `/dashboard`. Client-side validation matching the backend rules (password
     strength, retype match) with inline error messages.
   - `frontend/src/pages/public/Login.jsx` — Email, Password (with show/hide toggle), "Login"
     button, "Forgot Password?" link, "New here? Register" link. On success, updates AuthContext
     and navigates to `/dashboard` if role is student or `/admin` if role is admin.
   - `frontend/src/pages/public/ForgotPassword.jsx` — 3-step UI: (1) email input + "Send OTP" →
     calls `POST /auth/forgot-password`; (2) `OtpInput` → calls `POST /auth/verify-reset-otp`,
     stores the returned `resetToken` in component state; (3) New Password + Retype Password →
     calls `POST /auth/reset-password` with the stored resetToken, on success navigates to
     `/login` with a success toast/message.
9. `frontend/src/services/auth.service.js` — thin wrapper functions around every `/auth/*` route
   above, used by AuthContext and the pages.
10. Update `frontend/src/App.jsx` — wrap the app in `ThemeContext.Provider` and
    `AuthContext.Provider` (in that order, outermost first), replace the Phase-0 placeholder route
    with real routes: `/` (still a placeholder for now — Home page is Phase 4, but wrap it with
    `<Navbar />` so we can visually confirm auth-aware buttons work), `/login`, `/register`,
    `/forgot-password` (all three wrapped in `PublicRoute`).

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. Register with a real email on the ALLOWED_EMAIL_DOMAIN → OTP actually arrives by email (not
   just logged to console) within a few seconds.
2. Submitting a wrong OTP shows an inline error and decrements a visible "attempts remaining"
   count; the 6th wrong attempt is blocked with a clear message.
3. Clicking "Resend" before 60 seconds have passed is disabled/rejected; after 60 seconds it
   works and a new email arrives.
4. Successful OTP verification logs the user in immediately without a separate login step, and
   redirects to `/dashboard` (even though that route is just a stub right now).
5. Attempting to register a second time with the same roll number or email is blocked before OTP
   is even sent, with a clear inline message.
6. Login with a wrong password shows a generic error that does NOT reveal whether the email or
   password was wrong.
7. The full forgot-password flow (email → OTP → new password) works, and afterward the OLD
   password no longer logs in while the NEW one does.
8. Open browser devtools → Application → Cookies: confirm `accessToken` and `refreshToken` are
   both httpOnly (JS cannot read them via `document.cookie`).
9. Toggling the theme switches every themed element instantly and the choice survives a full page
   refresh.
10. Temporarily add one throwaway test route gated with `requireRole('admin')`; confirm a
    logged-in student gets 403 and an unauthenticated request gets 401; then delete the throwaway
    route once confirmed.

Do NOT build the dashboard shell, profile page, or any admin functionality yet — those are later
phases. Keep this phase strictly to auth + theming.
```

---

## PHASE 2 PROMPT — Dashboard Shell & Profile Module

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–1 are complete:
Docker scaffolding, and full authentication (OTP register/login/forgot-password, JWT cookies,
auth.middleware.js, role.middleware.js, ThemeContext, AuthContext, Navbar). This is Phase 2 of 13.

CONTEXT — WHAT ALREADY EXISTS: `User.model.js` has the FULL schema already (all profile fields
exist, just unused so far). `auth.middleware.js` attaches `req.user`. `AuthContext.jsx` tracks the
logged-in user client-side but does NOT yet rehydrate on page refresh — fix that in this phase.
`ThemeToggle`, `OtpInput`, `Navbar` all exist and should be reused, not recreated.

YOUR TASK THIS PHASE: Build the authenticated dashboard shell (sidebar + layout used by every
student page from now on) and a fully working Profile module: self-view/edit, OTP-verified
password change, peer-view with server-enforced field hiding, and student search.

BACKEND — build exactly this:

1. New minimal model: `backend/src/models/SkillsCatalogue.model.js` — a simple collection of
   admin-curated skill names: `{name: String, unique: true}`. Seed it with ~20 common CS/ML skill
   names (e.g. "Data Structures", "React", "Python", "Machine Learning", "SQL", "Docker", etc.) via
   a one-time seed script `backend/src/scripts/seedSkills.js` runnable with `node
   src/scripts/seedSkills.js`.

2. `backend/src/middleware/upload.middleware.js` — configure `multer` with memory storage
   (`multer.memoryStorage()`), a file-size limit (5MB for images, 10MB for documents — make this
   configurable per use), and a MIME-type allow-list function parameterized so different routes
   can allow different types (this will be reused in later phases for event certs and
   announcement attachments too).

3. `backend/src/services/progress.service.js` — exports `recalculateCompletionPercent(userId)`:
   counts `done:true` entries in `user.progress.roadmapChecklist` against the total number of
   SkillRoadmap items that currently exist in the DB, updates
   `user.progress.completionPercent` accordingly. (The roadmap items themselves don't exist until
   Phase 7 — for now, write this function defensively so it returns 0% gracefully if there are no
   roadmap items yet, and write a passing unit test for that empty-state case.)

4. `backend/src/controllers/profile.controller.js` + `backend/src/routes/student/profile.routes.js`
   mounted at `/api/v1/student`:
   - `GET /student/profile/me` — returns the full `req.user` document (all fields, since it's the
     owner viewing their own data).
   - `GET /student/profile/:rollNo` — looks up the user by rollNo. THIS IS THE CRITICAL
     SECURITY-SENSITIVE ENDPOINT: shape the response based on `req.user.role`:
     - if `req.user.role === 'admin'` OR `req.user.rollNo === params.rollNo` (viewing own profile
       via this route too): return everything.
     - else (a peer viewing someone else): return everything EXCEPT `phone`, `parentPhone`, and
       `profileImage` (replace `profileImage` with `null` and add a boolean flag
       `isPhotoHidden:true` so frontend can show a placeholder instead of guessing). Also strip
       `passwordHash` always regardless of role (should already be excluded by default schema
       select, but double-check explicitly here too as defense in depth).
   - `PATCH /student/profile/me` — accepts a partial body of any of: phone, parentPhone, branch,
     isHostel, laptopAvailable, mncOrHigherEd, skills, links, projectLinks, profileImage. EXPLICITLY
     reject the request with 400 if the body contains `email` or `rollNo` keys at all, even if
     they match the existing values — respond with a clear error message naming which field was
     rejected.
   - `POST /student/profile/change-password` — two-step: if body only has `{}`  (or an explicit
     `{action:'request'}`), calls `otp.service.generateAndSendOtp(req.user.email,
     'profile-password-change')` and returns "OTP sent"; if body has `{otp, newPassword}`, verifies
     the OTP via `otp.service.verifyOtp(...)`, and if valid, bcrypt-hashes and updates the
     passwordHash, responds success. (Design this as whatever two-call shape feels cleanest, just
     keep it OTP-gated and document the exact request/response shapes you land on in code
     comments so the frontend can match them precisely.)
   - `GET /student/search?query=` — case-insensitive partial match against `name` OR `rollNo`
     (use a MongoDB regex query or text index — either is fine), returns a lightweight array of
     `{name, rollNo, profileImage}` for matches (max 20 results), EXCLUDING the requester
     themselves from results.
   - `GET /skills-catalogue` (mount this one directly under `/api/v1`, not under `/student`, since
     it's a simple shared lookup) — returns the full list of skill names.
   All routes in this file require `auth.middleware.js`.

5. `POST /student/profile/upload-photo` and `POST /student/profile/upload-achievement` — two
   thin upload endpoints using `upload.middleware.js`, storing files to a local
   `backend/uploads/profile-photos/` and `backend/uploads/achievements/` directory respectively
   (served statically via `express.static` mounted at `/uploads` in app.js), returning the public
   URL to be saved into the User doc's `profileImage` or `achievements[].fileUrl` field by the
   frontend's subsequent PATCH call.

FRONTEND — build exactly this:

1. Fix `AuthContext.jsx` from Phase 1: on app mount, call `GET /student/profile/me`; if it
   succeeds, populate `user` state (the user IS authenticated via cookie even after a refresh);
   if it 401s, leave `user` as null. Show a loading spinner at the app root until this initial
   check resolves, so `PrivateRoute`/`PublicRoute` don't flash-redirect incorrectly.

2. `frontend/src/routes/PrivateRoute.jsx` — redirects to `/login` if `!user` (after the initial
   auth check above has resolved), otherwise renders children.

3. `frontend/src/components/layout/DashboardSidebar.jsx` — a collapsible left sidebar (collapse
   toggle for mobile) listing nav items for every module: Dashboard, Profile, Announcements,
   Events, Skill Roadmap, Certifications, Companies, Alumni Repos, Achievements, Learning
   Resources, Resume Guide, Connect Sphere. Most of these routes don't exist yet — link them
   anyway using the exact paths from the design doc (`/dashboard/announcements`,
   `/dashboard/events`, etc.) so later phases just need to add the page component; clicking an
   unbuilt link is fine to 404 for now.

4. A shared dashboard layout component (e.g. `frontend/src/components/layout/DashboardLayout.jsx`)
   combining `Navbar` (reused from Phase 1, now showing a working Logout since AuthContext is
   fixed) + `DashboardSidebar` + an `<Outlet />` for the routed page content. Wrap all
   `/dashboard/*` routes in this layout plus `PrivateRoute`.

5. `frontend/src/components/shared/ProgressRing.jsx` — an SVG circular progress ring accepting a
   `percent` prop (0-100), with a friendly empty-state style (e.g. a dashed/muted ring plus "Get
   started!" text) when percent is exactly 0.

6. `frontend/src/pages/dashboard/DashboardHome.jsx` — for THIS phase, build: the profile-card
   section (photo, name, roll-no snippet, `ProgressRing` fed from `user.progress.completionPercent`,
   clicking it navigates to `/dashboard/profile`) and a module grid of static/disabled tiles for
   every module named in step 3 above (no live data yet — Events/Announcements tabs and real
   counts arrive in Phases 5/6; render them now as visually-present but clearly "coming soon" /
   zero-state tiles so the later phases only need to swap in real data, not build new layout).

7. `frontend/src/components/shared/FileUploader.jsx` — a reusable drag-and-drop + click-to-browse
   uploader component accepting `accept` (MIME types), `maxSizeMB`, and `onUploadComplete(url)`
   props; shows a progress indicator; POSTs to a given endpoint URL passed as a prop (so it can be
   pointed at `upload-photo`, `upload-achievement`, and later event-certificate/announcement-
   attachment endpoints without rewriting this component).

8. `frontend/src/components/profile/ProfileForm.jsx` — editable form for all the fields listed in
   the backend PATCH endpoint above; `name`, `email`, `rollNo` are rendered as read-only/disabled
   fields (email and rollNo explicitly locked, name shown but per requirement also not part of the
   PATCH payload we send — treat name as display-only here too unless you have a separate reason
   to allow it, in which case just don't include it in your PATCH calls). Multi-select dropdown
   for `skills` sourced from `GET /skills-catalogue`. A "Change Password" button that opens a
   modal: step 1 triggers the OTP-send call, step 2 shows `OtpInput` plus new-password/retype
   fields, step 3 submits and closes on success.

9. `frontend/src/components/profile/PeerProfileView.jsx` — read-only rendering of a profile
   object as returned by `GET /student/profile/:rollNo` for a non-owner/non-admin viewer; where
   `isPhotoHidden` is true, render a placeholder avatar instead of attempting to load
   `profileImage`; explicitly render "Private" placeholders for phone/parentPhone areas instead of
   just omitting them silently, so the UI clearly communicates these are intentionally hidden
   (not a bug).

10. `frontend/src/pages/dashboard/Profile.jsx` — handles both `/dashboard/profile` (own — fetch
    `GET /student/profile/me`, render `ProfileForm`) and `/dashboard/profile/:rollNo` (peer — fetch
    `GET /student/profile/:rollNo`, render `PeerProfileView`; if the returned rollNo matches the
    logged-in user's own rollNo, render `ProfileForm` instead since the backend will have returned
    full data anyway). Include a `SearchStudents` entry in this page's local nav bar (see next
    item) — per requirement, ONLY this page and DashboardHome get this search widget, nowhere
    else in the app.

11. `frontend/src/components/shared/SearchStudents.jsx` — a debounced (300ms) typeahead search
    input calling `GET /student/search?query=`, showing a dropdown of `{name, rollNo,
    profileImage}` results, navigating to `/dashboard/profile/:rollNo` on click. Embed this
    component in both `DashboardHome.jsx` and `Profile.jsx` only.

12. `frontend/src/services/profile.service.js` — wraps every `/student/profile/*`,
    `/student/search`, `/skills-catalogue` call above.

13. Update `App.jsx` routing: add `/dashboard` (DashboardHome), `/dashboard/profile`, and
    `/dashboard/profile/:rollNo`, all nested under the DashboardLayout + PrivateRoute wrapper from
    step 4.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. Refreshing the browser while logged in keeps the user logged in (AuthContext rehydration
   works) — this was explicitly broken at the end of Phase 1, confirm it's now fixed.
2. Own profile loads every field; editing any field except email/rollNo saves correctly and
   persists after a refresh.
3. Manually crafting a PATCH request (via devtools/Postman) that includes an `email` or `rollNo`
   key is rejected with 400, even though the UI itself never sends those keys.
4. Change-password flow requires a freshly-sent OTP (an old/expired one fails), and after success,
   logging out and back in with the NEW password works while the OLD one fails.
5. Create a second test student account. From the first account, search for and open the second
   account's profile via Search Students: confirm phone/parentPhone/photo are hidden/placeholder,
   while skills/links/achievements/projectLinks remain visible.
6. Manually flip one test account's `role` to `'admin'` directly in MongoDB (temporary, for
   testing only), log in as that account, and confirm viewing the SAME peer profile now shows
   ALL fields including the ones hidden in step 5. Flip the role back to `'student'` afterward.
7. Search returns correct results for both partial name and partial roll-number queries, and
   never includes the searching user themselves in results.
8. Photo and achievement-document uploads reject a disallowed file type/oversized file both in
   the UI (before upload starts) and if you bypass the UI and hit the endpoint directly.
9. The Search Students widget is visible ONLY on Dashboard Home and Profile — confirm it is not
   present anywhere else in the app (there's nowhere else to check yet since no other pages exist,
   but keep this constraint in mind for every later phase's pages too).
10. Dashboard shell (sidebar, layout, profile card) renders correctly in both light and dark
    theme, and the sidebar collapses correctly on a narrow/mobile viewport.

Do NOT build the admin panel, announcements, events, or any other module yet — those are later
phases. Keep this phase strictly to the dashboard shell + profile module.
```

---

## PHASE 3 PROMPT — Admin Foundation: Manage Students & Manage Admins

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–2 are complete:
Docker scaffolding, full auth (OTP register/login/forgot-password, JWT, role middleware), and the
full Profile module with dashboard shell, search, and OTP password-change. This is Phase 3 of 13.

CONTEXT — WHAT ALREADY EXISTS: `User.model.js` already has `role` (enum 'student'|'admin') and
`year`/`batchType` fields (unused for their real purpose until Phase 5, but present).
`role.middleware.js`'s `requireRole('admin')` factory exists but has never been exercised with
real admin users yet — this phase is the first to actually use it for real. `upload.middleware.js`
exists (built in Phase 2) and should be reused for the Excel bulk-import file upload.

YOUR TASK THIS PHASE: Stand up the entire admin tier of the application: the ability for existing
admins to grant/revoke admin status by email, and full control over the student roster including
single-add and Excel bulk-import. This is required infrastructure — later phases assume a working
admin panel exists to manage their content.

BACKEND — build exactly this:

1. New model: `backend/src/models/AdminAllowList.model.js` — simple collection:
   `{email: {type:String, unique:true, lowercase:true}, addedBy: {type: ObjectId, ref:'User'},
   createdAt}`. When a user's email is in this collection AND they successfully register or log
   in, the backend should set their `User.role = 'admin'` automatically (implement this check
   inside `auth.controller.js`'s register/verify-otp and login handlers from Phase 1 — you will
   need to go back and add a small check-and-elevate step there; do not duplicate the whole auth
   flow, just add this one lookup+update after successful account creation/login).

2. `backend/src/services/excelImport.service.js` — exports `parseStudentNominalSheet(fileBuffer)`
   using a library like `xlsx` or `exceljs`: expects columns `rollNo` and `email` at minimum
   (case-insensitive header matching), returns `{validRows: [...], errors: [{row, reason}, ...]}`
   — a row is invalid if `rollNo` or `email` is missing/malformed, or if that rollNo/email already
   exists as a User OR is already a pre-seeded nominal. Valid rows do NOT immediately become full
   User documents — they become "nominal" records (add an `isNominalOnly: Boolean` flag and make
   `passwordHash` optional/nullable on the User model to support this state, OR create a small
   separate `StudentNominal.model.js` collection instead if that feels cleaner — pick ONE approach
   and use it consistently; document your choice in a code comment at the top of the service file).
   Whichever you choose, the important behavior is: a rollNo/email present in this nominal data is
   the ONLY thing allowed to complete self-registration via the Phase-1 `/auth/register` flow — go
   back and add this check into `auth.controller.js`'s register handler now (reject registration
   attempts for any rollNo/email not present in the nominal list, with a clear error message).

3. `backend/src/controllers/admin/students.admin.controller.js` +
   `backend/src/routes/admin/students.routes.js` mounted at `/api/v1/admin/students`, ALL gated by
   `auth.middleware.js` + `role.middleware.js('admin')`:
   - `GET /admin/students` — paginated (`?page=&limit=`), filterable by `?year=&branch=&batchType=`,
     searchable by `?search=` (name/rollNo), returns full unfiltered student data (admin sees
     everything).
   - `POST /admin/students` — body `{rollNo, email, name}` minimum — creates a single nominal
     record using whichever approach you chose above.
   - `POST /admin/students/bulk-import` — multipart file upload (reuse `upload.middleware.js`,
     restrict to `.xlsx`/`.csv` MIME types), calls `excelImport.service.js`, returns
     `{success:true, data:{importedCount, errors: [...]}}` — the errors array must NOT cause the
     whole request to fail; valid rows are always imported even if some rows had errors.
   - `PATCH /admin/students/:id` — allows admin to update ANY field on a student, but this phase
     specifically needs `year` and `batchType` to be settable here (Phase 5's announcement
     targeting depends on admins being able to set these).
   - `DELETE /admin/students/:id` — hard-deletes the User (or nominal) doc.

4. `backend/src/controllers/admin/admins.admin.controller.js` +
   `backend/src/routes/admin/admins.routes.js` mounted at `/api/v1/admin/admins`, same auth
   gating:
   - `GET /admin/admins` — lists all users with `role:'admin'`, plus all entries in
     `AdminAllowList` that haven't registered yet (so admin can see pending invites too).
   - `POST /admin/admins` — body `{email}`, adds to `AdminAllowList`; if a User with that email
     already exists, immediately elevate their `role` to `'admin'` right now rather than waiting
     for their next login.
   - `DELETE /admin/admins/:id` — removes from `AdminAllowList` if pending, or if it's an existing
     User, sets their `role` back to `'student'`. Add a safety check: reject the request with 400
     if this would remove the LAST remaining admin from the system (the app must never end up with
     zero admins).

5. Mount both new route files in `backend/src/routes/index.js` alongside the existing student
   routes from Phase 2.

6. Bootstrap script: `backend/src/scripts/seedFirstAdmin.js` — a one-time, manually-run Node
   script (documented with a comment on how to run it: `node src/scripts/seedFirstAdmin.js
   admin@gprec.ac.in`) that inserts a single email into `AdminAllowList` directly. This is how the
   very first admin gets bootstrapped before any admin exists in the UI to add one.

FRONTEND — build exactly this:

1. `frontend/src/routes/AdminRoute.jsx` — redirects to `/dashboard` (with a brief "not authorized"
   message, e.g. via a toast) if `user.role !== 'admin'`, otherwise renders children. Also redirect
   to `/login` if `!user` at all, same pattern as `PrivateRoute`.

2. `frontend/src/components/layout/AdminSidebar.jsx` — left sidebar listing nav items for every
   admin module using the exact paths from the design doc: Admin Home (`/admin`), Manage Students
   (`/admin/students`), Manage Admins (`/admin/admins`), and placeholder links for every future
   admin module (Announcements, Events, Skill Roadmap, Certifications, Companies, Alumni Repos,
   Achievements, Learning Resources, Resume Guide, Connect Sphere, Department Info) — same pattern
   as Phase 2's DashboardSidebar: link them now even though most 404 until later phases.

3. An `AdminLayout.jsx` combining `Navbar` + `AdminSidebar` + `<Outlet />`, wrapped in
   `AdminRoute`, applied to all `/admin/*` routes.

4. `frontend/src/pages/admin/AdminHome.jsx` — a minimal placeholder for this phase (just a
   heading "Admin Overview — full stats coming in a later phase" plus quick-link buttons to
   Manage Students and Manage Admins). Full stat tiles arrive in Phase 11 — do not try to build
   real aggregation queries/UI for this yet.

5. `frontend/src/pages/admin/ManageStudents.jsx`:
   - A searchable/filterable data table (search box + year/branch/batchType filter dropdowns)
     listing students with pagination controls, and per-row actions "View Profile" (navigates to
     `/dashboard/profile/:rollNo` — reuse the Phase-2 profile page, admin will see the full
     unfiltered view automatically since the backend already handles that) and "Delete" (with a
     confirmation dialog).
   - A "Add Single Student" form (rollNo, email, name) in a modal or inline panel.
   - A "Bulk Import" section: file input restricted to `.xlsx`/`.csv`, an "Upload" button, and
     after upload, a results panel showing `importedCount` and a table of any per-row errors
     returned.
   - Inline editable `year`/`batchType` dropdowns directly in the table rows (or an edit
     modal — your choice), calling `PATCH /admin/students/:id` on change.

6. `frontend/src/pages/admin/ManageAdmins.jsx` — a list of current admins (and pending
   allow-listed emails, visually distinguished from active admins), an "Add Admin by Email" input
   + button, and a "Remove" action per row with a confirmation dialog (and handle/display the
   backend's "cannot remove the last admin" error gracefully if it occurs).

7. `frontend/src/services/admin/students.service.js` and
   `frontend/src/services/admin/admins.service.js` — wrap the corresponding backend routes.

8. Update `App.jsx`: add `/admin`, `/admin/students`, `/admin/admins` routes nested under
   AdminLayout.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. Run the `seedFirstAdmin.js` script with a real test email, register/log in with that email,
   and confirm you land on `/admin` (not `/dashboard`) and the role is correctly `'admin'`.
2. From that first admin account, add a SECOND email via Manage Admins; register/log in as that
   second email and confirm it's also elevated to admin automatically.
3. Remove the second admin; confirm their next login reverts them to student (`/dashboard`, not
   `/admin`).
4. Attempt to remove the LAST remaining admin (should be blocked with a clear error).
5. Bulk-import an Excel file with a mix of valid rows and at least one deliberately broken row
   (duplicate rollNo, malformed email); confirm valid rows import successfully and the broken row
   is reported as an error without blocking the rest.
6. Confirm a student pre-listed via bulk import (or single add) CAN complete registration via the
   Phase-1 `/register` flow, and confirm a rollNo/email NOT on any list is REJECTED at
   registration with a clear error.
7. As a logged-in student (non-admin), attempt to navigate directly to `/admin/students` in the
   URL bar — confirm you're redirected away; also attempt the equivalent raw API call directly
   (e.g. via Postman with a student's session cookie) and confirm it's rejected with 403, not just
   blocked in the UI.
8. Admin can change a student's `year`/`batchType` from the Manage Students table and it persists.

Do NOT build any content-management pages (announcements, events, roadmap, etc.) yet — those come
in Phases 4 onward, now that a working admin panel exists to add them into. Keep this phase
strictly to student/admin roster management.
```

---

## PHASE 4 PROMPT — Public Home Page & Department Content

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–3 are complete:
Docker scaffolding, full auth, dashboard shell + profile module, and a working admin panel with
student/admin roster management. This is Phase 4 of 13.

CONTEXT — WHAT ALREADY EXISTS: `Navbar.jsx` (with theme toggle + auth-aware buttons) is reused
across public/dashboard/admin already. `AdminLayout.jsx`/`AdminSidebar.jsx` exist with placeholder
links to future admin pages including "Department Info" — this phase builds that page for real.
The root route `/` currently renders only a placeholder wrapped in `Navbar`.

YOUR TASK THIS PHASE: Build the real public Home page exactly as specified (department photo,
motto, vision/mission, faculty links out to the external GPREC site, dynamic scheme/syllabus link
cards, footer), fully driven by admin-editable content — no hardcoded text in the frontend beyond
structural placeholders.

BACKEND — build exactly this:

1. Models:
   - `backend/src/models/DepartmentInfo.model.js` — a SINGLETON-style document (only ever one doc
     should exist; enforce this by always using `findOneAndUpdate({}, update, {upsert:true, new:
     true})` in the controller rather than allowing arbitrary creates): `motto` (String),
     `vision` (String), `mission` (String), `heroImageUrl` (String).
   - `backend/src/models/FacultyLink.model.js` — `{name, title, externalUrl, order: Number}`.
   - `backend/src/models/SchemeLink.model.js` — `{schemeYear: String, title: String, url: String,
     order: Number}`.

2. `backend/src/controllers/public.controller.js` + `backend/src/routes/public.routes.js`
   mounted at `/api/v1/public`, NO auth middleware on any of these (fully public):
   - `GET /public/department-info` — returns the singleton doc (or a sensible empty-object
     default with clearly-null fields if it hasn't been set yet — do not error).
   - `GET /public/faculty-links` — returns all, sorted by `order`.
   - `GET /public/scheme-links` — returns all, sorted by `order`.

3. `backend/src/controllers/admin/departmentInfo.admin.controller.js` +
   `backend/src/routes/admin/departmentInfo.routes.js` mounted at `/api/v1/admin`, gated by
   `auth.middleware.js` + `role.middleware.js('admin')`:
   - `GET /admin/department-info` and `PATCH /admin/department-info` (upsert pattern from above;
     `heroImageUrl` set via reusing `upload.middleware.js` on a dedicated
     `POST /admin/department-info/upload-hero-image` sub-route, same local-storage pattern as
     Phase 2's profile photo upload).
   - `GET/POST/PATCH/DELETE /admin/faculty-links` — full CRUD, POST/PATCH accept an `order`
     field for admin-controlled reordering.
   - `GET/POST/PATCH/DELETE /admin/scheme-links` — full CRUD, same ordering pattern. This is the
     endpoint that proves the "admin can add a brand-new scheme year with zero code changes"
     requirement — do not hardcode "2020"/"2023" anywhere in backend validation; `schemeYear`
     should just be a free-text/String field.

FRONTEND — build exactly this:

1. `frontend/src/components/layout/Footer.jsx` — a GPREC-style footer: address/contact block,
   copyright line, a couple of social/external links. This can be mostly static structure per the
   original requirement ("copied from GPREC website footer"), but pull the actual text content
   (address, contact email, etc.) from a small set of hardcoded constants at the top of the file
   for easy editing later — no need to make the footer itself admin-editable unless you want to,
   the design doc does not require that.

2. `frontend/src/pages/public/Home.jsx` — replace the Phase-0/1 placeholder entirely:
   - Reuses `Navbar` at the top (already functional from Phase 1/3).
   - Hero section: full-width `heroImageUrl` from `GET /public/department-info` as a banner image,
     with a graceful placeholder/skeleton if it hasn't been set by admin yet.
   - Two-column section: left = `motto` text, right = `vision` + `mission` text (from the same
     department-info fetch); each side shows sensible placeholder copy ("Content coming soon") if
     the admin hasn't filled it in yet — never render broken/empty layout.
   - Faculty links section: grid/list of cards from `GET /public/faculty-links`, each card is an
     `<a>` with `target="_blank" rel="noopener noreferrer"` pointing at `externalUrl`. If the
     array is empty, render nothing for this whole section (no empty card grid).
   - Scheme/Syllabus section: cards from `GET /public/scheme-links`, same empty-state handling
     (render nothing if zero entries) — and specifically verify in your own testing that adding a
     THIRD scheme year from the admin page (beyond just 2020/2023) appears here with zero frontend
     code changes, since that's the core requirement this page has to satisfy.
   - `Footer` at the bottom.
   - Use React Query (`@tanstack/react-query`, already installed since Phase 0) for all three
     public GET calls on this page so they're cached and don't re-fetch needlessly on navigation
     back to Home.

3. `frontend/src/pages/admin/ManageDepartmentInfo.jsx`:
   - A form for motto/vision/mission (textareas) + hero image uploader (reuse `FileUploader.jsx`
     from Phase 2) with a "Save" button calling `PATCH /admin/department-info`.
   - A "Faculty Links" section: a list of existing entries each with edit/delete, plus an
     "Add Faculty Link" form (name, title, externalUrl); support reordering (drag-and-drop, or
     simple up/down arrow buttons if drag-and-drop feels like overkill for this simple list —
     either is acceptable, just make `order` persist correctly).
   - A "Scheme/Syllabus Links" section: same list+add+reorder pattern (schemeYear, title, url).

4. `frontend/src/services/public.service.js` and
   `frontend/src/services/admin/departmentInfo.service.js` wrapping the above.

5. Update `App.jsx`: `/` now renders the real `Home.jsx` (no longer the placeholder), and add
   `/admin/department-info` nested under `AdminLayout`.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. As a fully logged-out visitor, load `/` — confirm zero console errors and a complete, correctly
   laid-out page even before any admin content has been entered (placeholder states look
   intentional, not broken).
2. As admin, fill in motto/vision/mission/hero image via Manage Department Info; confirm the
   Home page reflects the changes on next load with NO redeploy or code change.
3. As admin, add a faculty link; confirm it appears on Home and opens the correct external URL in
   a new tab.
4. As admin, add a THIRD scheme link (e.g. "2026 Scheme") in addition to whatever test data you
   used for 2020/2023; confirm it renders correctly on Home without any frontend code change —
   this is the single most important check for this phase.
5. Delete all faculty links via admin; confirm the Home page's faculty section disappears cleanly
   rather than showing an empty grid.
6. Toggle theme on the Home page; confirm it's visually correct in both modes and the choice
   matches whatever was set on other pages (shared ThemeContext).

Do NOT build announcements, events, or any other student-facing module yet — those are later
phases. Keep this phase strictly to the public Home page and its admin-managed content.
```

---

## PHASE 5 PROMPT — Announcements Module

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–4 are complete:
Docker scaffolding, full auth, dashboard shell + profile module, admin roster management, and the
public Home page with fully dynamic department content. This is Phase 5 of 13.

CONTEXT — WHAT ALREADY EXISTS: `User.model.js` has `year` (1-4) and `batchType`
('smart'|'tap'|'itca'|'nonItca'|null) fields, and admins can already set these via
`PATCH /admin/students/:id` from Phase 3. `upload.middleware.js` exists and is reused here for
announcement attachments. This is the FIRST phase requiring Socket.io — set up the core
Socket.io server infrastructure now; it will be reused as-is by Phase 10's Connect Sphere.

YOUR TASK THIS PHASE: Build year/batch-targeted announcements with a group-chat-style sidebar,
server-computed group eligibility, read/unread tracking, and LIVE unread-badge updates via
Socket.io — no page refresh needed to see a new announcement's badge appear.

BACKEND — build exactly this:

1. Model: `backend/src/models/Announcement.model.js` — `title` (String, required), `body`
   (String, required), `attachments` ([{url: String, type: {type:String, enum:
   ['image','doc','excel','video','pdf']}}]), `targetGroups` ([{year: Number, batchType: {type:
   String, enum:['smart','tap','itca','nonItca', null], default:null}}]), `postedBy` (ObjectId ref
   User), `postedAt` (Date, default now), `readBy` ([{user: ObjectId ref User, readAt: Date}]).

2. Socket.io core infrastructure (build this now, Phase 10 will extend it, not rebuild it):
   - Install `socket.io`, `@socket.io/redis-adapter`, `redis` (a second Redis client instance
     dedicated to the pub/sub adapter, separate from the general-purpose Redis client from Phase
     0 — Socket.io's Redis adapter needs its own pub/sub-mode clients).
   - `backend/src/sockets/index.js` — exports `initSockets(httpServer)`: creates a `new
     Server(httpServer, {cors: {origin: process.env.FRONTEND_ORIGIN, credentials:true}})`,
     attaches the Redis adapter (pub + sub clients), and calls out to per-namespace setup
     functions (this phase adds one: `notify.socket.js`; Phase 10 will add `chat.socket.js` here
     too).
   - `backend/src/sockets/notify.socket.js` — exports `setupNotifySocket(io)`: creates the
     `/notify` namespace, on connection authenticates the socket by reading and verifying the
     SAME JWT access-token cookie used by HTTP requests (parse cookies from the socket handshake
     headers), and on success calls `socket.join(userId.toString())` so we can later emit directly
     to a specific user's room; reject/disconnect the socket if the cookie is missing/invalid.
   - Update `backend/server.js` to call `initSockets(httpServer)` after creating the HTTP server
     and before `httpServer.listen(...)`.

3. `backend/src/services/announcementEligibility.service.js` — exports
   `getEligibleGroups(user)`: given a User doc, returns an array of group descriptors this
   student currently qualifies for based on LIVE `year`/`batchType` values (never cached):
   - year 1 or 2: exactly one group `{year: user.year, batchType: null}` (label it e.g. "Year 1"
     in whatever shape you return — decide on a clean `{groupId, label}` shape and use it
     consistently across every endpoint in this phase).
   - year 3 or 4: if `batchType` is null, exactly one group `{year: user.year, batchType: null}`
     (plain year-level group, no sub-group yet since admin hasn't assigned a batch); if
     `batchType` IS set, exactly one group `{year: user.year, batchType: user.batchType}` — per
     the design doc, a student has exactly ONE `batchType` value (not an array), so re-read the
     original requirement carefully: a student can belong to MULTIPLE groups simultaneously only
     in the sense that year-level and batch-level could both apply — decide the exact intended
     behavior by re-reading the design doc's 4.2.3 section, implement it faithfully, and document
     your interpretation with a comment at the top of this service file.

4. `backend/src/controllers/announcement.controller.js` +
   `backend/src/routes/student/announcement.routes.js` mounted at `/api/v1/student`, all requiring
   `auth.middleware.js`:
   - `GET /student/announcement-groups` — calls `announcementEligibility.service.js`, returns the
     student's current groups, EACH annotated with its live unread count (query
     `Announcement.countDocuments` where `targetGroups` matches AND the requester's id is NOT in
     `readBy`).
   - `GET /student/announcements?group=` — validates that the requested group is actually one the
     student is eligible for (re-derive eligibility server-side, do NOT trust a client-supplied
     group blindly — reject with 403 if they query for a group they don't belong to), returns
     announcements matching that group, newest first, paginated.
   - `POST /student/announcements/:id/mark-read` — adds `{user: req.user._id, readAt: now}` to
     `readBy` if not already present (idempotent).

5. `backend/src/controllers/admin/announcements.admin.controller.js` +
   `backend/src/routes/admin/announcements.routes.js` mounted at `/api/v1/admin`, gated by admin
   role:
   - Full CRUD on `GET/POST/PATCH/DELETE /admin/announcements`. `POST` accepts `targetGroups` as
     an array of `{year, batchType}` combinations directly from the composer UI, plus
     `attachments` uploaded via `upload.middleware.js` (allow image/doc/excel/video/pdf mime
     types — reuse and extend the allow-list parameter from Phase 2's upload middleware rather
     than writing a new one).
   - AFTER successfully creating an announcement, the controller must: resolve every User whose
     current `year`/`batchType` matches at least one of the new announcement's `targetGroups`
     (query `User.find({...})` appropriately), and for each matching user, emit a Socket.io event
     `announcement:new` (with a small payload: `{announcementId, groupLabel}`) to that user's
     `/notify` room (`io.of('/notify').to(userId).emit(...)`) — this only reaches users who are
     CURRENTLY connected via socket; users who load the page later will see it via the normal
     unread-count query in step 4, so this live push is purely a nice-to-have real-time layer on
     top of the always-correct server-computed unread counts.

FRONTEND — build exactly this:

1. `frontend/src/hooks/useSocket.js` — a hook that establishes (and cleans up on unmount) a
   `socket.io-client` connection to the `/notify` namespace (relative URL, cookies sent
   automatically since `withCredentials` is configured), exposes `{socket, connected}`; build this
   generically enough (e.g. accept a `namespace` param) that Phase 10 can call
   `useSocket('/chat')` later without rewriting this hook.

2. `frontend/src/components/announcements/AnnouncementGroupList.jsx` — renders the sidebar list
   of groups from `GET /student/announcement-groups`, each with an unread-count badge; subscribes
   via `useSocket('/notify')` to `announcement:new` events and, on receipt, invalidates/refetches
   the React Query cache for the groups list so badges update live without a manual refresh.

3. `frontend/src/components/announcements/AnnouncementCard.jsx` — title, body, attachments
   (render inline preview for images, download chip for doc/excel/video/pdf), posted-by name,
   relative timestamp.

4. `frontend/src/pages/dashboard/Announcements.jsx` — left sidebar (`AnnouncementGroupList`) +
   main panel showing the selected group's announcement stream; selecting a group fetches
   `GET /student/announcements?group=` and calls `mark-read` for each newly-viewed announcement
   (or a single bulk "mark all visible as read" call — implement whichever matches how you shaped
   the backend endpoint, just make sure opening a group visibly clears its badge).

5. `frontend/src/pages/admin/ManageAnnouncements.jsx` — composer: title, body, attachment
   uploader (reuse `FileUploader.jsx`, multiple files, image/doc/excel/video/pdf accepted), and a
   targeting selector UI: year checkboxes 1-4, and for years 3-4 specifically, additional
   batch-type checkboxes (smart/tap/itca/nonItca) that appear once that year is checked. Below the
   composer, a list of previously posted announcements with edit/delete actions.

6. Update `frontend/src/pages/dashboard/DashboardHome.jsx` (built as a static placeholder tile in
   Phase 2): wire the Announcements tab to show a real live preview of the latest 3 announcements
   across all the student's eligible groups combined, with a "View All" link to
   `/dashboard/announcements`.

7. `frontend/src/services/announcement.service.js` and
   `frontend/src/services/admin/announcements.service.js`.

8. Update `App.jsx`: add `/dashboard/announcements` and `/admin/announcements` routes.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. Create three test students: one Year 1, one Year 3 with no batchType set, one Year 3 with
   batchType 'smart'. Confirm each sees exactly the group(s) your eligibility logic intends —
   check this against the actual design-doc requirement, not just against whatever the code
   happens to do.
2. Post an announcement targeted at "Year 3, smart" — confirm only the Year-3-smart student sees
   it, and the other two do not (query their `/student/announcements` directly to be sure, not
   just the UI).
3. Opening a group's announcement stream clears its unread badge, both in the sidebar list and on
   the Dashboard Home summary tile.
4. With the Year-3-smart student's browser tab open and connected, post a NEW matching
   announcement from an admin's browser tab — confirm the badge updates live in the first tab
   WITHOUT a manual refresh (this proves the Socket.io `/notify` push is working).
5. Attempt to directly call `GET /student/announcements?group=` with a group the logged-in student
   does NOT belong to (forge the query param) — confirm it's rejected with 403, not silently
   returning empty/wrong data.
6. Upload one attachment of each supported type (image/doc/excel/video/pdf) on an announcement;
   confirm each renders/downloads correctly on the student-facing card.
7. A first-year student's group list contains exactly the single "Year 1" group and nothing else
   (no stray batch-type sub-groups), confirming this specific design-doc constraint.

Do NOT build events, the flexible content modules, or Connect Sphere yet — those come later. Keep
this phase strictly to Announcements, but DO leave the Socket.io core (`sockets/index.js`) general
enough that Phase 10 can add a second namespace onto the SAME `io` instance without refactoring.
```

---

## PHASE 6 PROMPT — Events Module + Zoom + Google Drive Integration

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–5 are complete:
Docker scaffolding, full auth, dashboard shell + profile module, admin roster management, public
Home page, and the Announcements module with live Socket.io badge updates. This is Phase 6 of 13
— the most integration-heavy phase so far (real Zoom + Google Drive APIs). Budget extra care for
credential setup and sandbox testing; do not proceed to frontend work until the backend
integrations are proven against the REAL Zoom/Drive APIs (not mocked), since this is exactly the
kind of thing that looks fine with stubs and breaks in production.

CONTEXT — WHAT ALREADY EXISTS: `upload.middleware.js` (multer, memory storage, configurable
MIME/size limits) — reuse for certificate uploads, but note certificates go to GOOGLE DRIVE, not
local storage like Phase 2/4's photo uploads. `email.service.js` exists (Nodemailer) and its
`sendGenericEmail` helper should be reused for the Zoom-link email. Node-cron is not yet installed
in the project — add it in this phase.

YOUR TASK THIS PHASE: Build the full event lifecycle — admin creates events of two types
(mock-interview, certification-drive), students register, mock-interview registrations
auto-provision a real Zoom meeting and email the link, certification-drive registrations accept
certificate uploads that land in a real Google Drive folder with a specific naming convention, and
an auto-expiry cron job cleans up MongoDB (but never Drive) once an event's `expiresAt` passes.

PREREQUISITE SETUP (do this before writing integration code, and tell the user clearly if any of
this is missing): a Google Cloud service account JSON with Drive API access and a folder shared
with that service account (env vars `GOOGLE_SERVICE_ACCOUNT_JSON`,
`GOOGLE_DRIVE_ROOT_FOLDER_ID`); Zoom Server-to-Server OAuth app credentials (env vars
`ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`) with a valid host email
(`hostEmail` used per event). If these aren't available yet, build everything up through the
service-layer functions and STOP before wiring them into controllers, clearly flagging what's
blocked, rather than silently mocking the calls and calling the phase done.

BACKEND — build exactly this:

1. Models:
   - `backend/src/models/Event.model.js` — `title` (String, required), `description` (String),
     `type` (String, enum ['mock-interview','certification-drive','other'], required), `startAt`
     (Date), `expiresAt` (Date, required, indexed — the cron job queries against this),
     `zoomMeetingTemplate` ({hostEmail: String}), `driveFolderId` (String, nullable),
     `allowedUploadTypes` ([String], default ['image','pdf']), `createdBy` (ObjectId ref User),
     timestamps: true.
   - `backend/src/models/EventRegistration.model.js` — `event` (ObjectId ref Event, indexed),
     `user` (ObjectId ref User, indexed), `registeredAt` (Date, default now), `zoomJoinUrl`
     (String), `zoomStartTime` (Date), `uploads` ([{driveFileId, fileName, fileType, uploadedAt}]),
     `status` (String, enum ['registered','attended','no-show'], default 'registered'). Add a
     COMPOUND UNIQUE index on `{event, user}` so double-registration is impossible at the database
     level, not just application logic.

2. `backend/src/config/googleDrive.js` — parses `GOOGLE_SERVICE_ACCOUNT_JSON` (a JSON string in
   the env var, or a path to a mounted file — pick whichever is cleaner for Docker, document your
   choice), authenticates via `googleapis`' `google.auth.GoogleAuth`, exports a ready-to-use
   `drive` client (Drive API v3).

3. `backend/src/config/zoom.js` — exports `getZoomAccessToken()`: checks a Redis key
   `zoom-access-token` first; if absent/expired, POSTs to Zoom's OAuth token endpoint using
   `ZOOM_ACCOUNT_ID`/`ZOOM_CLIENT_ID`/`ZOOM_CLIENT_SECRET` (Server-to-Server OAuth grant type),
   caches the returned token in Redis with a TTL slightly shorter than its actual expiry, returns
   it.

4. `backend/src/services/drive.service.js`:
   - `createEventFolder(eventTitle, eventId)` — creates a folder named `` `${eventTitle}_${eventId}`
     `` under `GOOGLE_DRIVE_ROOT_FOLDER_ID`, returns the new folder's Drive ID.
   - `uploadCertificateFile({folderId, fileBuffer, mimeType, studentName, rollNo,
     certificateLabel, originalExt})` — builds the filename exactly as
     `` `${studentName}_${rollNo}_${certificateLabel}.${originalExt}` `` (sanitize each interpolated
     part to strip characters Drive/filesystems dislike), uploads via the Drive API into the given
     folder, returns `{driveFileId, fileName}`. Validates `mimeType` is either an image/* type or
     `application/pdf` and throws a clear error otherwise (this validation must ALSO exist at the
     multer/upload.middleware layer as a first line of defense — defense in depth, not
     either/or).

5. `backend/src/services/zoom.service.js` — `createMeeting({hostEmail, topic, startTime})`: gets
   a token via `zoom.js`, POSTs to `https://api.zoom.us/v2/users/{hostEmail}/meetings`, returns
   `{joinUrl, startTime}` from the response.

6. `backend/src/jobs/expireEvents.cron.js` — using `node-cron`, schedule a job (e.g. every hour,
   `0 * * * *`) that: finds all `Event` docs where `expiresAt < now`, and for each one, deletes
   ALL its `EventRegistration` docs (Mongo only — never call any Drive delete API here), then
   deletes the `Event` doc itself. Register this cron job's start call in `server.js` alongside
   `initSockets`.

7. `backend/src/controllers/event.controller.js` + `backend/src/routes/student/event.routes.js`
   mounted at `/api/v1/student`, all requiring `auth.middleware.js`:
   - `GET /student/events` — list active (non-expired) events, `?filter=active|upcoming`.
   - `POST /student/events/:id/register` — MUST be idempotent: if an `EventRegistration` already
     exists for this `{event, user}` pair (the compound unique index from step 1 guarantees this
     can be checked safely even under race conditions — catch the duplicate-key error and treat it
     as "already registered" rather than a hard failure), just return the existing registration.
     Otherwise: create the `EventRegistration`; if `event.type === 'mock-interview'`, call
     `zoom.service.createMeeting(...)` and store the result on the new registration, then call
     `email.service.sendGenericEmail(...)` with the join link and time.
   - `POST /student/events/:id/upload-certificate` — multipart (reuse `upload.middleware.js`,
     restricted to the event's `allowedUploadTypes`), requires an existing registration for this
     student+event (403 if not registered), calls `drive.service.uploadCertificateFile(...)` using
     `event.driveFolderId`, pushes the returned `{driveFileId, fileName, fileType, uploadedAt}`
     into `registration.uploads[]`.
   - `GET /student/events/:id/my-registration` — returns the requester's own registration for
     that event (or 404/null if not registered) including Zoom link and uploaded-certs list.

8. `backend/src/controllers/admin/events.admin.controller.js` +
   `backend/src/routes/admin/events.routes.js` mounted at `/api/v1/admin`, admin-gated:
   - `POST /admin/events` — creates the Event; if `type === 'certification-drive'` (or more
     generally whenever cert uploads should be allowed for this event), immediately calls
     `drive.service.createEventFolder(...)` and stores the returned `driveFolderId`.
   - `GET /admin/events` — list all events with live registration COUNTS (aggregate, don't
     N+1-query).
   - `GET /admin/events/:id/registrations` — full registration list for one event, each populated
     with the student's name/rollNo, Zoom status, and uploaded-certs list.
   - `DELETE /admin/events/:id` — same cascade-delete behavior as the cron job (Mongo only, Drive
     untouched) — factor this deletion logic into a small shared helper function used by BOTH the
     cron job and this manual-delete endpoint so the "Drive is never touched" rule lives in exactly
     one place in the codebase, not duplicated.

FRONTEND — build exactly this:

1. `frontend/src/components/shared/CountdownTimer.jsx` — accepts an `expiresAt` ISO timestamp
   prop, ticks client-side (setInterval, cleared on unmount), renders a human-friendly remaining
   time (e.g. "5 hrs left", "2 days left", "Expired"), and exposes an `isExpired` boolean via a
   callback prop or render-prop pattern so parent components (like the register button) can
   disable themselves once time is up.

2. `frontend/src/components/events/EventCard.jsx` — title, type badge, short description,
   `CountdownTimer`, and a register button that reflects current state ("Register" /
   "Registered ✓" / "Expired" — disabled appropriately).

3. `frontend/src/components/events/EventCertificateUpload.jsx` — reuses `FileUploader.jsx` (from
   Phase 2), restricted client-side to image/PDF matching the event's `allowedUploadTypes`, POSTs
   to the upload-certificate endpoint, shows per-file upload progress and success state, and below
   the uploader, lists previously uploaded certs for this student+event (name + uploaded date).

4. `frontend/src/pages/dashboard/Events.jsx` — grid/list of `EventCard`s; clicking a card opens a
   detail view (modal or dedicated route, your choice) showing full description + registration
   button; for `mock-interview` events post-registration, prominently display the Zoom join link
   and scheduled time fetched from `my-registration`; for `certification-drive` events,
   post-registration shows `EventCertificateUpload`.

5. `frontend/src/pages/admin/ManageEvents.jsx` — create-event form (title, description, type
   dropdown, startAt datetime picker, expiresAt datetime picker or a "duration" convenience input
   like "15 days from now" that computes expiresAt), list of active events with live registration
   counts, and a registrations table per event (student name/rollNo, Zoom status if applicable,
   uploaded certs if applicable). Delete action shows a confirmation dialog explicitly stating
   "Registration data will be permanently removed. Uploaded certificate files will remain
   accessible in Google Drive." — this exact distinction must be visible to the admin before they
   confirm, since it's a specific, easy-to-get-wrong requirement.

6. Update `DashboardHome.jsx`'s Events tab (static placeholder since Phase 2) with a real live
   preview of upcoming/active events and a "View All" link to `/dashboard/events`.

7. `frontend/src/services/event.service.js` and `frontend/src/services/admin/events.service.js`.

8. Update `App.jsx`: add `/dashboard/events` and `/admin/events` routes.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON — do all of this against the REAL Zoom/Drive APIs,
not mocks:
1. Create a `certification-drive` event as admin — confirm a real folder actually appears in the
   configured Google Drive location, and its ID is correctly stored on the Event doc.
2. Register a test student for that event, upload a certificate — confirm the file actually lands
   in the correct Drive folder with the EXACT naming convention
   `Name_RollNo_CertificateLabel.ext`, and confirm a non-image/non-PDF file is rejected both
   client-side (before any request is sent) and if you bypass the UI and hit the endpoint directly
   with a disallowed MIME type.
3. Create a `mock-interview` event, register a test student — confirm a REAL Zoom meeting is
   created (visible in the Zoom account's meeting list) and the join link arrives by actual email,
   matching what's shown in the UI.
4. Register the same student for the same event a second time (e.g. by double-clicking the
   register button rapidly, or by replaying the POST request) — confirm no duplicate
   `EventRegistration` is created and no duplicate Zoom meeting/email is generated.
5. Manually set a test event's `expiresAt` to a past timestamp directly in MongoDB, then either
   wait for the cron job to fire or manually trigger the cron function once for testing — confirm
   the Event and its EventRegistration docs are gone from MongoDB, but the Drive folder and its
   uploaded files are STILL present and accessible directly in Google Drive.
6. Delete a still-active event manually as admin — confirm the same Mongo-only deletion behavior
   as the cron path (registrations gone, Drive untouched), proving the shared deletion helper is
   actually being used by both paths.
7. Confirm the countdown timer correctly disables the register button at zero and updates its
   display live without a page refresh.
8. Admin's per-event registrations table accurately lists every registrant and their correct
   Zoom/certificate status.

Do NOT build the flexible content modules or Connect Sphere yet — those are later phases. Keep
this phase strictly to Events + Zoom + Drive, and do not consider it done until step 1-3 above
have been verified against the LIVE external APIs.
```

---

## PHASE 7 PROMPT — Flexible Content Modules (Skill Roadmap, Certifications, Learning Resources, Resume Guide)

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–6 are complete:
Docker scaffolding, full auth, dashboard shell + profile, admin roster management, public Home
page, Announcements with live sockets, and the full Events + Zoom + Google Drive module. This is
Phase 7 of 13.

CONTEXT — WHAT ALREADY EXISTS: `upload.middleware.js` reusable for any file-type content blocks
in this phase (e.g. uploading a PDF as a content block's `value`). `progress.service.js` exists
from Phase 2 but was written defensively to return 0% because no roadmap items existed yet — THIS
phase is what makes that function's real logic actually exercised for the first time; you may need
to revisit and lightly adjust it once real SkillRoadmap documents exist, per the note left in its
Phase-2 code comment.

YOUR TASK THIS PHASE: Build ONE reusable "flexible content block" system (a generic renderer and a
generic editor component, plus a generic backend CRUD pattern), then apply it identically across
FOUR modules: Skill Roadmap, Certifications, Learning Resources, and Resume Guide. Do not write
four separate rendering/editing implementations — the whole point of this phase is proving one
shared system handles all four, since they share an identical "admin adds any content block of
any type in any order" requirement.

BACKEND — build exactly this:

1. `backend/src/models/shared/contentBlock.schema.js` — a Mongoose SUB-schema (not its own
   collection) exporting a schema definition object: `{type: {type:String, enum:
   ['text','link','video','image','file','pdf'], required:true}, label: String, value: {type:
   String, required:true}, order: {type:Number, default:0}}`. Import and embed this as an array
   field (`contentBlocks: [contentBlockSchema]`) in each of the four models below.

2. Models (each embeds `contentBlocks: [ContentBlockSchema]` from step 1):
   - `backend/src/models/SkillRoadmap.model.js` — `semester` (Number, required, indexed),
     `skillGroupName` (String, required), `mandatory` (Boolean, default false), `description`
     (String), `contentBlocks`, `order` (Number, default 0), `createdBy` (ObjectId ref User),
     timestamps: true.
   - `backend/src/models/Certification.model.js` — `semester` (Number, required, indexed), `name`
     (String, required), `description` (String), `contentBlocks`, `order`.
   - `backend/src/models/LearningResource.model.js` — `skillName` (String, required),
     `contentBlocks`, `order`.
   - `backend/src/models/ResumeGuide.model.js` — `title` (String, required), `description`
     (String), `contentBlocks`, `order`.

3. `backend/src/controllers/admin/content.admin.controller.js` — write this as a GENERIC
   controller FACTORY, not four separate files: export a function
   `createContentAdminController(Model)` that returns `{list, create, update, remove}` handler
   functions performing standard CRUD against whichever Mongoose Model is passed in (all
   admin-gated). Then in `backend/src/routes/admin/content.routes.js`, instantiate FOUR small
   routers by calling this factory once per model (`createContentAdminController(SkillRoadmap)`,
   etc.) and mount them at `/api/v1/admin/skill-roadmap`, `/api/v1/admin/certifications`,
   `/api/v1/admin/learning-resources`, `/api/v1/admin/resume-guide` respectively. This is the
   backend equivalent of "build the shared system once" — do not write four near-identical
   controller files by hand.

4. Student-facing controllers (thin, read-only — these CAN be four small separate files since
   each has slightly different query/grouping semantics, that's fine and doesn't violate the
   "shared system" principle which applies to the editing/rendering pattern, not every single
   line of backend code):
   - `backend/src/controllers/skillRoadmap.controller.js` + route: `GET
     /student/skill-roadmap?semester=` (grouped/filtered by semester, sorted by `order`).
   - `backend/src/controllers/certification.controller.js` + route: `GET
     /student/certifications?semester=`.
   - `backend/src/controllers/learningResource.controller.js` + route: `GET
     /student/learning-resources` (all, grouped by `skillName` client-side or server-side, your
     choice).
   - `backend/src/controllers/resumeGuide.controller.js` + route: `GET /student/resume-guide`
     (flat list, sorted by `order`).

5. `PATCH /student/roadmap-checklist/:itemId` in `skillRoadmap.controller.js` (or a shared
   profile-adjacent controller if that fits your structure better) — toggles the matching entry in
   `req.user.progress.roadmapChecklist` (adds it if not present, flips `done` if present), then
   calls `progress.service.recalculateCompletionPercent(req.user._id)` — and NOW that real
   SkillRoadmap documents exist, verify this function's total-item-count logic actually works
   correctly end to end (this is the "revisit" flagged in Phase 2).

FRONTEND — build exactly this:

1. `frontend/src/components/shared/ContentBlockRenderer.jsx` — THE GENERIC RENDERER. Accepts a
   `blocks` prop (array of `{type, label, value, order}`, already sorted or sort it internally by
   `order`), and renders each block appropriately by `type`: `text` → paragraph; `link` → an
   `<a target="_blank">` styled as a chip/button showing `label`; `video` → an embedded
   player if `value` looks like a YouTube/Vimeo URL, else a link fallback; `image` → an `<img>`;
   `file`/`pdf` → a download chip. Build this ONCE and import it in all four student-facing pages
   below — do not create per-module rendering logic.

2. `frontend/src/components/shared/ContentBlockEditor.jsx` — THE GENERIC ADMIN EDITOR. Accepts
   `blocks` (current array) and `onChange(newBlocksArray)` props. Renders an "Add Block" control
   (type dropdown + label/value inputs appropriate to the chosen type), a list of existing blocks
   each with edit-in-place, delete, and up/down reorder controls (updating `order` values on
   reorder). Build this ONCE and import it in all four admin pages below.

3. `frontend/src/components/roadmap/RoadmapChecklistItem.jsx` — a checkbox + skill-group label,
   calling `PATCH /student/roadmap-checklist/:itemId` on toggle, optimistically updating local
   state and rolling back on failure.

4. `frontend/src/pages/dashboard/SkillRoadmap.jsx` — semester tabs/accordion (1 through 8); within
   each semester, skill groups each rendered via `ContentBlockRenderer` for their content, plus a
   `RoadmapChecklistItem` checkbox and a visible "Mandatory" badge/highlight where
   `mandatory:true`. Wire the checklist toggling to update the SAME `ProgressRing` shown on
   `DashboardHome` (built in Phase 2) — confirm this cross-page consistency in your own testing.

5. `frontend/src/pages/dashboard/Certifications.jsx` — semester-grouped list, each entry expanded
   via `ContentBlockRenderer`.

6. `frontend/src/pages/dashboard/LearningResources.jsx` — skill-name-grouped accordion, each via
   `ContentBlockRenderer`.

7. `frontend/src/pages/dashboard/ResumeGuide.jsx` — flat list of sections, each via
   `ContentBlockRenderer`.

8. `frontend/src/pages/admin/ManageSkillRoadmap.jsx` — semester selector, list of skill groups
   with drag-to-reorder (or up/down arrows), each opening `ContentBlockEditor` for its content,
   plus a `mandatory` toggle and add/delete skill-group controls.

9. `frontend/src/pages/admin/ManageCertifications.jsx`, `ManageLearningResources.jsx`,
   `ManageResumeGuide.jsx` — same pattern as step 8 (semester or skill-name grouping as
   appropriate to each), all wrapping the SAME `ContentBlockEditor` component.

10. Four matching service files (`skillRoadmap.service.js`, `certification.service.js`,
    `learningResource.service.js`, `resumeGuide.service.js`) plus their `admin/` counterparts.

11. Update `App.jsx`: add all eight new routes (four student, four admin).

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. As admin, on ONE skill group, add a text block, then a link block, then a video block, then a
   file block, in that exact order — confirm the student-facing page renders them in the SAME
   order via `ContentBlockRenderer`.
2. Reorder those blocks in the admin editor (move the file block to the top) — confirm the
   student view reflects the new order after refresh.
3. Mark one Skill Roadmap item `mandatory` — confirm it's visually distinguished on the student
   page.
4. Tick a roadmap checklist item as a student — confirm `completionPercent` updates AND the
   `ProgressRing` on `DashboardHome` reflects the new value (navigate between the two pages to
   confirm consistency, don't just check one).
5. Grep/search the frontend codebase yourself and confirm `ContentBlockRenderer` and
   `ContentBlockEditor` are each defined in exactly ONE file and IMPORTED (not copy-pasted) into
   all four relevant student pages and all four relevant admin pages respectively — this is the
   single most important structural check for this phase.
6. Delete a content block from the admin editor — confirm it disappears from the student view and
   the remaining blocks' order stays sensible (no gaps causing render issues).
7. Confirm all four backend admin route groups
   (`/admin/skill-roadmap`, `/admin/certifications`, `/admin/learning-resources`,
   `/admin/resume-guide`) are served by the SAME factory function
   `createContentAdminController`, not four hand-written near-duplicate controller files — check
   the actual source, don't just trust that it works.

Do NOT build Company Info, Alumni Repos, Achievements, or Connect Sphere yet — those are later
phases, and Phases 8 and 9 will explicitly REUSE `ContentBlockRenderer`/`ContentBlockEditor` built
here rather than creating new ones, so make sure both components are genuinely generic (not
accidentally hardcoded to assume "skill roadmap" naming/shape anywhere in their internals).
```

---

## PHASE 8 PROMPT — Company-wise Information & Alumni Repositories

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–7 are complete,
including the generic `ContentBlockRenderer.jsx` / `ContentBlockEditor.jsx` pair from Phase 7 —
REUSE these two components in this phase, do not create new ones. This is Phase 8 of 13.

CONTEXT — WHAT ALREADY EXISTS: `contentBlock.schema.js` (the reusable Mongoose sub-schema) from
Phase 7 — reuse it for `CompanyInfo.prevYearQuestions`. `ContentBlockRenderer`/`Editor` from Phase
7 — reuse for that same field on both the student view and admin editor.

YOUR TASK THIS PHASE: Build the placement-drive info module (company lifecycle: upcoming →
ongoing → completed, with round-by-round stats) and the alumni-repository module, with the two
cross-linked so a company's detail page shows its relevant alumni entries at the bottom.

BACKEND — build exactly this:

1. Models:
   - `backend/src/models/CompanyInfo.model.js` — `name` (String, required), `description`
     (String), `status` (String, enum ['upcoming','ongoing','completed'], default 'upcoming',
     indexed), `academicYear` (String, indexed), `eligibilityCriteria` (String), `ctc` (String or
     Number, your call), `roles` ([String]), `rounds` ([{roundName: String, attended: Number,
     passed: Number, focusTopics: [String]}]), `totalCleared` (Number, default 0),
     `prevYearQuestions` ([ContentBlockSchema] — import from Phase 7's shared file, do not
     redefine it), `offlineOrOnline` (String, enum ['offline','online']), `linkedAlumniRepos`
     ([ObjectId ref AlumniRepo]), `createdBy` (ObjectId ref User), timestamps: true.
   - `backend/src/models/AlumniRepo.model.js` — `name` (String, required), `rollNo` (String),
     `linkedin` (String), `email` (String), `profileImage` (String), `companiesSecured`
     ([{company: {type: ObjectId, ref:'CompanyInfo'}, offerType: String, ctc: String,
     interviewQuestions: [String], reviews: String, tips: String}]), `createdBy` (ObjectId ref
     User), timestamps: true.

2. `backend/src/controllers/companyInfo.controller.js` + `backend/src/routes/student/companyInfo.routes.js`
   mounted at `/api/v1/student`, auth-required:
   - `GET /student/companies?status=&year=` — filterable list; for `status=completed`, also
     support grouping-by-academicYear at either the query layer (return already grouped) or leave
     grouping to the frontend (return a flat filtered list, sorted by academicYear desc) — pick
     whichever is simpler for you to implement correctly and be consistent, document your choice
     in a comment.
   - `GET /student/companies/:id` — single company, with `linkedAlumniRepos` POPULATED (not just
     IDs — the frontend needs the actual alumni data to render at the bottom of the company detail
     view).

3. `backend/src/controllers/alumniRepo.controller.js` + `backend/src/routes/student/alumniRepo.routes.js`:
   - `GET /student/alumni-repos?company=` — filters by matching `companiesSecured.company`.

4. `backend/src/controllers/admin/companies.admin.controller.js` +
   `backend/src/routes/admin/companies.routes.js` mounted at `/api/v1/admin`, admin-gated:
   - Full CRUD `GET/POST/PATCH/DELETE /admin/companies`.
   - `PATCH /admin/companies/:id/status` — a focused endpoint just for moving between
     upcoming/ongoing/completed (or fold this into the general PATCH if you prefer — either is
     fine, just make the status transition explicit and validated, e.g. don't allow an arbitrary
     string, only the three valid enum values).
   - `POST /admin/companies/:id/link-alumni-repo` — body `{alumniRepoId}`, pushes into
     `linkedAlumniRepos` if not already present (idempotent).

5. `backend/src/controllers/admin/alumniRepos.admin.controller.js` +
   `backend/src/routes/admin/alumniRepos.routes.js` — full CRUD, `POST`/`PATCH` accept the full
   `companiesSecured` array (repeatable sub-entries, multiple companies per alumnus supported
   directly in the payload, not via separate calls).

FRONTEND — build exactly this:

1. `frontend/src/pages/dashboard/Companies.jsx` — status tabs (Completed / Ongoing / Upcoming);
   within Completed, group by `academicYear` (client-side grouping if the backend returned a flat
   list per your Step-2 decision above) showing aggregated stat boxes (count placed, CTC range,
   roles) per year. Clicking a company opens a detail view: description, eligibility criteria,
   full recruitment process text, round-by-round table (attended/passed/focusTopics), CTC/roles,
   `prevYearQuestions` rendered via the REUSED `ContentBlockRenderer`, `totalCleared` summary, and
   at the very bottom, cards for each populated entry in `linkedAlumniRepos`.

2. `frontend/src/pages/dashboard/AlumniRepos.jsx` — a company filter dropdown/bar, grid of alumni
   cards (name, roll no, small badges for each company secured), clicking expands full detail:
   LinkedIn, mail, GitHub (if present in a `links`-like field — note the design doc's AlumniRepo
   model doesn't have a generic `links` object like User does, just `linkedin`/`email` directly;
   stick to the fields actually defined on the backend model above), companies secured with
   per-company reviews/interview-questions/tips.

3. `frontend/src/pages/admin/ManageCompanies.jsx` — "Add Company" form (name, description,
   eligibilityCriteria, ctc, roles, offlineOrOnline), a status-transition control (dropdown or
   button group: Upcoming → Ongoing → Completed), a repeatable rounds editor (add/remove round
   rows: roundName, attended, passed, focusTopics), the REUSED `ContentBlockEditor` for
   `prevYearQuestions`, a `totalCleared` number input, and an "Link Alumni Repo" search-and-attach
   control (search existing alumni repos by name, click to link).

4. `frontend/src/pages/admin/ManageAlumniRepos.jsx` — alumnus form (name, rollNo, linkedin,
   email, profile photo via reused `FileUploader.jsx`), and a repeatable "company secured" block
   editor (add/remove entries: company — ideally a searchable select against existing CompanyInfo
   docs rather than free text, offerType, ctc, interviewQuestions as a simple tag/list input,
   reviews, tips).

5. `frontend/src/services/companyInfo.service.js`, `alumniRepo.service.js`, and their
   `admin/` counterparts.

6. Update `App.jsx`: add `/dashboard/companies`, `/dashboard/alumni-repos`, `/admin/companies`,
   `/admin/alumni-repos`.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. Create a company as "upcoming", move it to "ongoing", then to "completed" — confirm it appears
   under the correct student-facing tab at each stage and disappears from the previous tab.
2. Confirm "completed" companies correctly group by `academicYear` with accurate aggregated stats
   (count/CTC-range/roles) matching what you entered.
3. Add round-by-round stats to a company and confirm the student-facing detail view's table
   matches exactly what admin entered.
4. Add `prevYearQuestions` content blocks of at least two different types on a company; confirm
   they render via the SAME `ContentBlockRenderer` used in Phase 7 (verify in source that no new
   renderer was created for this).
5. Create an alumni repo, link it to a company from the admin Company page; confirm it appears at
   the BOTTOM of that company's student-facing detail view.
6. Filter Alumni Repos by a specific company on the student page; confirm only matching alumni
   appear.
7. Create one alumnus with TWO different companies secured; confirm both display correctly on
   their repo card/detail with their own distinct reviews/questions/tips.

Do NOT build Achievements or Connect Sphere yet — those are Phases 9 and 10.
```

---

## PHASE 9 PROMPT — Department Achievements

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–8 are complete,
including the reusable `ContentBlockRenderer.jsx`/`ContentBlockEditor.jsx` pair (Phase 7) and the
`contentBlock.schema.js` sub-schema — REUSE both here for achievement media, do not recreate them.
This is Phase 9 of 13 — the shortest phase, a straightforward searchable feed.

YOUR TASK THIS PHASE: A searchable, chronologically-sorted feed of department/student
achievements, admin-only to post, browsable/searchable by all students.

BACKEND — build exactly this:

1. `backend/src/models/Achievement.model.js` — `title` (String, required), `description`
   (String), `media` ([ContentBlockSchema] — reused from Phase 7's shared file), `date` (Date,
   required, indexed descending for newest-first sort), `postedBy` (ObjectId ref User), timestamps:
   true. Add a text index on `title` and `description` (`Achievement.index({title:'text',
   description:'text'})`) to support the search endpoint efficiently.

2. `backend/src/controllers/achievement.controller.js` +
   `backend/src/routes/student/achievement.routes.js` mounted at `/api/v1/student`, auth-required:
   - `GET /student/achievements?search=` — if `search` is present, use `$text: {$search:
     search}` against the text index from step 1; otherwise return all, sorted by `date` descending,
     paginated.

3. `backend/src/controllers/admin/achievements.admin.controller.js` +
   `backend/src/routes/admin/achievements.routes.js` mounted at `/api/v1/admin`, admin-gated:
   full CRUD `GET/POST/PATCH/DELETE /admin/achievements`, `POST`/`PATCH` accept the `media` array
   directly (blocks added/edited via the same shape the frontend's `ContentBlockEditor` already
   produces from Phase 7 — no new payload shape needed).

FRONTEND — build exactly this:

1. `frontend/src/pages/dashboard/Achievements.jsx` — a search input (debounced, calling
   `GET /student/achievements?search=`) above a chronological feed of achievement cards (title,
   description, formatted date, media rendered via the REUSED `ContentBlockRenderer`), newest
   first.

2. `frontend/src/pages/admin/ManageAchievements.jsx` — composer (title, description textarea,
   date picker, the REUSED `ContentBlockEditor` for media), a searchable list of existing entries
   below with edit/delete actions.

3. `frontend/src/services/achievement.service.js` and
   `frontend/src/services/admin/achievements.service.js`.

4. Update `App.jsx`: add `/dashboard/achievements` and `/admin/achievements`.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. Post a new achievement as admin; confirm it appears at the TOP of the student-facing feed
   immediately (newest-first sort is correct).
2. Search for a keyword that appears only in one achievement's description (not its title);
   confirm the text search correctly matches on both fields.
3. Add media of at least two different content-block types to one achievement; confirm they
   render via the SAME `ContentBlockRenderer` from Phase 7 (check source, don't just eyeball the
   UI).
4. Confirm a non-admin student cannot reach `/admin/achievements` (route guard) and a direct API
   call to any `/admin/achievements` mutation endpoint with a student session is rejected 403.

Do NOT build Connect Sphere yet — that's Phase 10, the final feature phase before admin-overview
polish and deployment.
```

---

## PHASE 10 PROMPT — Connect Sphere (Community Chat)

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–9 are complete.
Critically, Phase 5 already built the Socket.io CORE infrastructure (`backend/src/sockets/index.js`
with the Redis adapter attached, and a `/notify` namespace) and the frontend's
`frontend/src/hooks/useSocket.js` (built generically to accept a `namespace` param). This is
Phase 10 of 13 — REUSE that existing Socket.io setup by adding a SECOND namespace onto the SAME
`io` instance; do not create a second `Server(...)` instance or duplicate the Redis adapter setup.

CONTEXT — WHAT ALREADY EXISTS: `sockets/index.js`'s `initSockets(httpServer)` calls out to
per-namespace setup functions; Phase 5 registered `setupNotifySocket(io)` there — you will add a
`setupChatSocket(io)` call alongside it in this SAME function, not a separate server bootstrap.
`useSocket.js` already accepts a namespace string, so `useSocket('/chat')` should work with zero
changes to that hook.

YOUR TASK THIS PHASE: Build the real-time, Reddit/group-chat-style Connect Sphere: a permanent,
provably un-deletable main space, admin-creatable additional spaces, live messaging with
reactions, and a strict delete-for-all-only moderation model (no "delete for me" anywhere).

BACKEND — build exactly this:

1. Models:
   - `backend/src/models/ChatSpace.model.js` — `name` (String, required), `isPermanent` (Boolean,
     default false), `isLocked` (Boolean, default false), `createdBy` (ObjectId ref User, nullable
     — null specifically for the seeded permanent space), timestamps: true.
   - `backend/src/models/Message.model.js` — `space` (ObjectId ref ChatSpace, indexed), `sender`
     (ObjectId ref User), `content` (String), `attachments` ([{url: String, type: {type:String,
     enum:['image','doc','video']}}]), `reactions` ([{user: ObjectId ref User, type: {type:String,
     enum:['like'], default:'like'}}]), `deletedForAll` (Boolean, default false), `deletedBy`
     (ObjectId ref User, nullable), timestamps: true.

2. `backend/src/scripts/seedPermanentChatSpace.js` — an idempotent seed step: on app boot (call
   this from `server.js` right after the Mongo connection succeeds, not as a manually-run script
   this time — it needs to run every boot, safely, doing nothing if the permanent space already
   exists), checks if any `ChatSpace` with `isPermanent:true` exists; if not, creates exactly one
   with a sensible default name (e.g. "CSM Community"). This guarantees the permanent space always
   exists on any fresh deploy without a manual step.

3. `backend/src/sockets/chat.socket.js` — exports `setupChatSocket(io)`: creates the `/chat`
   namespace, authenticates each connecting socket via the SAME JWT-cookie pattern used in Phase
   5's `notify.socket.js` (reuse that authentication logic — factor it into a small shared helper
   function if it isn't already, e.g. `backend/src/sockets/authenticateSocket.js`, and have BOTH
   `notify.socket.js` and `chat.socket.js` call it, rather than duplicating the cookie-parsing/JWT-
   verify code twice). On connection, listens for a client-emitted `join-space` event with a
   `spaceId` payload and calls `socket.join(spaceId)`. Server-side emits (triggered from the REST
   controllers below, not directly from socket listeners, since persistence must happen via HTTP
   first): `message:new`, `message:delete`, `reaction:toggle`, each broadcast to
   `io.of('/chat').to(spaceId).emit(...)`.

4. Register `setupChatSocket(io)` inside `sockets/index.js`'s `initSockets` function, alongside
   the existing `setupNotifySocket(io)` call from Phase 5 — do not touch or restructure the
   `/notify` namespace's own logic.

5. `backend/src/controllers/chat.controller.js` + `backend/src/routes/student/chat.routes.js`
   mounted at `/api/v1/student`, auth-required:
   - `GET /student/chat/spaces` — lists all spaces, permanent one first (sort by `isPermanent`
     desc, then `createdAt` asc or similar).
   - `GET /student/chat/:spaceId/messages?page=` — paginated message history for a space, newest
     last (typical chat ordering) or newest first depending on your frontend's rendering approach
     — just be consistent and document which you chose. EXCLUDE messages where
     `deletedForAll:true` from the returned content but you may choose to still return a
     "[message deleted]" placeholder row instead of omitting entirely — pick one approach, either
     is acceptable, just be consistent.
   - `POST /student/chat/:spaceId/messages` — rejects with 403 if the target space `isLocked`;
     otherwise creates the Message doc (reuse `upload.middleware.js` for attachments, image/doc/
     video types), then AFTER successful persistence, emits `message:new` to that space's socket
     room via the `io` instance (you'll need to make the `io` instance accessible to this
     controller — export it from `sockets/index.js` after creation, or pass it via
     `req.app.get('io')` set once in `server.js`, whichever fits your existing app structure).
   - `POST /student/chat/messages/:id/react` — toggles a `{user, type:'like'}` entry in
     `reactions` (add if absent, remove if present — a toggle, not an always-add), emits
     `reaction:toggle` to the message's space room.
   - `DELETE /student/chat/messages/:id` — ONLY allowed if `req.user._id` equals the message's
     `sender` (403 otherwise for students — admin has a SEPARATE delete endpoint below, don't let
     this one implicitly allow admin override too, keep the two paths distinct so the "admin
     moderation" audit trail via `deletedBy` stays meaningful), sets `deletedForAll:true` (leaves
     `deletedBy` null since this was the sender's own action, not moderation), emits
     `message:delete` to the space room. THERE IS NO "delete for me" ENDPOINT AT ALL — do not
     build one, even as an unused option.

6. `backend/src/controllers/admin/chat.admin.controller.js` +
   `backend/src/routes/admin/chat.routes.js` mounted at `/api/v1/admin`, admin-gated:
   - `GET /admin/chat/spaces` — same list as student version, admin doesn't need different data
     here, just admin-only route access for symmetry with the rest of the admin panel's route
     structure.
   - `POST /admin/chat/spaces` — creates a new NON-permanent space (`isPermanent` is never
     settable via this endpoint — always force it to `false` server-side regardless of what's in
     the request body, since only the boot-time seed script may ever create a permanent one).
   - `PATCH /admin/chat/spaces/:id/lock` — toggles `isLocked`.
   - `DELETE /admin/chat/spaces/:id` — MUST reject with 400 if the target space's `isPermanent` is
     true, with a clear error message ("The permanent community space cannot be deleted"); for
     non-permanent spaces, cascade-delete all its Messages too.
   - `DELETE /admin/chat/messages/:id` — admin moderation delete: sets `deletedForAll:true` AND
     `deletedBy: req.user._id` (this is what distinguishes it from the student self-delete path in
     step 5), emits `message:delete` same as the student path.
   - `POST /admin/chat/spaces/:id/remove-member` — body `{email}` or `{rollNo}` (accept either),
     for THIS phase's data model there's no explicit membership list on ChatSpace (spaces are
     implicitly open to all authenticated users per the design doc) — implement "remove a member"
     as a lightweight block-list: add a small `blockedUsers: [ObjectId ref User]` array field to
     `ChatSpace.model.js` (go back and add this field now), and have this endpoint push into it;
     then update the `POST /student/chat/:spaceId/messages` handler to also reject (403) if the
     sender is in that space's `blockedUsers` array.

FRONTEND — build exactly this:

1. `frontend/src/components/connectSphere/ChatSpaceList.jsx` — left-side list of spaces from
   `GET /student/chat/spaces`, permanent space visually distinguished (e.g. a pin icon) and always
   first regardless of any client-side sort.

2. `frontend/src/components/connectSphere/MessageStream.jsx` — renders paginated message history;
   for each message shows sender's `name` AND `rollNo` explicitly (this space always shows
   identity, unlike the Phase-2 peer-profile privacy rules — do not hide anything here), timestamp,
   content, attachments (image inline, doc/video as a chip), a like/thumbs-up reaction toggle with
   count, and — visible only if `message.sender._id === currentUser._id` OR `currentUser.role ===
   'admin'` — a delete button. On mount, calls `useSocket('/chat')` (reused from Phase 5's hook
   with zero modification needed), emits `join-space` with the current spaceId, and subscribes to
   `message:new`/`message:delete`/`reaction:toggle` to update the local message list live.

3. `frontend/src/components/connectSphere/MessageComposer.jsx` — text input + attach button
   (reuse `FileUploader.jsx`) + send button; if the current space's `isLocked` is true, render the
   composer disabled with the exact notice "This space is currently locked by admin" instead of
   the normal input.

4. `frontend/src/pages/dashboard/ConnectSphere.jsx` — combines `ChatSpaceList` (left) +
   `MessageStream` + `MessageComposer` (main panel) for whichever space is currently selected
   (default to the permanent space on first load).

5. `frontend/src/pages/admin/ManageConnectSphere.jsx` — space list (permanent one visibly flagged
   as non-deletable — grey out or hide its delete button entirely in the UI, in addition to the
   backend rejecting it, so admins get clear feedback rather than a surprising error), "Create
   Space" form (name only — no `isPermanent` toggle exposed in the UI at all, matching the backend
   which ignores that field anyway), and per-space moderation controls: lock/unlock toggle, "Remove
   Member" input (email or roll number), and within that space's message view, a delete button on
   every message regardless of sender (admin override).

6. `frontend/src/services/chat.service.js` and `frontend/src/services/admin/chat.service.js`.

7. Update `App.jsx`: add `/dashboard/connect-sphere` and `/admin/connect-sphere`.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. On a completely fresh database (drop and recreate for this test if needed), boot the backend
   and confirm the permanent space is auto-created with zero manual steps.
2. Attempt to delete the permanent space both via the admin UI (button should be disabled/hidden)
   AND via a direct API call (should be rejected 400 with the specific error message) — confirm
   BOTH layers of protection work, not just one.
3. Open the SAME space in two different browser sessions (e.g. two different logged-in test
   students, or one normal + one incognito window); send a message from one — confirm it appears
   LIVE in the other session with zero manual refresh, proving the `/chat` namespace correctly
   shares the SAME `io`/Redis-adapter instance set up in Phase 5 (if this doesn't work live, the
   most likely bug is a second, separate Socket.io server instance being created instead of
   reusing the existing one — check for that specifically).
4. Confirm every message displays sender name + roll number, with no privacy hiding of any kind
   in this specific module (deliberately different from Phase 2's peer-profile rules).
5. As the message's own sender, delete it — confirm it disappears LIVE in the OTHER open session
   too (not just your own), and confirm there is no "delete for me" option anywhere in the UI or
   API.
6. As a DIFFERENT student (not the sender), attempt to delete someone else's message via a direct
   API call — confirm it's rejected 403.
7. As admin, delete any message (including one you didn't send) — confirm it works, and confirm
   in the database that `deletedBy` is set for this path but was null for the sender-self-delete
   path in step 5 (this distinction matters for the moderation audit trail).
8. Lock a space as admin — confirm the composer visibly disables with the exact required notice
   text for students already in that space, live, without them needing to refresh.
9. Remove a member from a space by roll number — confirm that student can no longer post in that
   space (403 on send) though they can still view history.
10. Create a new non-permanent space as admin, then delete it — confirm its messages are gone too
    (cascade delete).

Do NOT build the Admin Overview stats dashboard or do any deployment work yet — those are Phases
11 and 12, the final two phases of this project.
```

---

## PHASE 11 PROMPT — Admin Overview Dashboard & Final Content Polish

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–10 are ALL
complete — every feature module described in the original requirements now exists and has been
individually verified. This is Phase 11 of 13, a tie-everything-together and polish phase, not a
new-feature phase.

CONTEXT — WHAT ALREADY EXISTS: literally everything — auth, dashboard shell, profile, admin
roster management, public Home, Announcements (with live sockets), Events (with Zoom/Drive),
Skill Roadmap/Certifications/Learning Resources/Resume Guide (sharing the generic content-block
system), Company Info/Alumni Repos, Achievements, and Connect Sphere (sharing the Phase-5
Socket.io core). `AdminHome.jsx` currently still shows the Phase-3 placeholder text. Every module
built since Phase 2 has real backend data now — this phase's job is making the admin landing page
and the student dashboard's module tiles reflect that real data everywhere a placeholder was left
behind, and doing a full visual/UX consistency pass.

YOUR TASK THIS PHASE: Build the real Admin Overview stats page, sweep the entire student dashboard
for any remaining placeholder/static tiles from earlier phases and wire them to real data, and do
a full loading/empty/error-state and dark-light-theme consistency pass across the WHOLE
application (public + student + admin).

BACKEND — build exactly this:

1. `backend/src/controllers/admin/overview.admin.controller.js` +
   route `GET /api/v1/admin/overview-stats`, admin-gated. Use `Promise.all(...)` to run these
   counts CONCURRENTLY, not sequentially:
   - Total students (`User.countDocuments({role:'student'})`).
   - Total admins (`User.countDocuments({role:'admin'})`).
   - Active events count (`Event.countDocuments({expiresAt: {$gt: new Date()}})`).
   - Pending event registrations — define this clearly (e.g. registrations for events that
     haven't started yet, `status:'registered'`) and implement accordingly.
   - Announcement engagement — for the most recent N announcements, compute read-count vs
     total-eligible-students ratio (reuse `announcementEligibility.service.js`'s logic conceptually
     to determine "eligible" — you may need a small aggregation here since eligibility is normally
     computed per-student, not per-announcement; a reasonable approximation is fine, document
     whatever simplification you make in a code comment).
   - Recent Connect Sphere activity — e.g. message count in the last 24 hours across all spaces.
   Return all of these in one `{success:true, data:{...}}` payload.

2. Do a backend-wide sweep (do this yourself, systematically, across every controller file built
   in Phases 1–10): confirm every controller uses `apiResponse.js`'s response helper and
   `asyncHandler.js`'s wrapper consistently; confirm every error path is actually reaching
   `errorHandler.middleware.js` rather than an ad-hoc `res.status(...).json(...)` scattered in a
   controller; fix any inconsistencies you find. This is a real code-quality pass, not a
   rubber-stamp — actually open and check each file.

3. Add any missing indexes you identify during this sweep — in particular, double check the
   `Achievement` text index and the `User` search-related fields from Phase 2 are performing
   acceptably; add compound indexes anywhere a list/filter endpoint is doing a full collection
   scan under realistic data volumes.

FRONTEND — build exactly this:

1. `frontend/src/pages/admin/AdminHome.jsx` — REPLACE the Phase-3 placeholder entirely: stat tiles
   for every metric returned by `GET /admin/overview-stats`, each tile a clickable quick-link to
   its corresponding management page (Manage Students, Manage Events, Manage Announcements, etc.).

2. Sweep `frontend/src/pages/dashboard/DashboardHome.jsx`: confirm the Events tab, Announcements
   tab, and every module-grid tile (Skill Roadmap, Certifications, Company Info, Alumni Repos,
   Learning Resources, Achievements, Resume Guide, Connect Sphere) now shows REAL live data/counts
   (e.g. "3 new announcements", "2 events ending soon") instead of any leftover Phase-2
   placeholder/static content — go through this file specifically and replace anything you find
   that's still hardcoded or disabled from the original scaffolding phase.

3. Full consistency pass across EVERY page built in Phases 1–10 (make an actual list and go
   through it, don't just spot-check):
   - Every list/detail page that fetches data has a visible loading skeleton/spinner state (not a
     blank flash) and a graceful, friendly empty state when there's genuinely no data yet (not a
     blank screen or a raw "[]").
   - Every page renders correctly in BOTH light and dark theme with no illegible text/contrast
     issues — click through the entire app in both modes.
   - Basic responsive/mobile check (Chrome devtools device emulation at a phone width) on at
     least: Home, Login/Register, Dashboard Home, Profile, Announcements, Events, Connect Sphere,
     and the Admin panel's main table-heavy pages (Manage Students, Manage Events) — confirm
     sidebars collapse sensibly and tables don't overflow unusably.

4. `frontend/src/services/admin/overview.service.js` wrapping the new stats endpoint.

VERIFY THIS PHASE YOURSELF BEFORE MOVING ON:
1. Manually count real records in the database for 3-4 of the Admin Overview's stat categories
   and confirm the UI's numbers match exactly.
2. Click every quick-link tile on Admin Home and confirm each navigates to the correct management
   page.
3. Do a full click-through of EVERY route in the app (list them out first, then go one by one) in
   both light and dark mode; note and fix anything that looks broken, unstyled, or leftover from
   an earlier phase's placeholder state.
4. Specifically re-check `DashboardHome.jsx`'s module grid — confirm zero tiles still show
   Phase-2-era static/fake data.
5. Load a list page (e.g. Announcements, Events, Achievements) with genuinely zero data (a fresh
   test account with no eligible announcements, or delete all achievements temporarily) and
   confirm a friendly empty state renders rather than a blank/broken screen.
6. Confirm mobile-width rendering is usable (not necessarily beautiful, but usable — no
   horizontally-cut-off tables with no scroll, no unreachable buttons) on the pages listed above.

Do NOT do any deployment/production-hardening work yet — that is Phase 12, the final phase.
```

---

## PHASE 12 PROMPT — Testing, Security Hardening & Deployment

```
ROLE: You are continuing work on "TMP — CSM Department Web Platform". Phases 0–11 are ALL
complete: every feature works, the admin overview reflects real data, and a full UX/consistency
pass is done. This is Phase 12 of 13 — wait, this is actually the FINAL phase (12 of 13 counting
from 0), taking the application from "works in dev" to a genuinely production-ready, secured,
backed-up Docker deployment. Treat this phase with the same seriousness as a pre-launch security
review, because that is exactly what it is.

CONTEXT — WHAT ALREADY EXISTS: a fully feature-complete application across 4 Docker services
(frontend, backend, mongo, redis) from Phase 0's compose file, extended with real environment
variables for SMTP/Google Drive/Zoom added during Phase 6. Rate limiting exists on `/auth/*` from
Phase 1 but has not been audited across every OTHER sensitive route. No automated test suite
exists yet — this phase is where it gets built, focused on the highest-risk areas.

YOUR TASK THIS PHASE:
(a) Write automated test coverage for the highest-risk flows across the whole app.
(b) Do a full security audit and close any gaps found.
(c) Finalize the production Docker Compose setup including an Nginx reverse proxy with SSL.
(d) Set up automated MongoDB backups and structured logging.
(e) Write deployment documentation.

BACKEND — do exactly this:

1. Install Jest + Supertest. Write test suites (one file per area, e.g.
   `backend/tests/auth.test.js`, `backend/tests/rbac.test.js`, `backend/tests/otp.test.js`,
   `backend/tests/events.test.js`, `backend/tests/chat.test.js`) against a test MongoDB instance
   (use `mongodb-memory-server` or a dedicated test database — do not run tests against real
   production/dev data). Prioritize, in this order:
   - Full register → OTP verify → login → logout cycle, including wrong-OTP and expired-OTP
     paths.
   - RBAC boundaries: for a representative sample of student-only and admin-only routes across
     multiple modules (not just auth), confirm student tokens get 403 on admin routes and
     unauthenticated requests get 401 everywhere they should.
   - OTP edge cases: exceeding 5 attempts blocks correctly; resend cooldown is enforced; an
     OTP for one `purpose` cannot be used to satisfy a different `purpose`'s verification (e.g. a
     'register' OTP should not work if submitted against the 'login-reset' verification endpoint).
   - Event auto-expiry cron logic: directly unit-test the deletion function (extracted as a
     shared helper in Phase 6) rather than waiting for a real hour-long cron tick — confirm it
     correctly deletes Mongo records and does NOT attempt any Drive-deletion call.
   - Connect Sphere delete-for-all rule: confirm the permanent space cannot be deleted via the
     service/controller layer directly (bypass HTTP, call the function), confirm a student cannot
     delete another student's message, confirm admin-deleted messages have `deletedBy` set while
     self-deleted ones don't.

2. Full security audit — go through this checklist yourself, methodically, against the ACTUAL
   codebase (not from memory of what you intended to build):
   - List EVERY mutating route (POST/PATCH/PUT/DELETE) across the entire `routes/` directory tree
     and confirm each one has `auth.middleware.js` applied, and additionally
     `role.middleware.js('admin')` wherever the design doc's RBAC matrix requires it. Produce this
     as an actual checklist/table in your response so it's auditable, not just a claim that you
     checked.
   - Confirm rate limiting (from Phase 1's `rateLimiter.middleware.js`) is applied not just to
     `/auth/*` but also to `/student/profile/change-password`'s OTP-request step and any other
     OTP-triggering endpoint added in later phases (e.g. double check nothing added since Phase 1
     bypasses rate limiting on OTP generation).
   - Confirm CORS in `app.js` is locked to `FRONTEND_ORIGIN` only (not `*`), and the same origin
     restriction is applied to the Socket.io CORS config from Phase 5.
   - Confirm no secret (JWT secrets, SMTP password, Google service account JSON, Zoom client
     secret) ever appears in ANY frontend bundle, API response, or committed file — grep the
     frontend build output and the git history for anything that looks like a leaked credential.
   - Confirm every file-upload endpoint across every phase (profile photo, achievements, event
     certificates, announcement attachments, chat attachments, hero image, alumni profile photo)
     enforces its MIME-type allow-list and size cap SERVER-SIDE, not just in the frontend
     `FileUploader.jsx` component (client-side checks are a UX nicety, not a security boundary).
   - Confirm Helmet is configured with sensible defaults and hasn't been accidentally weakened.

3. `backend/src/scripts/backup-mongo.sh` (or a scheduled sidecar approach — your choice) — a
   `mongodump` script targeting the `mongo` service, writing to a mounted backup volume, intended
   to be run on a schedule (document the recommended cron schedule, e.g. daily, in comments or in
   the deployment doc from step 5 below).

4. Add structured logging: install `winston`, configure it in a new `backend/src/config/logger.js`
   (console transport for dev, file transport with rotation for production), replace the `morgan`
   dev-only logging from Phase 0 with a production-appropriate combined setup (morgan piping into
   winston is a common, acceptable pattern — implement it that way if it fits cleanly).

5. Write `DEPLOYMENT.md` at the project root covering: the one-time `seedFirstAdmin.js` bootstrap
   step from Phase 3, the full list of required production `.env` values (real SMTP creds, real
   Google service account JSON, real Zoom S2S credentials, strong randomly-generated JWT secrets,
   correct `FRONTEND_ORIGIN`/`ALLOWED_EMAIL_DOMAIN`), how to run the backup script and recommended
   schedule, and the exact `docker compose build && docker compose up -d` deployment sequence.

FRONTEND — do exactly this:

1. Install React Testing Library (if not already present) and Jest/Vitest for the frontend. Write
   targeted tests for the highest-risk COMPONENTS (not every component — be selective and
   prioritize): `OtpInput` (auto-advance, backspace, resend-cooldown behavior), `AuthContext`
   (login/logout state transitions, the 401-refresh-retry interceptor logic from Phase 1),
   `ContentBlockRenderer`/`ContentBlockEditor` (correct rendering per block type, correct
   add/remove/reorder behavior), `PeerProfileView` (confirms hidden fields render as placeholders,
   never accidentally leak raw data even if the backend response shape changes unexpectedly),
   `MessageStream` (confirms delete-for-all removes a message from the rendered list for ALL
   props/senders, and that there is no delete-for-me code path to even test against).

2. Run a full production build (`npm run build`) and sanity-check the output bundle size isn't
   unexpectedly bloated (no accidentally-bundled dev-only dependency, no duplicated large library).

3. Run a Lighthouse (or equivalent) accessibility/performance audit against the production build
   for at least the Home page, Dashboard Home, and one admin management page; note and fix any
   easy/high-value issues (missing alt text, poor color contrast in either theme, missing form
   labels).

DEPLOYMENT — do exactly this:

1. Finalize `docker-compose.yml` to its FULL 5-service production form: add the `nginx-proxy`
   service (placeholder folder existed since Phase 0, build it out now) handling SSL termination
   (via Let's Encrypt/Certbot or an existing college-provided certificate — support both, document
   which env vars control this) and correct routing (`/api` → `backend:5000`, everything else →
   `frontend:80`).
2. Finalize the production `.env` (based on `.env.example` from Phase 0, now with every var
   accumulated across all 12 phases: PORT, MONGO_URI, REDIS_URL, JWT_ACCESS_SECRET,
   JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, SMTP_HOST/PORT/USER/PASS,
   GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_DRIVE_ROOT_FOLDER_ID, ZOOM_ACCOUNT_ID/CLIENT_ID/
   CLIENT_SECRET, ALLOWED_EMAIL_DOMAIN, FRONTEND_ORIGIN).
3. Optional but recommended: a basic GitHub Actions workflow (`.github/workflows/ci.yml`) that
   runs `docker compose build` for all services on every push, so a broken build is caught
   immediately even without full auto-deploy.

VERIFY THIS PHASE YOURSELF BEFORE CONSIDERING THE PROJECT COMPLETE:
1. Run the FULL regression checklist from every prior phase's prompt (0 through 11) — yes, all of
   them — against the PRODUCTION Docker build (`docker compose -f docker-compose.yml up -d` using
   the finalized production compose file), not the dev setup. This is tedious but is the actual
   point of this phase — a feature that worked in dev but breaks in the production build is not
   done.
2. Load-test the Announcements and Connect Sphere socket paths with several concurrent simulated
   clients (a simple script opening multiple socket.io-client connections works fine) and confirm
   the Redis adapter correctly distributes events across all of them.
3. `docker compose down && docker compose up -d` — confirm ALL MongoDB and Redis data survives a
   full container restart cycle.
4. Run the backup script, then restore the resulting dump into a completely fresh `mongo-data`
   volume, and confirm the restored data matches.
5. Run an automated basic security scan (OWASP ZAP baseline scan or similar) against the deployed
   instance and address any high/medium findings.
6. Confirm HTTPS is enforced end-to-end (HTTP requests redirect to HTTPS) and there are no
   mixed-content browser warnings on any page.
7. Have a fresh pair of eyes (or a completely new Antigravity session with no memory of this
   build) do a cold read-through of `DEPLOYMENT.md` and attempt to follow it from a totally clean
   environment — confirm it's actually sufficient on its own, with no missing implicit steps.

This is the final phase. Once every checklist item across every one of these 13 phase prompts
(0 through 12) has genuinely passed against the production build, the platform is complete and
launch-ready.
```
