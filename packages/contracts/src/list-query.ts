import { ListQuerySchema, type ListQuery } from "./index";

export type ListQueryPrimitive = string | number | boolean;
export type ListQueryInput = Record<string, ListQueryPrimitive | null | undefined | ListQueryPrimitive[]>;

const normalizeValue = (value: ListQueryInput[string]): string => {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0] ?? "") : "";
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export const parseListQueryInput = (
  input: ListQueryInput = {},
  defaults: Partial<ListQuery> = {}
): ListQuery & Record<string, unknown> => {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    normalized[key] = normalizeValue(value);
  }

  return ListQuerySchema.parse({
    ...defaults,
    ...normalized
  });
};

export const buildListQuerySearchParams = (
  query: Partial<ListQuery> & Record<string, ListQueryPrimitive | null | undefined> = {}
): URLSearchParams => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
};
