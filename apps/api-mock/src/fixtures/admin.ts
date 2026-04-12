import { AdminOverviewSchema } from "@naiton/contracts";

export const adminOverview = AdminOverviewSchema.parse({
  total_users: 243,
  active_users: 187,
  roles_breakdown: [
    { role: "owner", count: 3 },
    { role: "admin", count: 14 },
    { role: "manager", count: 52 },
    { role: "operator", count: 130 },
    { role: "viewer", count: 44 }
  ],
  module_health: [
    { module: "shell", uptime_percent: 99.98, incidents_open: 0 },
    { module: "sales", uptime_percent: 99.84, incidents_open: 1 },
    { module: "crm", uptime_percent: 99.9, incidents_open: 0 },
    { module: "fms", uptime_percent: 99.41, incidents_open: 2 },
    { module: "admin", uptime_percent: 99.77, incidents_open: 0 }
  ],
  latest_deployment: {
    version: "1.4.0",
    date: "2026-04-10T06:30:00.000Z"
  }
});
