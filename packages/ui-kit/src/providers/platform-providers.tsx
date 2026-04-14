import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "@naiton/search-engine";
import { useState, type PropsWithChildren } from "react";

import type { AuthSession } from "@naiton/contracts";

import { SessionProvider } from "./session-provider";
import { ThemeProvider, type ThemeMode } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

export interface PlatformProvidersProps extends PropsWithChildren {
  initialTheme?: ThemeMode;
  initialSession?: AuthSession | null;
  queryClient?: QueryClient;
}

export function PlatformProviders({
  children,
  initialTheme = "light",
  initialSession = null,
  queryClient
}: PlatformProvidersProps) {
  const [client] = useState<QueryClient>(() => {
    return (
      queryClient ??
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 10_000
          }
        }
      })
    );
  });

  return (
    <ThemeProvider initialMode={initialTheme}>
      <QueryClientProvider client={client}>
        <SessionProvider initialSession={initialSession}>
          <SearchProvider>
            <ToastProvider>{children}</ToastProvider>
          </SearchProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
