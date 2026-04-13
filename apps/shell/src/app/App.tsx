import { CommandPaletteShell } from "@naiton/search-engine";

import { AppRouter } from "./router";

export function App() {
  return (
    <>
      <AppRouter />
      <CommandPaletteShell title="Search Naiton" emptyLabel="No matching records" />
    </>
  );
}
