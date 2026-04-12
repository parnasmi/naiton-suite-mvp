import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";

import type {
  CommandPaletteActions,
  CommandPaletteApi,
  CommandPaletteGroup,
  CommandPaletteItem,
  SearchRegistry,
  SearchSource
} from "./types";

class InMemorySearchRegistry implements SearchRegistry {
  private readonly sources = new Map<string, SearchSource>();
  private readonly listeners = new Set<() => void>();

  register(source: SearchSource): () => void {
    this.sources.set(source.id, source);
    this.emit();
    return () => {
      this.unregister(source.id);
    };
  }

  unregister(sourceId: string): void {
    if (this.sources.delete(sourceId)) {
      this.emit();
    }
  }

  list(): SearchSource[] {
    return [...this.sources.values()].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}

export interface SearchProviderProps extends PropsWithChildren {
  shortcut?: "metaOrCtrl+k";
}

const defaultShortcut = "metaOrCtrl+k" as const;

const SearchRegistryContext = createContext<SearchRegistry | null>(null);
const CommandPaletteContext = createContext<CommandPaletteApi | null>(null);

function groupResults(results: CommandPaletteItem[]): CommandPaletteGroup[] {
  const groups = new Map<string, CommandPaletteGroup>();

  for (const item of results) {
    const groupId = item.groupId ?? "general";
    const groupLabel = item.groupLabel ?? "General";
    const existing = groups.get(groupId);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(groupId, {
      id: groupId,
      label: groupLabel,
      items: [item]
    });
  }

  return [...groups.values()].filter((group) => group.items.length > 0);
}

export function SearchProvider({ children, shortcut = defaultShortcut }: SearchProviderProps) {
  const registry = useMemo(() => new InMemorySearchRegistry(), []);
  const [registryVersion, setRegistryVersion] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<CommandPaletteGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const runningSearchRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return registry.subscribe(() => {
      setRegistryVersion((current) => current + 1);
    });
  }, [registry]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (shortcut !== "metaOrCtrl+k") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandPaletteKey = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      if (isCommandPaletteKey) {
        event.preventDefault();
        toggle();
      }

      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, shortcut, toggle]);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError(null);
      return;
    }

    runningSearchRef.current?.abort();
    const controller = new AbortController();
    runningSearchRef.current = controller;

    let disposed = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const sources = registry.list();
        const allItems = await Promise.all(
          sources.map(async (source) => {
            const output = await source.getItems({ query, signal: controller.signal });
            return output.map((item) => ({
              ...item,
              groupId: item.groupId ?? source.id,
              groupLabel: item.groupLabel ?? source.label
            }));
          })
        );

        if (!disposed) {
          const nextGroups = groupResults(allItems.flat());
          setGroups(nextGroups);
          setActiveIndex((current) => {
            const nextLength = nextGroups.flatMap((group) => group.items).length;
            return nextLength === 0 ? 0 : Math.min(current, Math.max(0, nextLength - 1));
          });
        }
      } catch (searchError) {
        if (!disposed && !controller.signal.aborted) {
          setGroups([]);
          setError(searchError instanceof Error ? searchError.message : "Search failed");
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [isOpen, query, registry, registryVersion]);

  const registerSource: CommandPaletteActions["registerSource"] = useCallback(
    (source) => registry.register(source),
    [registry]
  );

  const unregisterSource: CommandPaletteActions["unregisterSource"] = useCallback(
    (sourceId) => registry.unregister(sourceId),
    [registry]
  );

  const selectItem: CommandPaletteActions["selectItem"] = useCallback(async (item) => {
    if (item.disabled) {
      return;
    }

    await item.onSelect?.();
    close();
  }, [close]);

  const api = useMemo<CommandPaletteApi>(
    () => ({
      isOpen,
      query,
      loading,
      error,
      activeIndex,
      groups,
      open,
      close,
      toggle,
      setQuery,
      setActiveIndex,
      selectItem,
      registerSource,
      unregisterSource
    }),
    [
      activeIndex,
      close,
      groups,
      isOpen,
      loading,
      error,
      open,
      query,
      registerSource,
      selectItem,
      toggle,
      unregisterSource
    ]
  );

  return (
    <SearchRegistryContext.Provider value={registry}>
      <CommandPaletteContext.Provider value={api}>{children}</CommandPaletteContext.Provider>
    </SearchRegistryContext.Provider>
  );
}

export function useSearchRegistry(): SearchRegistry {
  const context = useContext(SearchRegistryContext);
  if (!context) {
    throw new Error("useSearchRegistry must be used within SearchProvider");
  }

  return context;
}

export function useCommandPaletteContext(): CommandPaletteApi {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within SearchProvider");
  }

  return context;
}
