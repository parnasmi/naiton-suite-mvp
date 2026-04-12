import {
  AdminOverviewSchema,
  ApiEndpoints,
  AuthSessionSchema,
  CrmCompanyListResponseSchema,
  CrmCompanySchema,
  DashboardSummarySchema,
  FleetVehicleListResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  MapMarkerListResponseSchema,
  NavigationResponseSchema,
  NotificationListResponseSchema,
  SalesOrderListResponseSchema,
  SalesOrderSchema,
  SearchResponseSchema,
  type AdminOverview,
  type AuthSession,
  type CrmCompany,
  type CrmCompanyListResponse,
  type DashboardSummary,
  type FleetVehicleListResponse,
  type ListQuery,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse,
  type MapMarker,
  type NavModule,
  type Notification,
  type SalesOrder,
  type SalesOrderListResponse,
  type SearchResponse
} from "./index";
import { buildListQuerySearchParams, type ListQueryPrimitive } from "./list-query";
import {
  resolveRuntimeApiBase,
  type RuntimeApiBaseResolution,
  type RuntimeApiBaseResolutionInput
} from "./runtime-api";

type FetchLike = typeof fetch;

export interface NaitonApiClientOptions extends RuntimeApiBaseResolutionInput {
  authToken?: string;
  fetchImpl?: FetchLike;
  headers?: HeadersInit;
}

interface RequestOptions {
  path: string;
  method?: "GET" | "POST";
  query?: URLSearchParams;
  body?: unknown;
  signal?: AbortSignal;
}

export interface NaitonApiClient {
  readonly resolution: RuntimeApiBaseResolution;
  setAuthToken(token?: string): void;
  login(payload: LoginRequest, signal?: AbortSignal): Promise<LoginResponse>;
  logout(signal?: AbortSignal): Promise<LogoutResponse>;
  me(signal?: AbortSignal): Promise<AuthSession>;
  getNavigation(signal?: AbortSignal): Promise<NavModule[]>;
  getNotifications(signal?: AbortSignal): Promise<Notification[]>;
  search(query: string, signal?: AbortSignal): Promise<SearchResponse>;
  getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary>;
  getSalesOrders(
    query?: Partial<ListQuery> & Record<string, ListQueryPrimitive | null | undefined>,
    signal?: AbortSignal
  ): Promise<SalesOrderListResponse>;
  getSalesOrder(orderId: string, signal?: AbortSignal): Promise<SalesOrder>;
  getCrmCompanies(
    query?: Partial<ListQuery> & Record<string, ListQueryPrimitive | null | undefined>,
    signal?: AbortSignal
  ): Promise<CrmCompanyListResponse>;
  getCrmCompany(companyId: string, signal?: AbortSignal): Promise<CrmCompany>;
  getFleetVehicles(
    query?: Partial<ListQuery> & Record<string, ListQueryPrimitive | null | undefined>,
    signal?: AbortSignal
  ): Promise<FleetVehicleListResponse>;
  getMapMarkers(signal?: AbortSignal): Promise<MapMarker[]>;
  getAdminOverview(signal?: AbortSignal): Promise<AdminOverview>;
}

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined;
  }

  return response.json();
};

export const createNaitonApiClient = ({
  fetchImpl = fetch,
  authToken,
  headers,
  ...resolutionInput
}: NaitonApiClientOptions): NaitonApiClient => {
  const resolution = resolveRuntimeApiBase(resolutionInput);
  let token = authToken;

  const request = async ({
    path,
    method = "GET",
    query,
    body,
    signal
  }: RequestOptions): Promise<unknown> => {
    const url = new URL(`${resolution.versionedOrigin}${path}`);
    if (query) {
      url.search = query.toString();
    }

    const response = await fetchImpl(url, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });

    const json = await parseJsonResponse(response);

    if (!response.ok) {
      const message =
        typeof json === "object" && json !== null && "message" in json
          ? String(json.message)
          : `${method} ${path} failed with ${response.status}`;
      throw new Error(message);
    }

    return json;
  };

  return {
    resolution,
    setAuthToken(nextToken) {
      token = nextToken;
    },
    async login(payload, signal) {
      const requestPayload = LoginRequestSchema.parse(payload);
      const result = await request({
        path: ApiEndpoints.auth.login,
        method: "POST",
        body: requestPayload,
        signal
      });

      const parsed = LoginResponseSchema.parse(result);
      token = parsed.token;
      return parsed;
    },
    async logout(signal) {
      const result = await request({
        path: ApiEndpoints.auth.logout,
        method: "POST",
        signal
      });

      const parsed = LogoutResponseSchema.parse(result);
      token = undefined;
      return parsed;
    },
    async me(signal) {
      const result = await request({
        path: ApiEndpoints.auth.me,
        signal
      });

      return AuthSessionSchema.parse(result);
    },
    async getNavigation(signal) {
      const result = await request({
        path: ApiEndpoints.navigation,
        signal
      });

      return NavigationResponseSchema.parse(result);
    },
    async getNotifications(signal) {
      const result = await request({
        path: ApiEndpoints.notifications,
        signal
      });

      return NotificationListResponseSchema.parse(result);
    },
    async search(query, signal) {
      const result = await request({
        path: ApiEndpoints.search,
        query: buildListQuerySearchParams({ q: query.trim() }),
        signal
      });

      return SearchResponseSchema.parse(result);
    },
    async getDashboardSummary(signal) {
      const result = await request({
        path: ApiEndpoints.dashboard.summary,
        signal
      });

      return DashboardSummarySchema.parse(result);
    },
    async getSalesOrders(query, signal) {
      const result = await request({
        path: ApiEndpoints.sales.orders,
        query: buildListQuerySearchParams(query ?? {}),
        signal
      });

      return SalesOrderListResponseSchema.parse(result);
    },
    async getSalesOrder(orderId, signal) {
      const result = await request({
        path: ApiEndpoints.sales.orderById(orderId),
        signal
      });

      return SalesOrderSchema.parse(result);
    },
    async getCrmCompanies(query, signal) {
      const result = await request({
        path: ApiEndpoints.crm.companies,
        query: buildListQuerySearchParams(query ?? {}),
        signal
      });

      return CrmCompanyListResponseSchema.parse(result);
    },
    async getCrmCompany(companyId, signal) {
      const result = await request({
        path: ApiEndpoints.crm.companyById(companyId),
        signal
      });

      return CrmCompanySchema.parse(result);
    },
    async getFleetVehicles(query, signal) {
      const result = await request({
        path: ApiEndpoints.fms.vehicles,
        query: buildListQuerySearchParams(query ?? {}),
        signal
      });

      return FleetVehicleListResponseSchema.parse(result);
    },
    async getMapMarkers(signal) {
      const result = await request({
        path: ApiEndpoints.fms.mapMarkers,
        signal
      });

      return MapMarkerListResponseSchema.parse(result);
    },
    async getAdminOverview(signal) {
      const result = await request({
        path: ApiEndpoints.admin.overview,
        signal
      });

      return AdminOverviewSchema.parse(result);
    }
  };
};
