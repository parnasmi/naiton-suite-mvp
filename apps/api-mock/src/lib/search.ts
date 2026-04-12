import { SearchResponseSchema, type SearchResult } from "@naiton/contracts";
import { crmCompanies } from "../fixtures/crm";
import { fleetVehicles } from "../fixtures/fms";
import { navigationModules } from "../fixtures/navigation";
import { salesOrders } from "../fixtures/sales";

const searchableEntries: SearchResult[] = [
  ...navigationModules.map((module) => ({
    id: `nav_${module.key}`,
    type: "navigation" as const,
    module: module.key,
    title: module.label,
    subtitle: module.coming_soon ? "Coming soon" : `${module.host}${module.route_template}`,
    href: module.enabled ? `https://${module.host}${module.route_template}` : "#",
    keywords: [module.label, module.key]
  })),
  ...salesOrders.map((order) => ({
    id: `search_sales_${order.id}`,
    type: "sales_order" as const,
    module: "sales" as const,
    title: order.order_no,
    subtitle: `${order.customer_name} • ${order.status}`,
    href: `/sales/orders/${order.id}`,
    keywords: [order.customer_name, order.manager_name, order.status]
  })),
  ...crmCompanies.map((company) => ({
    id: `search_crm_${company.id}`,
    type: "company" as const,
    module: "crm" as const,
    title: company.name,
    subtitle: `${company.relationship_type} • ${company.city}`,
    href: `/crm/companies/${company.id}`,
    keywords: [company.account_manager, company.tax_number, company.industry]
  })),
  ...fleetVehicles.map((vehicle) => ({
    id: `search_fms_${vehicle.id}`,
    type: "vehicle" as const,
    module: "fms" as const,
    title: vehicle.plate_number,
    subtitle: `${vehicle.driver_name} • ${vehicle.status}`,
    href: `/fms/vehicles/${vehicle.id}`,
    keywords: [vehicle.driver_name, vehicle.status]
  }))
];

const normalize = (value: string): string => value.trim().toLowerCase();

export const performSearch = (queryValue: string) => {
  const query = normalize(queryValue);

  const filtered = query
    ? searchableEntries.filter((entry) => {
        const haystack = [entry.title, entry.subtitle, ...entry.keywords].map(normalize);
        return haystack.some((chunk) => chunk.includes(query));
      })
    : searchableEntries.slice(0, 12);

  const groups = [
    {
      id: "navigation",
      label: "Navigation",
      results: filtered.filter((entry) => entry.type === "navigation")
    },
    {
      id: "sales",
      label: "Sales",
      results: filtered.filter((entry) => entry.module === "sales")
    },
    {
      id: "crm",
      label: "CRM",
      results: filtered.filter((entry) => entry.module === "crm")
    },
    {
      id: "fms",
      label: "FMS",
      results: filtered.filter((entry) => entry.module === "fms")
    }
  ].filter((group) => group.results.length > 0);

  return SearchResponseSchema.parse({
    query: queryValue,
    groups
  });
};
