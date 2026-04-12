export type SortDirection = "asc" | "desc";

export interface SortDescriptor<T extends string> {
  field: T;
  direction: SortDirection;
}

export const parseSort = <T extends string>(
  input: string,
  allowedFields: readonly T[]
): SortDescriptor<T> | null => {
  if (!input.trim()) {
    return null;
  }

  const [fieldRaw, directionRaw] = input.includes(":")
    ? input.split(":", 2)
    : input.startsWith("-")
      ? [input.slice(1), "desc"]
      : [input, "asc"];

  const field = fieldRaw.trim() as T;
  if (!allowedFields.includes(field)) {
    return null;
  }

  const direction = directionRaw?.trim().toLowerCase() === "desc" ? "desc" : "asc";

  return {
    field,
    direction
  };
};

const compareValues = (a: unknown, b: unknown): number => {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  const aDate = typeof a === "string" ? Date.parse(a) : Number.NaN;
  const bDate = typeof b === "string" ? Date.parse(b) : Number.NaN;

  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
    return aDate - bDate;
  }

  return String(a).localeCompare(String(b));
};

export const sortByField = <T extends Record<string, unknown>, K extends Extract<keyof T, string>>(
  items: T[],
  descriptor: SortDescriptor<K> | null
): T[] => {
  if (!descriptor) {
    return [...items];
  }

  const { field, direction } = descriptor;

  return [...items].sort((left, right) => {
    const base = compareValues(left[field], right[field]);
    return direction === "asc" ? base : base * -1;
  });
};
