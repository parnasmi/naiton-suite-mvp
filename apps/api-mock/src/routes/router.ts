import {
  AuthSessionSchema,
  CrmCompanySchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  SalesOrderSchema
} from "@naiton/contracts";
import { Router } from "express";
import { authenticateSeedUser } from "../fixtures/users";
import { requireAuth } from "../middleware/auth";
import {
  getAdminOverviewPayload,
  getCrmCompanyPayload,
  getDashboardSummaryPayload,
  getMapMarkersPayload,
  getNavigationPayload,
  getNotificationsPayload,
  getSalesOrderPayload,
  getSearchPayload,
  listCrmCompaniesPayload,
  listFleetVehiclesPayload,
  listSalesOrdersPayload
} from "../services/endpoints";
import { issueTokenForSession, revokeToken } from "../services/session-store";

export const createApiRouter = (): Router => {
  const router = Router();

  router.post("/auth/login", (request, response) => {
    const parsedBody = LoginRequestSchema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        message: "Invalid login payload",
        issues: parsedBody.error.issues
      });
      return;
    }

    const authenticatedSession = authenticateSeedUser(parsedBody.data.username, parsedBody.data.password);

    if (!authenticatedSession) {
      response.status(401).json({
        message: "Invalid username or password"
      });
      return;
    }

    const token = issueTokenForSession(authenticatedSession);

    response.json(
      LoginResponseSchema.parse({
        session: authenticatedSession,
        token
      })
    );
  });

  router.use(requireAuth);

  router.post("/auth/logout", (request, response) => {
    const token = request.authToken;
    if (token) {
      revokeToken(token);
    }

    response.json(
      LogoutResponseSchema.parse({
        success: true
      })
    );
  });

  router.get("/auth/me", (request, response) => {
    response.json(AuthSessionSchema.parse(request.authSession));
  });

  router.get("/navigation", (_request, response) => {
    response.json(getNavigationPayload());
  });

  router.get("/notifications", (_request, response) => {
    response.json(getNotificationsPayload());
  });

  router.get("/search", (request, response) => {
    const query = typeof request.query.q === "string" ? request.query.q : "";
    response.json(getSearchPayload(query));
  });

  router.get("/dashboard/summary", (_request, response) => {
    response.json(getDashboardSummaryPayload());
  });

  router.get("/sales/orders", (request, response) => {
    response.json(listSalesOrdersPayload(request.query));
  });

  router.get("/sales/orders/:orderId", (request, response) => {
    const payload = getSalesOrderPayload(request.params.orderId);

    if (!payload) {
      response.status(404).json({
        message: "Sales order not found"
      });
      return;
    }

    response.json(SalesOrderSchema.parse(payload));
  });

  router.get("/crm/companies", (request, response) => {
    response.json(listCrmCompaniesPayload(request.query));
  });

  router.get("/crm/companies/:companyId", (request, response) => {
    const payload = getCrmCompanyPayload(request.params.companyId);

    if (!payload) {
      response.status(404).json({
        message: "Company not found"
      });
      return;
    }

    response.json(CrmCompanySchema.parse(payload));
  });

  router.get("/fms/vehicles", (request, response) => {
    response.json(listFleetVehiclesPayload(request.query));
  });

  router.get("/fms/map-markers", (_request, response) => {
    response.json(getMapMarkersPayload());
  });

  router.get("/admin/overview", (_request, response) => {
    response.json(getAdminOverviewPayload());
  });

  return router;
};
