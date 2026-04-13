import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuthSession, CrmCompany } from "@naiton/contracts";
import {
  DataGrid,
  SearchInput,
  type DataGridProps,
  type DataGridSortingChangeFn,
  type DataGridSortingState
} from "@naiton/ui-kit";

import { type createCrmApiClient } from "../shared/api/client";

export type CrmSection = "companies" | "contacts" | "pipeline" | "labels";

export interface CrmTopModuleItem {
  key: string;
  label: string;
  href?: string;
  disabled: boolean;
  active: boolean;
  comingSoon: boolean;
}

interface CrmPageProps {
  session: AuthSession;
  apiClient: ReturnType<typeof createCrmApiClient>;
  modules: CrmTopModuleItem[];
  section: CrmSection;
  unreadNotifications: number;
  frontendVersion: string;
  backendVersion: string;
}

interface CrmCompanyTableRow {
  name: string;
  relationship: string;
  accountManager: string;
  taxNumber: string;
  country: string;
  city: string;
  industry: string;
  isActive: boolean;
  createdAtLabel: string;
}

const sectionTitles: Record<CrmSection, string> = {
  companies: "Companies",
  contacts: "Contacts",
  pipeline: "Pipeline (name TBD)",
  labels: "Labels (name TBD)"
};

const sortableFieldByColumn: Record<string, string> = {
  name: "name",
  relationship: "relationship_type",
  country: "country",
  city: "city",
  createdAt: "created_at"
};

const relationshipSeed = ["Customer", "Partner", "Prospect", "Supplier"];

const formatCreatedAt = (value: string): string => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};

function ReservedSection({ section }: { section: CrmSection }) {
  return (
    <section className="crm-surface">
      <h2>{sectionTitles[section]}</h2>
      <p>
        Navigation slot is intentionally preserved for the screenshot structure. This section remains a placeholder in MVP.
      </p>
    </section>
  );
}

function CompaniesSection({
  apiClient,
  backendVersion
}: {
  apiClient: ReturnType<typeof createCrmApiClient>;
  backendVersion: string;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [pageSize, setPageSize] = useState(200);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<DataGridSortingState>([{ id: "name", desc: false }]);

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

  const companiesQuery = useQuery({
    queryKey: [
      "crm",
      "companies",
      backendVersion,
      page,
      pageSize,
      searchQuery,
      relationshipFilter,
      activeFilter,
      sort
    ],
    queryFn: () =>
      apiClient.getCrmCompanies({
        page,
        pageSize,
        search: searchQuery,
        sort,
        relationship: relationshipFilter || undefined,
        active: activeFilter || undefined
      }),
    placeholderData: (previous) => previous
  });

  const pagination = companiesQuery.data?.pagination;

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination]);

  const relationshipOptions = useMemo(() => {
    const values = new Set(relationshipSeed);

    for (const company of companiesQuery.data?.items ?? []) {
      values.add(company.relationship_type);
    }

    if (relationshipFilter) {
      values.add(relationshipFilter);
    }

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [companiesQuery.data?.items, relationshipFilter]);

  const rows = useMemo<CrmCompanyTableRow[]>(() => {
    return (companiesQuery.data?.items ?? []).map((company: CrmCompany) => ({
      name: company.name,
      relationship: company.relationship_type,
      accountManager: company.account_manager,
      taxNumber: company.tax_number,
      country: company.country,
      city: company.city,
      industry: company.industry,
      isActive: company.is_active,
      createdAtLabel: formatCreatedAt(company.created_at)
    }));
  }, [companiesQuery.data?.items]);

  const columns = useMemo<DataGridProps<CrmCompanyTableRow>["columns"]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Company",
        enableSorting: true,
        cell: (cell) => <span className="crm-link-cell">{String(cell.getValue() ?? "")}</span>
      },
      {
        id: "relationship",
        accessorKey: "relationship",
        header: "Relation",
        enableSorting: true,
        cell: (cell) => <span className="crm-pill crm-pill-relation">{String(cell.getValue() ?? "")}</span>
      },
      {
        accessorKey: "accountManager",
        header: "Account manager",
        enableSorting: false
      },
      {
        accessorKey: "taxNumber",
        header: "Tax number",
        enableSorting: false,
        cell: (cell) => <span className="crm-tax-cell">{String(cell.getValue() ?? "")}</span>
      },
      {
        id: "country",
        accessorKey: "country",
        header: "Geography",
        enableSorting: true,
        cell: (cell) => {
          const row = cell.row.original;
          return (
            <div className="crm-geography-cell">
              <span className="crm-pill crm-pill-geo">{row.country}</span>
              <span className="crm-pill crm-pill-geo">{row.city}</span>
            </div>
          );
        }
      },
      {
        id: "city",
        accessorKey: "city",
        header: "City",
        enableSorting: true
      },
      {
        accessorKey: "industry",
        header: "Business label",
        enableSorting: false,
        cell: (cell) => <span className="crm-pill crm-pill-industry">{String(cell.getValue() ?? "")}</span>
      },
      {
        accessorKey: "isActive",
        header: "Status",
        enableSorting: false,
        cell: (cell) => {
          const value = Boolean(cell.getValue());
          return (
            <span className={`crm-status ${value ? "is-active" : "is-inactive"}`}>
              <span className="crm-status-dot" aria-hidden />
              {value ? "Active" : "Inactive"}
            </span>
          );
        }
      },
      {
        id: "createdAt",
        accessorKey: "createdAtLabel",
        header: "Added",
        enableSorting: true
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
    <section className="crm-surface">
      <div className="crm-toolbar">
        <div className="crm-toolbar-left">
          <h1>Companies</h1>
          <SearchInput
            placeholder="Company search"
            hotkeyHint=""
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            className="crm-filter-button"
            onClick={() => {
              setSearchQuery(searchInput.trim());
              setPage(1);
            }}
          >
            Search
          </button>
          <select
            aria-label="Filter by relationship"
            className="crm-select"
            value={relationshipFilter}
            onChange={(event) => {
              setRelationshipFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All relations</option>
            {relationshipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by activity"
            className="crm-select"
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value as "" | "true" | "false");
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="crm-toolbar-right">
          <button type="button" className="crm-ghost-button">
            Preset <strong>Enterprise</strong>
          </button>
          <label className="crm-rows-control">
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
          <button type="button" className="crm-primary-button">
            + New company
          </button>
        </div>
      </div>

      <DataGrid<CrmCompanyTableRow>
        data={rows}
        columns={columns}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        manualSorting
        isLoading={companiesQuery.isLoading || companiesQuery.isFetching}
        emptyState="No matching companies"
      />

      <div className="crm-footer-row">
        <p>
          Showing {rows.length} of {pagination?.total ?? 0} companies
        </p>

        <div className="crm-pagination">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || companiesQuery.isLoading}
          >
            Prev
          </button>
          <span>
            Page {pagination?.page ?? page} / {Math.max(pagination?.totalPages ?? 1, 1)}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!pagination || page >= pagination.totalPages || companiesQuery.isLoading}
          >
            Next
          </button>
        </div>
      </div>

      {companiesQuery.error ? <p className="crm-error">{String(companiesQuery.error.message)}</p> : null}
    </section>
  );
}

export function CrmPage({
  session,
  apiClient,
  modules,
  section,
  unreadNotifications,
  frontendVersion,
  backendVersion
}: CrmPageProps) {
  return (
    <div className="crm-page">
      <header className="crm-topbar">
        <a className="crm-brand" href={`/${frontendVersion}/`}>
          <span className="crm-brand-mark">N6</span>
          <span>
            <strong>Naiton</strong>
            <small>Business Suite</small>
          </span>
        </a>

        <div className="crm-top-search">
          <SearchInput readOnly value="" placeholder="Search Naiton" hotkeyHint="" />
        </div>

        <nav className="crm-top-modules">
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
              {module.comingSoon ? <span className="crm-coming-soon">Soon</span> : null}
            </a>
          ))}
        </nav>

        <div className="crm-top-actions">
          <button type="button" className="crm-icon-button" title="Workspace">
            []
          </button>
          <button type="button" className="crm-icon-button" title="Share">
            S
          </button>
          <button type="button" className="crm-icon-button" title="Help">
            ?
          </button>
          <button type="button" className="crm-icon-button" title="Notifications">
            !
            {unreadNotifications > 0 ? <span className="crm-count-dot">{unreadNotifications}</span> : null}
          </button>
          <div className="crm-profile-pill">
            <span>{session.display_name}</span>
            <small>{session.role}</small>
          </div>
        </div>
      </header>

      <div className="crm-body">
        <aside className="crm-side-rail">
          <a href={`/${frontendVersion}/companies`} className={section === "companies" ? "is-active" : undefined}>
            Companies
          </a>
          <a href={`/${frontendVersion}/contacts`} className={section === "contacts" ? "is-active" : undefined}>
            Contacts
          </a>
          <a href={`/${frontendVersion}/pipeline`} className={section === "pipeline" ? "is-active" : undefined}>
            Pipeline
          </a>
          <a href={`/${frontendVersion}/labels`} className={section === "labels" ? "is-active" : undefined}>
            Labels
          </a>
        </aside>

        <main className="crm-main">
          {section === "companies" ? (
            <CompaniesSection apiClient={apiClient} backendVersion={backendVersion} />
          ) : (
            <ReservedSection section={section} />
          )}
        </main>
      </div>
    </div>
  );
}
