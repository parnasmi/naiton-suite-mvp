import { DashboardSummarySchema } from "@naiton/contracts";

export const dashboardSummary = DashboardSummarySchema.parse({
  period_label: "Last 30 days",
  currency: "USD",
  kpis: [
    {
      id: "revenue",
      label: "Revenue",
      value: 1284300,
      unit: "USD",
      trend_percent: 12.4
    },
    {
      id: "orders",
      label: "Orders",
      value: 3254,
      unit: "",
      trend_percent: 8.9
    },
    {
      id: "active_customers",
      label: "Active customers",
      value: 814,
      unit: "",
      trend_percent: 4.1
    },
    {
      id: "fleet_online",
      label: "Fleet online",
      value: 57,
      unit: "vehicles",
      trend_percent: -1.3
    }
  ],
  revenue_series: [
    { label: "Week 1", value: 282000 },
    { label: "Week 2", value: 305500 },
    { label: "Week 3", value: 333100 },
    { label: "Week 4", value: 363700 }
  ],
  activity_feed: [
    {
      id: "act_001",
      message: "Order SO-10028 was delivered",
      timestamp: "2026-04-12T09:05:00.000Z"
    },
    {
      id: "act_002",
      message: "New company registered: Meridian Supply",
      timestamp: "2026-04-12T08:31:00.000Z"
    },
    {
      id: "act_003",
      message: "Vehicle TRK-987 entered maintenance mode",
      timestamp: "2026-04-12T07:43:00.000Z"
    }
  ]
});
