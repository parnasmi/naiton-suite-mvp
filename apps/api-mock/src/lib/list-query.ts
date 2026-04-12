import { parseListQueryInput } from "@naiton/contracts/list-query";

interface NormalizedQueryInput {
  [key: string]: string | string[] | undefined;
}

export interface SalesListQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
  status?: string;
  manager?: string;
}

export interface CrmListQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
  relationship?: string;
  active?: "true" | "false";
}

export interface FleetListQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
  status?: string;
  ignition?: "on" | "off";
}

const normalizeQueryInput = (input: unknown): NormalizedQueryInput => {
  if (!input || typeof input !== "object") {
    return {};
  }

  return input as NormalizedQueryInput;
};

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const parseSalesListQuery = (input: unknown): SalesListQuery => {
  const parsed = parseListQueryInput(normalizeQueryInput(input));

  return {
    page: parsed.page,
    pageSize: parsed.pageSize,
    search: parsed.search,
    sort: parsed.sort,
    status: toOptionalString(parsed.status),
    manager: toOptionalString(parsed.manager)
  };
};

export const parseCrmListQuery = (input: unknown): CrmListQuery => {
  const parsed = parseListQueryInput(normalizeQueryInput(input));
  const active = parsed.active === "true" || parsed.active === "false" ? parsed.active : undefined;

  return {
    page: parsed.page,
    pageSize: parsed.pageSize,
    search: parsed.search,
    sort: parsed.sort,
    relationship: toOptionalString(parsed.relationship),
    active
  };
};

export const parseFleetListQuery = (input: unknown): FleetListQuery => {
  const parsed = parseListQueryInput(normalizeQueryInput(input));
  const ignition = parsed.ignition === "on" || parsed.ignition === "off" ? parsed.ignition : undefined;

  return {
    page: parsed.page,
    pageSize: parsed.pageSize,
    search: parsed.search,
    sort: parsed.sort,
    status: toOptionalString(parsed.status),
    ignition
  };
};
