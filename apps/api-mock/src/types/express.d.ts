import type { AuthSession } from "@naiton/contracts";

declare global {
  namespace Express {
    interface Request {
      backendVersionContext?: {
        requested: string;
        resolved: string;
        latest: string;
        deployed: string[];
        usedFallback: boolean;
      };
      authSession?: AuthSession;
      authToken?: string;
    }
  }
}

export {};
