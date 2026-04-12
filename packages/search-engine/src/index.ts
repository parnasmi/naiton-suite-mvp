export type {
  SearchContext,
  CommandPaletteItem,
  SearchSource,
  CommandPaletteGroup,
  SearchRegistry,
  CommandPaletteState,
  CommandPaletteActions,
  CommandPaletteApi
} from "./types";

export { SearchProvider, useCommandPaletteContext, useSearchRegistry } from "./provider";
export { useCommandPalette, useRegisterSearchSource } from "./hooks";
export { CommandPaletteShell } from "./components/command-palette-shell";
