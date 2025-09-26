// src/plugins/swagger.ts
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { HomeParameters, HomeResponse } from "src/controller/home/homeSchema";

export function setupSwagger(app: Express) {
  const registry = new OpenAPIRegistry();

  // Legacy auth schemas removed (Better Auth endpoints are mounted under /api/auth/*)
  registry.register("HomeParameters", HomeParameters);
  registry.register("HomeResponse", HomeResponse);

  // Better Auth: Email sign-up and sign-in request bodies
  const AuthEmailSignUpBody = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1).optional()
  });
  const AuthEmailSignInBody = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  });

  registry.register("AuthEmailSignUpBody", AuthEmailSignUpBody);
  registry.register("AuthEmailSignInBody", AuthEmailSignInBody);

  // Basic example: expose session retrieval endpoint
  registry.registerPath({
    method: "get",
    path: "/api/v1/auth/session",
    responses: {
      200: { description: "Current session or null" }
    }
  });

  // Better Auth built-in endpoints (default basePath: /api/auth)
  registry.registerPath({
    method: "post",
    path: "/api/auth/sign-up/email",
    request: { body: { content: { "application/json": { schema: AuthEmailSignUpBody } } } },
    responses: {
      200: { description: "User registered and session created (Set-Cookie)" },
      400: { description: "Invalid request" },
      422: { description: "Validation error" }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/api/auth/sign-in/email",
    request: { body: { content: { "application/json": { schema: AuthEmailSignInBody } } } },
    responses: {
      200: { description: "User signed in (Set-Cookie)" },
      401: { description: "Invalid credentials" },
      422: { description: "Validation error" }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/api/v1/home",
    request: { query: HomeParameters },
    responses: {
      200: {
        description: "Home response",
        content: { "application/json": { schema: HomeResponse } }
      }
    }
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const openApiDoc = generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }]
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
  app.get("/docs-json", (_req, res) => res.json(openApiDoc));
}
