import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table";
import { useMemo, useState, type ReactNode } from "react";

export type DataGridSortingState = SortingState;
export type DataGridSortingChangeFn = OnChangeFn<SortingState>;

export interface DataGridProps<TData> {
  data: TData[];
  columns: Array<ColumnDef<TData, unknown>>;
  emptyState?: ReactNode;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  sorting?: DataGridSortingState;
  onSortingChange?: DataGridSortingChangeFn;
  manualSorting?: boolean;
}

export function DataGrid<TData>({
  data,
  columns,
  emptyState = "No data available",
  isLoading = false,
  onRowClick,
  sorting,
  onSortingChange,
  manualSorting = false
}: DataGridProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const resolvedSorting = sorting ?? internalSorting;
  const resolvedOnSortingChange = onSortingChange ?? setInternalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting: resolvedSorting },
    onSortingChange: resolvedOnSortingChange,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() })
  });

  const headerGroups = useMemo(() => table.getHeaderGroups(), [table]);
  const rows = useMemo(() => table.getRowModel().rows, [table]);

  return (
    <div className="naiton-card" style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
          <thead style={{ background: "#f8fafc" }}>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      style={{
                        textAlign: "left",
                        fontSize: "0.82rem",
                        letterSpacing: "0.01em",
                        color: "#64748b",
                        padding: "0.75rem 0.8rem",
                        borderBottom: "1px solid #dbe2ea",
                        cursor: canSort ? "pointer" : "default"
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {sortState === "asc" ? "↑" : null}
                        {sortState === "desc" ? "↓" : null}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                style={{
                  borderBottom: "1px solid #edf2f8",
                  background: "#ffffff",
                  cursor: onRowClick ? "pointer" : "default"
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: "0.75rem 0.8rem", color: "#1e293b", fontSize: "0.93rem" }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading ? (
        <div style={{ padding: "1rem", color: "#64748b" }}>Loading data...</div>
      ) : null}

      {!isLoading && rows.length === 0 ? <div style={{ padding: "1rem", color: "#64748b" }}>{emptyState}</div> : null}
    </div>
  );
}
