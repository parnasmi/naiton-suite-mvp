import { z } from "zod";

export const SemverSchema = z.string().regex(/^\d+\.\d+\.\d+$/, {
  message: "Expected semantic version in x.y.z format"
});

export const IsoDateStringSchema = z.string().datetime({ offset: true });

export const ListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(20),
    search: z.string().trim().default(""),
    sort: z.string().trim().default("")
  })
  .passthrough();

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0)
});

export const createPagedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema
  });

export const AuthRoleSchema = z.enum(["owner", "admin", "manager", "operator", "viewer"]);

export const AuthSessionSchema = z.object({
  user_id: z.string().min(1),
  username: z.string().min(1),
  display_name: z.string().min(1),
  role: AuthRoleSchema,
  permissions: z.array(z.string()).default([]),
  frontend_version: SemverSchema,
  latest_frontend_version: SemverSchema,
  backend_version: SemverSchema,
  latest_backend_version: SemverSchema,
  deployed_frontend_versions: z.array(SemverSchema).default([]),
  deployed_backend_versions: z.array(SemverSchema).default([]),
  locale: z.string().min(2).default("en"),
  avatar_url: z.string().url().optional(),
  expires_at: IsoDateStringSchema.optional()
});

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const LoginResponseSchema = z.object({
  session: AuthSessionSchema,
  token: z.string().min(1)
});

export const LogoutResponseSchema = z.object({
  success: z.literal(true)
});

export const NavModuleKeySchema = z.enum([
  "shell",
  "sales",
  "crm",
  "fms",
  "admin",
  "wms",
  "procurement",
  "production",
  "accounting",
  "hrm",
  "cms"
]);

export const NavModuleSchema = z.object({
  key: NavModuleKeySchema,
  label: z.string().min(1),
  host: z.string().min(1),
  route_template: z.string().min(1),
  enabled: z.boolean(),
  coming_soon: z.boolean().default(false),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0)
});

export const NavigationResponseSchema = z.array(NavModuleSchema);

export const NotificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().default(""),
  created_at: IsoDateStringSchema,
  read: z.boolean().default(false),
  severity: z.enum(["info", "success", "warning", "error"]).default("info")
});

export const NotificationListResponseSchema = z.array(NotificationSchema);

export const DashboardKpiSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.number(),
  unit: z.string().default(""),
  trend_percent: z.number().default(0)
});

export const DashboardSummarySchema = z.object({
  period_label: z.string().min(1),
  currency: z.string().length(3),
  kpis: z.array(DashboardKpiSchema),
  revenue_series: z.array(
    z.object({
      label: z.string().min(1),
      value: z.number()
    })
  ),
  activity_feed: z.array(
    z.object({
      id: z.string().min(1),
      message: z.string().min(1),
      timestamp: IsoDateStringSchema
    })
  )
});

export const SalesOrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled"
]);

export const SalesOrderSchema = z.object({
  id: z.string().min(1),
  order_no: z.string().min(1),
  customer_name: z.string().min(1),
  status: SalesOrderStatusSchema,
  amount: z.number(),
  currency: z.string().length(3),
  created_at: IsoDateStringSchema,
  updated_at: IsoDateStringSchema,
  manager_name: z.string().min(1),
  line_count: z.number().int().min(1)
});

export const SalesOrderListResponseSchema = createPagedResponseSchema(SalesOrderSchema);

export const CrmCompanySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  relationship_type: z.string().min(1),
  account_manager: z.string().min(1),
  tax_number: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  industry: z.string().min(1),
  is_active: z.boolean(),
  created_at: IsoDateStringSchema
});

export const CrmCompanyListResponseSchema = createPagedResponseSchema(CrmCompanySchema);

export const VehicleStatusSchema = z.enum(["online", "idle", "offline", "maintenance", "alert"]);

export const FleetVehicleSchema = z.object({
  id: z.string().min(1),
  plate_number: z.string().min(1),
  driver_name: z.string().min(1),
  status: VehicleStatusSchema,
  speed_kmh: z.number().min(0),
  ignition_on: z.boolean(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  updated_at: IsoDateStringSchema
});

export const FleetVehicleListResponseSchema = createPagedResponseSchema(FleetVehicleSchema);

export const MapMarkerSchema = z.object({
  id: z.string().min(1),
  vehicle_id: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  status: VehicleStatusSchema,
  label: z.string().min(1)
});

export const MapMarkerListResponseSchema = z.array(MapMarkerSchema);

export const AdminOverviewSchema = z.object({
  total_users: z.number().int().min(0),
  active_users: z.number().int().min(0),
  roles_breakdown: z.array(
    z.object({
      role: z.string().min(1),
      count: z.number().int().min(0)
    })
  ),
  module_health: z.array(
    z.object({
      module: NavModuleKeySchema,
      uptime_percent: z.number().min(0).max(100),
      incidents_open: z.number().int().min(0)
    })
  ),
  latest_deployment: z.object({
    version: SemverSchema,
    date: IsoDateStringSchema
  })
});

export const SearchResultTypeSchema = z.enum([
  "navigation",
  "sales_order",
  "company",
  "vehicle",
  "admin_record",
  "action"
]);

export const SearchResultSchema = z.object({
  id: z.string().min(1),
  type: SearchResultTypeSchema,
  module: NavModuleKeySchema,
  title: z.string().min(1),
  subtitle: z.string().default(""),
  href: z.string().min(1),
  keywords: z.array(z.string()).default([])
});

export const SearchResponseSchema = z.object({
  query: z.string(),
  groups: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      results: z.array(SearchResultSchema)
    })
  )
});

export const ApiEndpoints = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me"
  },
  navigation: "/api/navigation",
  notifications: "/api/notifications",
  search: "/api/search",
  dashboard: {
    summary: "/api/dashboard/summary"
  },
  sales: {
    orders: "/api/sales/orders",
    orderById: (orderId: string) => `/api/sales/orders/${orderId}`
  },
  crm: {
    companies: "/api/crm/companies",
    companyById: (companyId: string) => `/api/crm/companies/${companyId}`
  },
  fms: {
    vehicles: "/api/fms/vehicles",
    mapMarkers: "/api/fms/map-markers"
  },
  admin: {
    overview: "/api/admin/overview"
  }
} as const;

export type ListQuery = z.infer<typeof ListQuerySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type AuthRole = z.infer<typeof AuthRoleSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type NavModuleKey = z.infer<typeof NavModuleKeySchema>;
export type NavModule = z.infer<typeof NavModuleSchema>;
export type NavigationResponse = z.infer<typeof NavigationResponseSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationListResponse = z.infer<typeof NotificationListResponseSchema>;
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
export type SalesOrder = z.infer<typeof SalesOrderSchema>;
export type SalesOrderListResponse = z.infer<typeof SalesOrderListResponseSchema>;
export type CrmCompany = z.infer<typeof CrmCompanySchema>;
export type CrmCompanyListResponse = z.infer<typeof CrmCompanyListResponseSchema>;
export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;
export type FleetVehicle = z.infer<typeof FleetVehicleSchema>;
export type FleetVehicleListResponse = z.infer<typeof FleetVehicleListResponseSchema>;
export type MapMarker = z.infer<typeof MapMarkerSchema>;
export type MapMarkerListResponse = z.infer<typeof MapMarkerListResponseSchema>;
export type AdminOverview = z.infer<typeof AdminOverviewSchema>;
export type SearchResultType = z.infer<typeof SearchResultTypeSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
