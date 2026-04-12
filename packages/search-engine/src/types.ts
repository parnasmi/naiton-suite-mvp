import type { ReactNode } from "react";

export interface SearchContext {
  query: string;
  signal: AbortSignal;
}

export interface CommandPaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  hint?: string;
  groupId?: string;
  groupLabel?: string;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  onSelect?: () => void | Promise<void>;
}

export interface SearchSource {
  id: string;
  label: string;
  priority?: number;
  getItems: (context: SearchContext) => CommandPaletteItem[] | Promise<CommandPaletteItem[]>;
}

export interface CommandPaletteGroup {
  id: string;
  label: string;
  items: CommandPaletteItem[];
}

export interface SearchRegistry {
  register: (source: SearchSource) => () => void;
  unregister: (sourceId: string) => void;
  list: () => SearchSource[];
  subscribe: (listener: () => void) => () => void;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  loading: boolean;
  error: string | null;
  activeIndex: number;
  groups: CommandPaletteGroup[];
}

export interface CommandPaletteActions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setActiveIndex: (index: number) => void;
  selectItem: (item: CommandPaletteItem) => Promise<void>;
  registerSource: (source: SearchSource) => () => void;
  unregisterSource: (sourceId: string) => void;
}

export type CommandPaletteApi = CommandPaletteState & CommandPaletteActions;
