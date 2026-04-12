import { SalesOrderSchema, type SalesOrder } from "@naiton/contracts";

const seedOrders: SalesOrder[] = [
  {
    id: "ord_10021",
    order_no: "SO-10021",
    customer_name: "Orion Trade LLC",
    status: "pending",
    amount: 1840,
    currency: "USD",
    created_at: "2026-04-01T08:05:00.000Z",
    updated_at: "2026-04-01T08:05:00.000Z",
    manager_name: "Anora M.",
    line_count: 3
  },
  {
    id: "ord_10022",
    order_no: "SO-10022",
    customer_name: "Velar Group",
    status: "confirmed",
    amount: 6420,
    currency: "USD",
    created_at: "2026-04-01T10:12:00.000Z",
    updated_at: "2026-04-01T11:01:00.000Z",
    manager_name: "Anora M.",
    line_count: 5
  },
  {
    id: "ord_10023",
    order_no: "SO-10023",
    customer_name: "Garnet Logistics",
    status: "packed",
    amount: 1290,
    currency: "USD",
    created_at: "2026-04-02T07:48:00.000Z",
    updated_at: "2026-04-02T09:20:00.000Z",
    manager_name: "Bekzod R.",
    line_count: 2
  },
  {
    id: "ord_10024",
    order_no: "SO-10024",
    customer_name: "Meridian Supply",
    status: "shipped",
    amount: 9820,
    currency: "USD",
    created_at: "2026-04-02T15:02:00.000Z",
    updated_at: "2026-04-03T08:10:00.000Z",
    manager_name: "Anora M.",
    line_count: 8
  },
  {
    id: "ord_10025",
    order_no: "SO-10025",
    customer_name: "Northbridge Ltd",
    status: "delivered",
    amount: 4020,
    currency: "USD",
    created_at: "2026-04-03T09:17:00.000Z",
    updated_at: "2026-04-05T11:00:00.000Z",
    manager_name: "Dilshod A.",
    line_count: 6
  },
  {
    id: "ord_10026",
    order_no: "SO-10026",
    customer_name: "Atlas Retail",
    status: "cancelled",
    amount: 720,
    currency: "USD",
    created_at: "2026-04-04T11:11:00.000Z",
    updated_at: "2026-04-04T16:20:00.000Z",
    manager_name: "Bekzod R.",
    line_count: 1
  },
  {
    id: "ord_10027",
    order_no: "SO-10027",
    customer_name: "Vector Foods",
    status: "pending",
    amount: 2130,
    currency: "USD",
    created_at: "2026-04-05T12:30:00.000Z",
    updated_at: "2026-04-05T12:30:00.000Z",
    manager_name: "Anora M.",
    line_count: 4
  },
  {
    id: "ord_10028",
    order_no: "SO-10028",
    customer_name: "Oceanic Imports",
    status: "delivered",
    amount: 11800,
    currency: "USD",
    created_at: "2026-04-06T09:40:00.000Z",
    updated_at: "2026-04-09T13:12:00.000Z",
    manager_name: "Dilshod A.",
    line_count: 11
  },
  {
    id: "ord_10029",
    order_no: "SO-10029",
    customer_name: "Nexus Industries",
    status: "confirmed",
    amount: 3540,
    currency: "USD",
    created_at: "2026-04-08T14:20:00.000Z",
    updated_at: "2026-04-08T14:58:00.000Z",
    manager_name: "Bekzod R.",
    line_count: 5
  },
  {
    id: "ord_10030",
    order_no: "SO-10030",
    customer_name: "Lumen Electronics",
    status: "shipped",
    amount: 6425,
    currency: "USD",
    created_at: "2026-04-09T08:01:00.000Z",
    updated_at: "2026-04-10T10:50:00.000Z",
    manager_name: "Anora M.",
    line_count: 7
  },
  {
    id: "ord_10031",
    order_no: "SO-10031",
    customer_name: "Meridian Supply",
    status: "packed",
    amount: 2650,
    currency: "USD",
    created_at: "2026-04-10T06:55:00.000Z",
    updated_at: "2026-04-10T08:04:00.000Z",
    manager_name: "Anora M.",
    line_count: 3
  },
  {
    id: "ord_10032",
    order_no: "SO-10032",
    customer_name: "Aster Medical",
    status: "pending",
    amount: 5710,
    currency: "USD",
    created_at: "2026-04-11T13:14:00.000Z",
    updated_at: "2026-04-11T13:14:00.000Z",
    manager_name: "Dilshod A.",
    line_count: 9
  }
];

export const salesOrders = seedOrders.map((order) => SalesOrderSchema.parse(order));
