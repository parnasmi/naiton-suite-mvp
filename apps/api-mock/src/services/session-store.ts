import { randomUUID } from "node:crypto";
import type { AuthSession } from "@naiton/contracts";
import { AUTH_TOKEN_PREFIX } from "../config";

const tokenToSession = new Map<string, AuthSession>();

export const issueTokenForSession = (session: AuthSession): string => {
  const token = `${AUTH_TOKEN_PREFIX}_${randomUUID()}`;
  tokenToSession.set(token, session);
  return token;
};

export const getSessionForToken = (token: string): AuthSession | undefined => tokenToSession.get(token);

export const revokeToken = (token: string): boolean => tokenToSession.delete(token);

export const clearSessions = (): void => tokenToSession.clear();
