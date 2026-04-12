import cors from "cors";
import express from "express";
import { API_ORIGIN, LATEST_BACKEND_VERSION } from "./config";
import { attachVersionContext } from "./middleware/version-context";
import { createApiRouter } from "./routes/router";

export const createApiMockApp = () => {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      api_origin: API_ORIGIN
    });
  });

  const apiRouter = createApiRouter();

  app.use(
    "/api",
    attachVersionContext({
      getRequestedVersion: () => LATEST_BACKEND_VERSION
    }),
    apiRouter
  );

  app.use(
    "/:backendVersion/api",
    attachVersionContext({
      getRequestedVersion: (request) => String(request.params.backendVersion ?? "")
    }),
    apiRouter
  );

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled API mock error", error);
    response.status(500).json({
      message: "Internal mock API error"
    });
  });

  return app;
};
