import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuthSession, SalesOrder } from "@naiton/contracts";
import {
  DataGrid,
  SearchInput,
  type DataGridProps,
  type DataGridSortingChangeFn,
  type DataGridSortingState
} from "@naiton/ui-kit";

import { type createSalesApiClient } from "../shared/api/client";

export type SalesSection = "orders" | "offers" | "subscriptions";

export interface SalesTopModuleItem {
  key: string;
  label: string;
  href?: string;
  disabled: boolean;
  active: boolean;
  comingSoon: boolean;
}

interface SalesPageProps {
  session: AuthSession;
  apiClient: ReturnType<typeof createSalesApiClient>;
  modules: SalesTopModuleItem[];
  section: SalesSection;
  unreadNotifications: number;
  frontendVersion: string;
  backendVersion: string;
}

interface SalesOrderTableRow {
  orderNo: string;
  client: string;
  company: string;
  orderDateLabel: string;
  status: SalesOrder["status"];
  ordered: number;
  stockPrice: number;
  delivered: number;
  invoiced: number;
  paid: number;
  approved: boolean;
  available: boolean;
}

const statusLabels: Record<SalesOrder["status"], string> = {
  pending: "Pending",
  confirmed: "Warehouse",
  packed: "Warehouse",
  shipped: "Active",
  delivered: "Active",
  cancelled: "Cancelled"
};

const sectionTitles: Record<SalesSection, string> = {
  orders: "Orders",
  offers: "Offers",
  subscriptions: "Subscriptions"
};

const sortableFieldByColumn: Record<string, string> = {
  orderNo: "order_no",
  orderDate: "created_at",
  status: "status",
  stockPrice: "amount"
};

const managerOptionsSeed = ["Anora M.", "Bekzod R.", "Dilshod A."];

const formatOrderDate = (value: string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
};

const toMetricValues = (order: SalesOrder) => {
  const ordered = Number((order.amount / 10).toFixed(2));
  const stockPrice = Number((order.amount / Math.max(order.line_count, 1)).toFixed(2));
  const delivered = order.status === "delivered" ? ordered : 0;
  const invoiced = order.status === "shipped" || order.status === "delivered" ? ordered : 0;
  const paid = order.status === "delivered" ? ordered : 0;

  return {
    ordered,
    stockPrice,
    delivered,
    invoiced,
    paid,
    approved: order.status !== "cancelled",
    available: order.status !== "cancelled"
  };
};

const numberCell = (value: number): string => value.toFixed(2);

function ReservedSection({ section }: { section: SalesSection }) {
  return (
    <section className="sales-surface">
      <h2>{sectionTitles[section]}</h2>
      <p>
        Route is reserved for the {sectionTitles[section]} subsection. MVP currently ships only the
        Orders screen.
      </p>
    </section>
  );
}

function OrdersSection({
  apiClient,
  backendVersion
}: {
  apiClient: ReturnType<typeof createSalesApiClient>;
  backendVersion: string;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [pageSize, setPageSize] = useState(200);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<DataGridSortingState>([{ id: "orderDate", desc: false }]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const sort = useMemo(() => {
    const primarySort = sorting[0];
    if (!primarySort) {
      return "";
    }

    const field = sortableFieldByColumn[primarySort.id];
    if (!field) {
      return "";
    }

    return `${field}:${primarySort.desc ? "desc" : "asc"}`;
  }, [sorting]);

  const ordersQuery = useQuery({
    queryKey: [
      "sales",
      "orders",
      backendVersion,
      page,
      pageSize,
      searchQuery,
      statusFilter,
      managerFilter,
      sort
    ],
    queryFn: () =>
      apiClient.getSalesOrders({
        page,
        pageSize,
        search: searchQuery,
        sort,
        status: statusFilter || undefined,
        manager: managerFilter || undefined
      }),
    placeholderData: (previous) => previous
  });

  const pagination = ordersQuery.data?.pagination;

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination]);

  const managerOptions = useMemo(() => {
    const values = new Set(managerOptionsSeed);

    for (const order of ordersQuery.data?.items ?? []) {
      values.add(order.manager_name);
    }

    if (managerFilter) {
      values.add(managerFilter);
    }

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [ordersQuery.data?.items, managerFilter]);

  const rows = useMemo<SalesOrderTableRow[]>(() => {
    return (ordersQuery.data?.items ?? []).map((order) => {
      const metrics = toMetricValues(order);

      return {
        orderNo: order.order_no,
        client: order.manager_name,
        company: order.customer_name,
        orderDateLabel: formatOrderDate(order.created_at),
        status: order.status,
        ordered: metrics.ordered,
        stockPrice: metrics.stockPrice,
        delivered: metrics.delivered,
        invoiced: metrics.invoiced,
        paid: metrics.paid,
        approved: metrics.approved,
        available: metrics.available
      };
    });
  }, [ordersQuery.data?.items]);

  const columns = useMemo<DataGridProps<SalesOrderTableRow>["columns"]>(
    () => [
      {
        id: "orderNo",
        accessorKey: "orderNo",
        header: "ID",
        enableSorting: true,
        cell: (cell) => <span className="sales-link-cell">{String(cell.getValue() ?? "")}</span>
      },
      {
        accessorKey: "client",
        header: "Client",
        enableSorting: false
      },
      {
        accessorKey: "company",
        header: "Company",
        enableSorting: false
      },
      {
        id: "orderDate",
        accessorKey: "orderDateLabel",
        header: "Order date",
        enableSorting: true
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: (cell) => {
          const value = cell.getValue() as SalesOrder["status"];
          return (
            <span className={`sales-status sales-status-${value}`}>
              <span className="sales-status-dot" aria-hidden />
              {statusLabels[value]}
            </span>
          );
        }
      },
      {
        accessorKey: "ordered",
        header: "Ordered",
        enableSorting: false,
        cell: (cell) => numberCell(Number(cell.getValue() ?? 0))
      },
      {
        id: "stockPrice",
        accessorKey: "stockPrice",
        header: "Stock price",
        enableSorting: true,
        cell: (cell) => numberCell(Number(cell.getValue() ?? 0))
      },
      {
        accessorKey: "delivered",
        header: "Delivered",
        enableSorting: false,
        cell: (cell) => numberCell(Number(cell.getValue() ?? 0))
      },
      {
        accessorKey: "invoiced",
        header: "Invoiced",
        enableSorting: false,
        cell: (cell) => numberCell(Number(cell.getValue() ?? 0))
      },
      {
        accessorKey: "paid",
        header: "Paid",
        enableSorting: false,
        cell: (cell) => numberCell(Number(cell.getValue() ?? 0))
      },
      {
        accessorKey: "approved",
        header: "Approved",
        enableSorting: false,
        cell: (cell) => {
          const value = Boolean(cell.getValue());
          return <span className={`sales-bool-icon ${value ? "is-yes" : "is-no"}`}>{value ? "o" : "x"}</span>;
        }
      },
      {
        accessorKey: "available",
        header: "Availability",
        enableSorting: false,
        cell: (cell) => {
          const value = Boolean(cell.getValue());
          return <span className={`sales-bool-icon ${value ? "is-yes" : "is-no"}`}>{value ? "o" : "x"}</span>;
        }
      }
    ],
    []
  );

  const handleSortingChange: DataGridSortingChangeFn = (nextSorting) => {
    setSorting((previous) => {
      return typeof nextSorting === "function" ? nextSorting(previous) : nextSorting;
    });
    setPage(1);
  };

  return (
    <section className="sales-surface">
      <div className="sales-toolbar">
        <div className="sales-toolbar-left">
          <h1>Orders</h1>
          <SearchInput
            placeholder="Order search"
            hotkeyHint=""
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            className="sales-filter-button"
            onClick={() => {
              setSearchQuery(searchInput.trim());
              setPage(1);
            }}
          >
            Search
          </button>
          <select
            aria-label="Filter by status"
            className="sales-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            aria-label="Filter by manager"
            className="sales-select"
            value={managerFilter}
            onChange={(event) => {
              setManagerFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All managers</option>
            {managerOptions.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
        </div>

        <div className="sales-toolbar-right">
          <button type="button" className="sales-ghost-button">
            Preset <strong>Stand alone</strong>
          </button>
          <label className="sales-vat-toggle">
            <input type="checkbox" defaultChecked />
            VAT
          </label>
          <label className="sales-rows-control">
            Rows
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </label>
          <button type="button" className="sales-primary-button">
            + New order
          </button>
        </div>
      </div>

      <DataGrid<SalesOrderTableRow>
        data={rows}
        columns={columns}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        manualSorting
        isLoading={ordersQuery.isLoading || ordersQuery.isFetching}
        emptyState="No matching orders"
      />

      <div className="sales-footer-row">
        <p>
          Showing {rows.length} of {pagination?.total ?? 0} orders
        </p>

        <div className="sales-pagination">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || ordersQuery.isLoading}
          >
            Prev
          </button>
          <span>
            Page {pagination?.page ?? page} / {Math.max(pagination?.totalPages ?? 1, 1)}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!pagination || page >= pagination.totalPages || ordersQuery.isLoading}
          >
            Next
          </button>
        </div>
      </div>

      {ordersQuery.error ? <p className="sales-error">{String(ordersQuery.error.message)}</p> : null}
    </section>
  );
}

export function SalesPage({
  session,
  apiClient,
  modules,
  section,
  unreadNotifications,
  frontendVersion,
  backendVersion
}: SalesPageProps) {
  return (
    <div className="sales-page">
      <header className="sales-topbar">
        <a className="sales-brand" href={`/${frontendVersion}/`}>
          <span className="sales-brand-mark">N6</span>
          <span>
            <strong>Naiton</strong>
            <small>Business Suite</small>
          </span>
        </a>

        <div className="sales-top-search">
          <SearchInput readOnly value="" placeholder="Search Naiton" hotkeyHint="" />
        </div>

        <nav className="sales-top-modules">
          {modules.map((module) => (
            <a
              key={module.key}
              href={module.href}
              className={module.active ? "is-active" : undefined}
              aria-disabled={module.disabled}
              onClick={(event) => {
                if (module.disabled || !module.href) {
                  event.preventDefault();
                }
              }}
            >
              {module.label}
              {module.comingSoon ? <span className="sales-coming-soon">Soon</span> : null}
            </a>
          ))}
        </nav>

        <div className="sales-top-actions">
          <button type="button" className="sales-icon-button" title="Workspace">
            []
          </button>
          <button type="button" className="sales-icon-button" title="Share">
            S
          </button>
          <button type="button" className="sales-icon-button" title="Help">
            ?
          </button>
          <button type="button" className="sales-icon-button" title="Notifications">
            !
            {unreadNotifications > 0 ? <span className="sales-count-dot">{unreadNotifications}</span> : null}
          </button>
          <div className="sales-profile-pill">
            <span>{session.display_name}</span>
            <small>{session.role}</small>
          </div>
        </div>
      </header>

      <div className="sales-body">
        <aside className="sales-side-rail">
          <a href={`/${frontendVersion}/offers`} className={section === "offers" ? "is-active" : undefined}>
            Offers
          </a>
          <a href={`/${frontendVersion}/`} className={section === "orders" ? "is-active" : undefined}>
            Orders
          </a>
          <a
            href={`/${frontendVersion}/subscriptions`}
            className={section === "subscriptions" ? "is-active" : undefined}
          >
            Subscriptions
          </a>
        </aside>

        <main className="sales-main">
          {section === "orders" ? (
            <OrdersSection apiClient={apiClient} backendVersion={backendVersion} />
          ) : (
            <ReservedSection section={section} />
          )}
        </main>
      </div>
    </div>
  );
}
