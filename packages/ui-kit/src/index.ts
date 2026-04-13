export { AuthPanel, type AuthPanelProps, type AuthPanelValues } from "./components/auth-panel";
export {
  TopShellBar,
  SideRail,
  ShellLayout,
  type TopShellBarProps,
  type SideRailProps,
  type ShellLayoutProps,
  type ShellModuleLink
} from "./components/shell-chrome";
export {
  DataGrid,
  type DataGridProps,
  type DataGridSortingState,
  type DataGridSortingChangeFn
} from "./components/data-grid";
export {
  MetricCard,
  MetricRingCard,
  type MetricCardProps,
  type MetricRingCardProps
} from "./components/metric-cards";
export { SearchInput, type SearchInputProps } from "./components/search-input";
export {
  CommandPalette,
  type CommandPaletteProps,
  type CommandPaletteGroupView,
  type CommandPaletteItemView
} from "./components/command-palette";
export { MapPanel, type MapPanelProps, type MapMarkerPoint } from "./components/map-panel";
export {
  StatusBadge,
  StatusDot,
  type StatusBadgeProps,
  type StatusDotProps,
  type StatusBadgeTone
} from "./components/status-badge";
export { SurfaceCard, type SurfaceCardProps } from "./components/surface-card";

export { ThemeProvider, useTheme, type ThemeProviderProps, type ThemeMode, type ResolvedTheme } from "./providers/theme-provider";
export {
  createSessionStore,
  SessionProvider,
  useSessionStore,
  useSession,
  useSessionStatus,
  type SessionProviderProps,
  type SessionStore,
  type SessionState,
  type SessionStatus
} from "./providers/session-provider";
export { PlatformProviders, type PlatformProvidersProps } from "./providers/platform-providers";
export { ToastProvider, useToast, type ToastInput, type ToastTone } from "./providers/toast-provider";

export { useCommandPalette, useRegisterSearchSource } from "@naiton/search-engine";
