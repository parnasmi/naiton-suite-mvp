import {
  AdminOverviewSchema,
  CrmCompanyListResponseSchema,
  DashboardSummarySchema,
  FleetVehicleListResponseSchema,
  MapMarkerListResponseSchema,
  NavigationResponseSchema,
  NotificationListResponseSchema,
  SalesOrderListResponseSchema,
  SalesOrderSchema
} from "@naiton/contracts";
import { adminOverview } from "../fixtures/admin";
import { crmCompanies } from "../fixtures/crm";
import { dashboardSummary } from "../fixtures/dashboard";
import { fleetVehicles, mapMarkers } from "../fixtures/fms";
import { navigationModules } from "../fixtures/navigation";
import { notifications } from "../fixtures/notifications";
import { salesOrders } from "../fixtures/sales";
import { parseCrmListQuery, parseFleetListQuery, parseSalesListQuery } from "../lib/list-query";
import { paginate } from "../lib/paginate";
import { performSearch } from "../lib/search";
import { parseSort, sortByField } from "../lib/sort";

export const getNavigationPayload = () => NavigationResponseSchema.parse(navigationModules);

export const getNotificationsPayload = () => NotificationListResponseSchema.parse(notifications);

export const getDashboardSummaryPayload = () => DashboardSummarySchema.parse(dashboardSummary);

export const getSearchPayload = (query: string) => performSearch(query);

export const listSalesOrdersPayload = (input: unknown) => {
  const query = parseSalesListQuery(input);

  const searched = query.search
    ? salesOrders.filter((order) => {
        const needle = query.search.toLowerCase();
        return (
          order.order_no.toLowerCase().includes(needle) ||
          order.customer_name.toLowerCase().includes(needle) ||
          order.manager_name.toLowerCase().includes(needle)
        );
      })
    : salesOrders;

  const filteredByStatus = query.status
    ? searched.filter((order) => order.status === query.status)
    : searched;

  const managerFilter = query.manager?.toLowerCase();
  const filteredByManager = managerFilter
    ? filteredByStatus.filter((order) => order.manager_name.toLowerCase().includes(managerFilter))
    : filteredByStatus;

  const sorted = sortByField(
    filteredByManager,
    parseSort(query.sort, ["order_no", "amount", "created_at", "updated_at", "status"] as const)
  );

  const payload = paginate(sorted, query.page, query.pageSize);
  return SalesOrderListResponseSchema.parse(payload);
};

export const getSalesOrderPayload = (orderId: string) => {
  const order = salesOrders.find((candidate) => candidate.id === orderId);
  return order ? SalesOrderSchema.parse(order) : null;
};

export const listCrmCompaniesPayload = (input: unknown) => {
  const query = parseCrmListQuery(input);

  const searched = query.search
    ? crmCompanies.filter((company) => {
        const needle = query.search.toLowerCase();
        return (
          company.name.toLowerCase().includes(needle) ||
          company.tax_number.toLowerCase().includes(needle) ||
          company.account_manager.toLowerCase().includes(needle)
        );
      })
    : crmCompanies;

  const relationshipFilter = query.relationship?.toLowerCase();
  const filteredByRelationship = relationshipFilter
    ? searched.filter((company) => company.relationship_type.toLowerCase() === relationshipFilter)
    : searched;

  const filteredByActive = query.active
    ? filteredByRelationship.filter((company) => String(company.is_active) === query.active)
    : filteredByRelationship;

  const sorted = sortByField(
    filteredByActive,
    parseSort(query.sort, ["name", "country", "city", "created_at", "relationship_type"] as const)
  );

  const payload = paginate(sorted, query.page, query.pageSize);
  return CrmCompanyListResponseSchema.parse(payload);
};

export const getCrmCompanyPayload = (companyId: string) => crmCompanies.find((candidate) => candidate.id === companyId) ?? null;

export const listFleetVehiclesPayload = (input: unknown) => {
  const query = parseFleetListQuery(input);

  const searched = query.search
    ? fleetVehicles.filter((vehicle) => {
        const needle = query.search.toLowerCase();
        return (
          vehicle.plate_number.toLowerCase().includes(needle) ||
          vehicle.driver_name.toLowerCase().includes(needle)
        );
      })
    : fleetVehicles;

  const filteredByStatus = query.status
    ? searched.filter((vehicle) => vehicle.status === query.status)
    : searched;

  const filteredByIgnition = query.ignition
    ? filteredByStatus.filter((vehicle) => (query.ignition === "on" ? vehicle.ignition_on : !vehicle.ignition_on))
    : filteredByStatus;

  const sorted = sortByField(
    filteredByIgnition,
    parseSort(query.sort, ["plate_number", "speed_kmh", "updated_at", "status"] as const)
  );

  const payload = paginate(sorted, query.page, query.pageSize);
  return FleetVehicleListResponseSchema.parse(payload);
};

export const getMapMarkersPayload = () => MapMarkerListResponseSchema.parse(mapMarkers);

export const getAdminOverviewPayload = () => AdminOverviewSchema.parse(adminOverview);
