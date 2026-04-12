import assert from "node:assert/strict";
import test from "node:test";
import {
  AdminOverviewSchema,
  AuthSessionSchema,
  CrmCompanyListResponseSchema,
  DashboardSummarySchema,
  FleetVehicleListResponseSchema,
  LoginResponseSchema,
  MapMarkerListResponseSchema,
  NavigationResponseSchema,
  NotificationListResponseSchema,
  SalesOrderListResponseSchema,
  SearchResponseSchema
} from "@naiton/contracts";
import { resolveRuntimeApiBase } from "@naiton/contracts/runtime-api";
import { API_ORIGIN, DEPLOYED_BACKEND_VERSIONS, LATEST_BACKEND_VERSION } from "./config";
import { authenticateSeedUser } from "./fixtures/users";
import {
  getAdminOverviewPayload,
  getDashboardSummaryPayload,
  getMapMarkersPayload,
  getNavigationPayload,
  getNotificationsPayload,
  getSearchPayload,
  listCrmCompaniesPayload,
  listFleetVehiclesPayload,
  listSalesOrdersPayload
} from "./services/endpoints";
import { issueTokenForSession } from "./services/session-store";

test("auth/profile payload conforms to shared session contract", () => {
  const session = authenticateSeedUser("owner@naiton.com", "naiton123");

  assert.ok(session);
  AuthSessionSchema.parse(session);

  const loginPayload = LoginResponseSchema.parse({
    session,
    token: issueTokenForSession(session)
  });

  assert.equal(loginPayload.session.latest_backend_version, LATEST_BACKEND_VERSION);
});

test("runtime resolver falls back to latest backend when requested version is unavailable", () => {
  const resolution = resolveRuntimeApiBase({
    apiOrigin: API_ORIGIN,
    backendVersion: "1.2.0",
    latestBackendVersion: LATEST_BACKEND_VERSION,
    deployedBackendVersions: DEPLOYED_BACKEND_VERSIONS
  });

  assert.equal(resolution.resolvedBackendVersion, LATEST_BACKEND_VERSION);
  assert.equal(resolution.usedFallback, true);
});

test("navigation payload conforms to contract", () => {
  NavigationResponseSchema.parse(getNavigationPayload());
});

test("notifications payload conforms to contract", () => {
  NotificationListResponseSchema.parse(getNotificationsPayload());
});

test("dashboard summary payload conforms to contract", () => {
  DashboardSummarySchema.parse(getDashboardSummaryPayload());
});

test("search payload conforms to contract", () => {
  SearchResponseSchema.parse(getSearchPayload("meridian"));
});

test("sales list payload conforms to contract", () => {
  SalesOrderListResponseSchema.parse(
    listSalesOrdersPayload({
      page: "1",
      pageSize: "5",
      search: "meridian",
      sort: "amount:desc"
    })
  );
});

test("crm list payload conforms to contract", () => {
  CrmCompanyListResponseSchema.parse(
    listCrmCompaniesPayload({
      page: "1",
      pageSize: "5",
      active: "true",
      sort: "created_at:desc"
    })
  );
});

test("fleet list payload conforms to contract", () => {
  FleetVehicleListResponseSchema.parse(
    listFleetVehiclesPayload({
      page: "1",
      pageSize: "5",
      status: "online"
    })
  );
});

test("map markers payload conforms to contract", () => {
  MapMarkerListResponseSchema.parse(getMapMarkersPayload());
});

test("admin overview payload conforms to contract", () => {
  AdminOverviewSchema.parse(getAdminOverviewPayload());
});
