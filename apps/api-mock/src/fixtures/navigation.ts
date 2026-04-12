import { NavigationResponseSchema, type NavModule } from "@naiton/contracts";

const modules: NavModule[] = [
  {
    key: "shell",
    label: "Shell",
    host: "app.naiton.com",
    route_template: "/{semver}/shell",
    enabled: true,
    coming_soon: false,
    order: 1,
    icon: "layout-dashboard"
  },
  {
    key: "sales",
    label: "Sales",
    host: "sales.naiton.com",
    route_template: "/{semver}/",
    enabled: true,
    coming_soon: false,
    order: 2,
    icon: "shopping-cart"
  },
  {
    key: "crm",
    label: "CRM",
    host: "crm.naiton.com",
    route_template: "/{semver}/",
    enabled: true,
    coming_soon: false,
    order: 3,
    icon: "building"
  },
  {
    key: "fms",
    label: "FMS",
    host: "fms.naiton.com",
    route_template: "/{semver}/",
    enabled: true,
    coming_soon: false,
    order: 4,
    icon: "truck"
  },
  {
    key: "admin",
    label: "Admin",
    host: "admin.naiton.com",
    route_template: "/{semver}/",
    enabled: true,
    coming_soon: false,
    order: 5,
    icon: "shield"
  },
  {
    key: "wms",
    label: "WMS",
    host: "wms.naiton.com",
    route_template: "/{semver}/",
    enabled: false,
    coming_soon: true,
    order: 6,
    icon: "warehouse"
  },
  {
    key: "procurement",
    label: "Procurement",
    host: "procurement.naiton.com",
    route_template: "/{semver}/",
    enabled: false,
    coming_soon: true,
    order: 7,
    icon: "clipboard-list"
  },
  {
    key: "production",
    label: "Production",
    host: "production.naiton.com",
    route_template: "/{semver}/",
    enabled: false,
    coming_soon: true,
    order: 8,
    icon: "factory"
  },
  {
    key: "accounting",
    label: "Accounting",
    host: "accounting.naiton.com",
    route_template: "/{semver}/",
    enabled: false,
    coming_soon: true,
    order: 9,
    icon: "calculator"
  },
  {
    key: "hrm",
    label: "HRM",
    host: "hrm.naiton.com",
    route_template: "/{semver}/",
    enabled: false,
    coming_soon: true,
    order: 10,
    icon: "users"
  },
  {
    key: "cms",
    label: "CMS",
    host: "cms.naiton.com",
    route_template: "/{semver}/",
    enabled: false,
    coming_soon: true,
    order: 11,
    icon: "file-text"
  }
];

export const navigationModules = NavigationResponseSchema.parse(modules);
