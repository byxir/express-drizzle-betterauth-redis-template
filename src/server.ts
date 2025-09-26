import express from "express";
import cookies from "cookie-parser";
import cors from "cors";
import { setupSwagger } from "./plugins/swagger";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/authConfig";

import redisClient from "./db/redis";

//import for routes
import homeRoute from "./routes/api/home";
import authRoute from "./routes/api/auth";

const app = express();

import { errorHandler } from "./middleware/errorHandler";
import rateLimiter from "./middleware/rateLimiter";

//Database imports and connect to it
// import { connectToPostgresDB } from "./db";
// connectToPostgresDB();
redisClient.connect();

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookies());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? "http://your-frontend-domain.com" : "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true // Allow credentials (cookies, authorization headers, etc.)));
  })
);
setupSwagger(app);

app.use(rateLimiter);

app.get("/api/v1/ping", (req, res) => {
  return res.status(200).json({ message: "pong" });
});

app.use("/api/v1/home", homeRoute);
app.use("/api/v1/auth", authRoute);

app.use(errorHandler);

export default app;
