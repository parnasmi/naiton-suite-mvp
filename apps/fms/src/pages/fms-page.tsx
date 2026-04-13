import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import type { AuthSession, FleetVehicle, MapMarker, VehicleStatus } from "@naiton/contracts";
import { SearchInput } from "@naiton/ui-kit";

import { type createFmsApiClient } from "../shared/api/client";

export type FmsSection = "fleet" | "trips" | "service" | "zones";

export interface FmsTopModuleItem {
  key: string;
  label: string;
  href?: string;
  disabled: boolean;
  active: boolean;
  comingSoon: boolean;
}

interface FmsPageProps {
  session: AuthSession;
  apiClient: ReturnType<typeof createFmsApiClient>;
  modules: FmsTopModuleItem[];
  section: FmsSection;
  unreadNotifications: number;
  frontendVersion: string;
  backendVersion: string;
}

interface LiveFleetVehicle extends FleetVehicle {
  markerLabel: string;
}

const sectionTitles: Record<FmsSection, string> = {
  fleet: "Fleet",
  trips: "Trips (name TBD)",
  service: "Service (name TBD)",
  zones: "Zones (name TBD)"
};

const statusLabelByValue: Record<VehicleStatus, string> = {
  online: "Online",
  idle: "Idle",
  offline: "Offline",
  maintenance: "Maintenance",
  alert: "Alert"
};

const sortOptions = [
  { value: "updated_desc", label: "Updated (newest)", query: "updated_at:desc" },
  { value: "updated_asc", label: "Updated (oldest)", query: "updated_at:asc" },
  { value: "speed_desc", label: "Speed (high-low)", query: "speed_kmh:desc" },
  { value: "speed_asc", label: "Speed (low-high)", query: "speed_kmh:asc" },
  { value: "plate_asc", label: "Plate (A-Z)", query: "plate_number:asc" },
  { value: "status_asc", label: "Status", query: "status:asc" }
] as const;

type SortOptionValue = (typeof sortOptions)[number]["value"];

type MapLayerMode = "street" | "logistics";

const statusColorByValue: Record<VehicleStatus, string> = {
  online: "#10b981",
  idle: "#3b82f6",
  offline: "#64748b",
  maintenance: "#f59e0b",
  alert: "#ef4444"
};

const fallbackCenter: [number, number] = [41.3111, 69.2797];

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const seededUnit = (id: string, tick: number, salt: number): number => {
  const source = `${id}:${tick}:${salt}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 33 + source.charCodeAt(index)) >>> 0;
  }

  return hash / 4294967295;
};

const formatRelativeUpdatedAt = (isoDate: string): string => {
  const deltaMs = Math.max(0, Date.now() - new Date(isoDate).getTime());
  const seconds = Math.floor(deltaMs / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
};

const simulateVehicle = (
  vehicle: FleetVehicle,
  tick: number,
  statusFilter: string,
  ignitionFilter: "" | "on" | "off"
): FleetVehicle => {
  if (tick === 0) {
    return vehicle;
  }

  const statusRoll = seededUnit(vehicle.id, tick, 1);
  const speedRoll = seededUnit(vehicle.id, tick, 2);
  const latRoll = seededUnit(vehicle.id, tick, 3) - 0.5;
  const lngRoll = seededUnit(vehicle.id, tick, 4) - 0.5;
  const timeRoll = seededUnit(vehicle.id, tick, 5);

  let nextStatus: VehicleStatus = vehicle.status;

  if (!statusFilter) {
    if (statusRoll > 0.92) {
      nextStatus = "alert";
    } else if (statusRoll > 0.79) {
      nextStatus = "maintenance";
    } else if (statusRoll > 0.63) {
      nextStatus = "idle";
    } else if (statusRoll > 0.47) {
      nextStatus = "online";
    } else if (statusRoll > 0.35) {
      nextStatus = "offline";
    }
  }

  let ignitionOn = nextStatus === "online" || nextStatus === "idle" || nextStatus === "alert";
  if (ignitionFilter === "on") {
    ignitionOn = true;
  }
  if (ignitionFilter === "off") {
    ignitionOn = false;
  }

  let speed = 0;
  if (nextStatus === "online") {
    speed = Math.round(35 + speedRoll * 60);
  } else if (nextStatus === "alert") {
    speed = Math.round(10 + speedRoll * 35);
  }

  if (!ignitionOn) {
    speed = 0;
  }

  const driftFactor = nextStatus === "online" ? 0.018 : nextStatus === "alert" ? 0.012 : 0.004;
  const lat = clamp(vehicle.lat + latRoll * driftFactor, 40.8, 41.8);
  const lng = clamp(vehicle.lng + lngRoll * driftFactor, 68.8, 69.9);

  return {
    ...vehicle,
    status: nextStatus,
    ignition_on: ignitionOn,
    speed_kmh: speed,
    lat,
    lng,
    updated_at: new Date(Date.now() - Math.floor(timeRoll * 180000)).toISOString()
  };
};

interface ClusterBucket {
  items: LiveFleetVehicle[];
  centerLat: number;
  centerLng: number;
}

const clusterVehicles = (vehicles: LiveFleetVehicle[], zoom: number): ClusterBucket[] => {
  const cellSize = zoom >= 15 ? 0.01 : zoom >= 13 ? 0.02 : zoom >= 11 ? 0.04 : 0.08;
  const buckets = new Map<string, { items: LiveFleetVehicle[]; latSum: number; lngSum: number }>();

  for (const vehicle of vehicles) {
    const latKey = Math.floor(vehicle.lat / cellSize);
    const lngKey = Math.floor(vehicle.lng / cellSize);
    const key = `${latKey}:${lngKey}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.items.push(vehicle);
      existing.latSum += vehicle.lat;
      existing.lngSum += vehicle.lng;
      continue;
    }

    buckets.set(key, {
      items: [vehicle],
      latSum: vehicle.lat,
      lngSum: vehicle.lng
    });
  }

  return Array.from(buckets.values()).map((bucket) => ({
    items: bucket.items,
    centerLat: bucket.latSum / bucket.items.length,
    centerLng: bucket.lngSum / bucket.items.length
  }));
};

interface FleetMapCanvasProps {
  vehicles: LiveFleetVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
}

function FleetMapCanvas({ vehicles, selectedVehicleId, onSelectVehicle }: FleetMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapZoom, setMapZoom] = useState(11);
  const [layerMode, setLayerMode] = useState<MapLayerMode>("street");
  const [followSelection, setFollowSelection] = useState(false);
  const lastSelectedVehicleIdRef = useRef<string | null>(null);

  const selectedVehicle = useMemo(() => {
    return selectedVehicleId ? vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null : null;
  }, [selectedVehicleId, vehicles]);

  useEffect(() => {
    const mapElement = mapContainerRef.current;
    if (!mapElement || mapRef.current) {
      return;
    }

    const map = L.map(mapElement, {
      zoomControl: false,
      preferCanvas: true,
      minZoom: 9,
      maxZoom: 18
    }).setView(fallbackCenter, 11);

    const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);

    const handleZoomEnd = () => {
      setMapZoom(map.getZoom());
    };

    map.on("zoomend", handleZoomEnd);

    mapRef.current = map;
    tileLayerRef.current = tileLayer;
    markerLayerRef.current = markerLayer;

    window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      map.off("zoomend", handleZoomEnd);
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (tileLayerRef.current) {
      tileLayerRef.current.removeFrom(map);
    }

    const url =
      layerMode === "street"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";

    const nextTileLayer = L.tileLayer(url, {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    tileLayerRef.current = nextTileLayer;
  }, [layerMode]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();

    const clusters = clusterVehicles(vehicles, mapZoom);

    for (const cluster of clusters) {
      if (cluster.items.length === 1) {
        const vehicle = cluster.items[0];
        const isSelected = vehicle.id === selectedVehicleId;

        const marker = L.circleMarker([vehicle.lat, vehicle.lng], {
          radius: isSelected ? 10 : 7,
          color: "#ffffff",
          weight: 2,
          fillOpacity: 0.95,
          fillColor: statusColorByValue[vehicle.status]
        });

        marker.bindTooltip(vehicle.markerLabel, {
          direction: "top",
          offset: [0, -8]
        });

        marker.on("click", () => {
          onSelectVehicle(vehicle.id);
        });

        if (isSelected) {
          marker.bindPopup(
            `<strong>${vehicle.plate_number}</strong><br/>${vehicle.driver_name}<br/>${statusLabelByValue[vehicle.status]}`
          );
          marker.openPopup();
        }

        marker.addTo(markerLayer);
        continue;
      }

      const marker = L.marker([cluster.centerLat, cluster.centerLng], {
        icon: L.divIcon({
          className: "fms-cluster-pin",
          html: `<span>${cluster.items.length}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        })
      });

      marker.on("click", () => {
        const bounds = L.latLngBounds(cluster.items.map((vehicle) => [vehicle.lat, vehicle.lng] as [number, number]));
        map.fitBounds(bounds, {
          padding: [36, 36],
          maxZoom: Math.max(map.getZoom() + 2, 14)
        });
      });

      marker.addTo(markerLayer);
    }
  }, [mapZoom, onSelectVehicle, selectedVehicleId, vehicles]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedVehicle) {
      return;
    }

    const hasChangedSelection = selectedVehicle.id !== lastSelectedVehicleIdRef.current;
    if (hasChangedSelection || followSelection) {
      map.panTo([selectedVehicle.lat, selectedVehicle.lng], {
        animate: true,
        duration: 0.45
      });
    }

    lastSelectedVehicleIdRef.current = selectedVehicle.id;
  }, [followSelection, selectedVehicle]);

  const zoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const zoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const fitFleet = () => {
    const map = mapRef.current;

    if (!map || vehicles.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(vehicles.map((vehicle) => [vehicle.lat, vehicle.lng] as [number, number]));
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14
    });
  };

  const centerSelected = () => {
    const map = mapRef.current;

    if (!map || !selectedVehicle) {
      return;
    }

    map.setView([selectedVehicle.lat, selectedVehicle.lng], Math.max(map.getZoom(), 13), {
      animate: true
    });
  };

  return (
    <div className="fms-map-shell">
      <div ref={mapContainerRef} className="fms-map-canvas" />

      <div className="fms-map-controls fms-map-controls-left">
        <button type="button" onClick={zoomIn}>
          +
        </button>
        <button type="button" onClick={zoomOut}>
          -
        </button>
      </div>

      <div className="fms-map-controls fms-map-controls-right">
        <button type="button" onClick={fitFleet}>
          Fit fleet
        </button>
        <button type="button" onClick={centerSelected} disabled={!selectedVehicle}>
          Focus selected
        </button>
        <label className="fms-layer-picker">
          Layer
          <select value={layerMode} onChange={(event) => setLayerMode(event.target.value as MapLayerMode)}>
            <option value="street">OSM Street</option>
            <option value="logistics">OSM Logistics</option>
          </select>
        </label>
        <button
          type="button"
          className={followSelection ? "is-active" : undefined}
          onClick={() => setFollowSelection((value) => !value)}
        >
          Follow
        </button>
      </div>
    </div>
  );
}

function ReservedSection({ section }: { section: FmsSection }) {
  return (
    <section className="fms-surface">
      <h2>{sectionTitles[section]}</h2>
      <p>
        Navigation slot is intentionally preserved for the screenshot structure. This section remains a placeholder in MVP.
      </p>
    </section>
  );
}

function FleetSection({
  apiClient,
  backendVersion
}: {
  apiClient: ReturnType<typeof createFmsApiClient>;
  backendVersion: string;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ignitionFilter, setIgnitionFilter] = useState<"" | "on" | "off">("");
  const [sortOption, setSortOption] = useState<SortOptionValue>("updated_desc");
  const [pageSize, setPageSize] = useState(200);
  const [page, setPage] = useState(1);
  const [simulationTick, setSimulationTick] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const sortQuery = useMemo(() => {
    return sortOptions.find((option) => option.value === sortOption)?.query ?? "updated_at:desc";
  }, [sortOption]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = window.setInterval(() => {
      setSimulationTick((value) => value + 1);
    }, 7000);

    return () => {
      window.clearInterval(interval);
    };
  }, [autoRefresh]);

  const vehiclesQuery = useQuery({
    queryKey: [
      "fms",
      "vehicles",
      backendVersion,
      page,
      pageSize,
      searchQuery,
      statusFilter,
      ignitionFilter,
      sortQuery
    ],
    queryFn: () =>
      apiClient.getFleetVehicles({
        page,
        pageSize,
        search: searchQuery,
        sort: sortQuery,
        status: statusFilter || undefined,
        ignition: ignitionFilter || undefined
      }),
    placeholderData: (previous) => previous
  });

  const mapMarkersQuery = useQuery({
    queryKey: ["fms", "map-markers", backendVersion],
    queryFn: () => apiClient.getMapMarkers(),
    placeholderData: (previous) => previous
  });

  const pagination = vehiclesQuery.data?.pagination;

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination]);

  const markerLabelsByVehicleId = useMemo(() => {
    const lookup = new Map<string, string>();

    for (const marker of mapMarkersQuery.data ?? []) {
      lookup.set(marker.vehicle_id, marker.label);
    }

    return lookup;
  }, [mapMarkersQuery.data]);

  const liveVehicles = useMemo<LiveFleetVehicle[]>(() => {
    const vehicles = vehiclesQuery.data?.items ?? [];

    return vehicles.map((vehicle: FleetVehicle) => {
      const simulated = simulateVehicle(vehicle, simulationTick, statusFilter, ignitionFilter);

      return {
        ...simulated,
        markerLabel: markerLabelsByVehicleId.get(vehicle.id) ?? `${vehicle.plate_number} (${vehicle.driver_name})`
      };
    });
  }, [vehiclesQuery.data?.items, simulationTick, statusFilter, ignitionFilter, markerLabelsByVehicleId]);

  useEffect(() => {
    if (liveVehicles.length === 0) {
      setSelectedVehicleId(null);
      return;
    }

    setSelectedVehicleId((current) => {
      if (current && liveVehicles.some((vehicle) => vehicle.id === current)) {
        return current;
      }

      return liveVehicles[0].id;
    });
  }, [liveVehicles]);

  const selectedVehicle = selectedVehicleId
    ? liveVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null
    : null;

  return (
    <section className="fms-surface fms-fleet-surface">
      <div className="fms-fleet-toolbar">
        <div className="fms-toolbar-left">
          <h1>Fleet map</h1>
          <SearchInput
            placeholder="Vehicle or driver"
            hotkeyHint=""
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            className="fms-filter-button"
            onClick={() => {
              setSearchQuery(searchInput.trim());
              setPage(1);
            }}
          >
            Search
          </button>
          <select
            aria-label="Filter by status"
            className="fms-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="online">Online</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
            <option value="alert">Alert</option>
          </select>
          <select
            aria-label="Filter by ignition"
            className="fms-select"
            value={ignitionFilter}
            onChange={(event) => {
              setIgnitionFilter(event.target.value as "" | "on" | "off");
              setPage(1);
            }}
          >
            <option value="">Any ignition</option>
            <option value="on">Ignition on</option>
            <option value="off">Ignition off</option>
          </select>
          <select
            aria-label="Sort vehicles"
            className="fms-select"
            value={sortOption}
            onChange={(event) => {
              setSortOption(event.target.value as SortOptionValue);
              setPage(1);
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="fms-toolbar-right">
          <label className="fms-toggle-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
            Live refresh
          </label>
          <button
            type="button"
            className="fms-ghost-button"
            onClick={() => setSimulationTick((value) => value + 1)}
          >
            Refresh now
          </button>
          <label className="fms-rows-control">
            Rows
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </label>
        </div>
      </div>

      <div className="fms-fleet-layout">
        <aside className="fms-vehicle-list-panel">
          <header>
            <h2>Vehicles</h2>
            <p>{liveVehicles.length} visible</p>
          </header>

          <div className="fms-vehicle-list" role="listbox" aria-label="Fleet vehicles">
            {liveVehicles.map((vehicle) => {
              const isSelected = vehicle.id === selectedVehicleId;

              return (
                <button
                  type="button"
                  key={vehicle.id}
                  className={`fms-vehicle-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  <div className="fms-vehicle-row">
                    <strong>{vehicle.plate_number}</strong>
                    <span className={`fms-status-chip is-${vehicle.status}`}>
                      <span className="fms-status-dot" aria-hidden />
                      {statusLabelByValue[vehicle.status]}
                    </span>
                  </div>

                  <p>{vehicle.driver_name}</p>

                  <div className="fms-telemetry-grid">
                    <span>Speed: {vehicle.speed_kmh} km/h</span>
                    <span>Ignition: {vehicle.ignition_on ? "On" : "Off"}</span>
                    <span>Updated: {formatRelativeUpdatedAt(vehicle.updated_at)}</span>
                    <span>
                      Pos: {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                    </span>
                  </div>
                </button>
              );
            })}

            {!vehiclesQuery.isLoading && liveVehicles.length === 0 ? (
              <p className="fms-list-empty">No vehicles match the current filters.</p>
            ) : null}
          </div>

          <footer className="fms-vehicle-footer">
            <div className="fms-pagination">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || vehiclesQuery.isLoading}
              >
                Prev
              </button>
              <span>
                Page {pagination?.page ?? page} / {Math.max(pagination?.totalPages ?? 1, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination || page >= pagination.totalPages || vehiclesQuery.isLoading}
              >
                Next
              </button>
            </div>

            <small>
              Showing {liveVehicles.length} of {pagination?.total ?? 0}
            </small>
          </footer>
        </aside>

        <div className="fms-map-panel">
          <div className="fms-map-header">
            <h2>Live map canvas</h2>
            <p>
              {selectedVehicle
                ? `Selected: ${selectedVehicle.plate_number} (${selectedVehicle.driver_name})`
                : "Select a vehicle to focus the map"}
            </p>
          </div>

          <FleetMapCanvas
            vehicles={liveVehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />
        </div>
      </div>

      {vehiclesQuery.error ? <p className="fms-error">{String(vehiclesQuery.error.message)}</p> : null}
      {mapMarkersQuery.error ? <p className="fms-error">{String(mapMarkersQuery.error.message)}</p> : null}
    </section>
  );
}

export function FmsPage({
  session,
  apiClient,
  modules,
  section,
  unreadNotifications,
  frontendVersion,
  backendVersion
}: FmsPageProps) {
  return (
    <div className="fms-page">
      <header className="fms-topbar">
        <a className="fms-brand" href={`/${frontendVersion}/`}>
          <span className="fms-brand-mark">N6</span>
          <span>
            <strong>Naiton</strong>
            <small>Business Suite</small>
          </span>
        </a>

        <div className="fms-top-search">
          <SearchInput readOnly value="" placeholder="Search Naiton" hotkeyHint="" />
        </div>

        <nav className="fms-top-modules">
          {modules.map((module) => (
            <a
              key={module.key}
              href={module.href}
              className={module.active ? "is-active" : undefined}
              aria-disabled={module.disabled}
              onClick={(event) => {
                if (module.disabled || !module.href) {
                  event.preventDefault();
                }
              }}
            >
              {module.label}
              {module.comingSoon ? <span className="fms-coming-soon">Soon</span> : null}
            </a>
          ))}
        </nav>

        <div className="fms-top-actions">
          <button type="button" className="fms-icon-button" title="Workspace">
            []
          </button>
          <button type="button" className="fms-icon-button" title="Share">
            S
          </button>
          <button type="button" className="fms-icon-button" title="Help">
            ?
          </button>
          <button type="button" className="fms-icon-button" title="Notifications">
            !
            {unreadNotifications > 0 ? <span className="fms-count-dot">{unreadNotifications}</span> : null}
          </button>
          <div className="fms-profile-pill">
            <span>{session.display_name}</span>
            <small>{session.role}</small>
          </div>
        </div>
      </header>

      <div className="fms-body">
        <aside className="fms-side-rail">
          <a href={`/${frontendVersion}/fleet`} className={section === "fleet" ? "is-active" : undefined}>
            Fleet
          </a>
          <a href={`/${frontendVersion}/trips`} className={section === "trips" ? "is-active" : undefined}>
            Trips
          </a>
          <a href={`/${frontendVersion}/service`} className={section === "service" ? "is-active" : undefined}>
            Service
          </a>
          <a href={`/${frontendVersion}/zones`} className={section === "zones" ? "is-active" : undefined}>
            Zones
          </a>
        </aside>

        <main className="fms-main">
          {section === "fleet" ? (
            <FleetSection apiClient={apiClient} backendVersion={backendVersion} />
          ) : (
            <ReservedSection section={section} />
          )}
        </main>
      </div>
    </div>
  );
}
