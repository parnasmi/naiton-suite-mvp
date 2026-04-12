import { NotificationListResponseSchema } from "@naiton/contracts";

export const notifications = NotificationListResponseSchema.parse([
  {
    id: "notif_001",
    title: "Sales target reached",
    body: "Sales team reached 104% of this week's plan.",
    created_at: "2026-04-12T09:02:00.000Z",
    read: false,
    severity: "success"
  },
  {
    id: "notif_002",
    title: "2 vehicles need maintenance",
    body: "FMS detected maintenance alerts for TRK-221 and TRK-332.",
    created_at: "2026-04-12T08:47:00.000Z",
    read: false,
    severity: "warning"
  },
  {
    id: "notif_003",
    title: "New CRM import complete",
    body: "48 companies were synced from the external source.",
    created_at: "2026-04-11T17:22:00.000Z",
    read: true,
    severity: "info"
  }
]);
