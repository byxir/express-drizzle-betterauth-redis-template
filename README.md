example env vars:

# Express

EXPRESS_SERVER_PORT=3000
NODE_ENV=development
EXPRESS_ENV=local

# Postgres (adjust for your setup)

POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
POSTGRES_POOL_MAX_SIZE=10
POSTGRES_IDLE_TIMEOUT_IN_MS=30000
POSTGRES_CONN_TIMEOUT_IN_MS=5000

# Or instead of all of the above, you can use:

# POSTGRES_URL=postgres://app_user:app_pass@127.0.0.1:5432/app_db

# Redis (either URL or host/port; pick one style)

# REDIS_URL=redis://127.0.0.1:6379

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_SECRET=change_me_to_a_long_random_string
REDIS_MAX_CONNECTION_RETRY=10
REDIS_MIN_CONNECTION_DELAY_IN_MS=200
REDIS_MAX_CONNECTION_DELAY_IN_MS=5000

# JWT (placeholders)

JWT_SECRET=dev_jwt_secret
JWT_REFRESH_TOKEN=dev_refresh_secret
JWT_ACCESS_TOKEN=dev_access_secret

# Rate limiting

WINDOW_SIZE_IN_SECONDS=60
MAX_NUMBER_OF_REQUESTS_AUTH_USER_PER_WINDOW_SIZE=100
MAX_NUMBER_OF_REQUESTS_NOT_LOGGEDIN_USER_PER_WINDOW_SIZE=30

BETTER_AUTH_SECRET=betterauthsecret
BETTER_AUTH_URL=http://localhost:3000 # Base URL of your app

---

signup body:

POST /sign-up/email

const { data, error } = await authClient.signUp.email({
name: "John Doe", // required
email: "john.doe@example.com", // required
password: "password1234", // required
image: "https://example.com/image.png",
callbackURL: "https://example.com/callback",
});

signin body:

POST /sign-in/email

const { data, error } = await authClient.signIn.email({
email: "john.doe@example.com", // required
password: "password1234", // required
rememberMe: true,
callbackURL: "https://example.com/callback",
});
