import { CommandPaletteShell } from "@naiton/search-engine";

import { AppRouter } from "./router";

export function App() {
  return (
    <>
      <AppRouter />
      <CommandPaletteShell title="Search Admin" emptyLabel="No matching records" />
    </>
  );
}
