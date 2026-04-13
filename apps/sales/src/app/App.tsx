import { CommandPaletteShell } from "@naiton/search-engine";

import { AppRouter } from "./router";

export function App() {
  return (
    <>
      <AppRouter />
      <CommandPaletteShell title="Search Sales" emptyLabel="No matching records" />
    </>
  );
}
