import { useEffect } from "react";

import { useCommandPaletteContext, useSearchRegistry } from "./provider";
import type { SearchSource } from "./types";

export function useCommandPalette() {
  return useCommandPaletteContext();
}

export function useRegisterSearchSource(source: SearchSource, enabled = true) {
  const registry = useSearchRegistry();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return registry.register(source);
  }, [enabled, registry, source]);
}
