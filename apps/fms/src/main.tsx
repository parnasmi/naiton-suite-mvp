import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PlatformProviders } from "@naiton/ui-kit";

import "@naiton/ui-kit/tokens.css";
import "leaflet/dist/leaflet.css";

import { App } from "./app/App";
import { FmsRuntimeProvider } from "./app/runtime-provider";
import "./app/app.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <PlatformProviders>
      <BrowserRouter>
        <FmsRuntimeProvider>
          <App />
        </FmsRuntimeProvider>
      </BrowserRouter>
    </PlatformProviders>
  </StrictMode>
);
