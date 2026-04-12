import type { NextFunction, Request, Response } from "express";
import { getSessionForToken } from "../services/session-store";

const readBearerToken = (request: Request): string | null => {
  const authHeader = request.header("authorization");

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = (request: Request, response: Response, next: NextFunction) => {
  const token = readBearerToken(request);

  if (!token) {
    response.status(401).json({
      message: "Missing bearer token"
    });
    return;
  }

  const session = getSessionForToken(token);

  if (!session) {
    response.status(401).json({
      message: "Invalid or expired token"
    });
    return;
  }

  request.authToken = token;
  request.authSession = session;
  next();
};
