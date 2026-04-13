import { CommandPaletteShell } from "@naiton/search-engine";

import { AppRouter } from "./router";

export function App() {
  return (
    <>
      <AppRouter />
      <CommandPaletteShell title="Search FMS" emptyLabel="No matching records" />
    </>
  );
}
