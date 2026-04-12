import { FleetVehicleSchema, MapMarkerSchema, type FleetVehicle, type MapMarker } from "@naiton/contracts";

const seedVehicles: FleetVehicle[] = [
  {
    id: "veh_001",
    plate_number: "01A321BC",
    driver_name: "Azizbek K.",
    status: "online",
    speed_kmh: 62,
    ignition_on: true,
    lat: 41.312,
    lng: 69.279,
    updated_at: "2026-04-12T09:15:00.000Z"
  },
  {
    id: "veh_002",
    plate_number: "01B932DE",
    driver_name: "Javlon U.",
    status: "idle",
    speed_kmh: 0,
    ignition_on: true,
    lat: 41.301,
    lng: 69.245,
    updated_at: "2026-04-12T09:12:00.000Z"
  },
  {
    id: "veh_003",
    plate_number: "01D442FG",
    driver_name: "Ulugbek P.",
    status: "offline",
    speed_kmh: 0,
    ignition_on: false,
    lat: 41.266,
    lng: 69.218,
    updated_at: "2026-04-12T08:40:00.000Z"
  },
  {
    id: "veh_004",
    plate_number: "01E117HI",
    driver_name: "Nodira S.",
    status: "maintenance",
    speed_kmh: 0,
    ignition_on: false,
    lat: 41.337,
    lng: 69.301,
    updated_at: "2026-04-12T08:32:00.000Z"
  },
  {
    id: "veh_005",
    plate_number: "01F808JK",
    driver_name: "Rustam T.",
    status: "alert",
    speed_kmh: 12,
    ignition_on: true,
    lat: 41.291,
    lng: 69.355,
    updated_at: "2026-04-12T09:08:00.000Z"
  },
  {
    id: "veh_006",
    plate_number: "01G523LM",
    driver_name: "Sarvar N.",
    status: "online",
    speed_kmh: 74,
    ignition_on: true,
    lat: 41.358,
    lng: 69.211,
    updated_at: "2026-04-12T09:14:00.000Z"
  },
  {
    id: "veh_007",
    plate_number: "01H093NO",
    driver_name: "Kamila D.",
    status: "online",
    speed_kmh: 57,
    ignition_on: true,
    lat: 41.348,
    lng: 69.402,
    updated_at: "2026-04-12T09:16:00.000Z"
  },
  {
    id: "veh_008",
    plate_number: "01J744PQ",
    driver_name: "Murod I.",
    status: "idle",
    speed_kmh: 0,
    ignition_on: true,
    lat: 41.280,
    lng: 69.191,
    updated_at: "2026-04-12T09:00:00.000Z"
  }
];

export const fleetVehicles = seedVehicles.map((vehicle) => FleetVehicleSchema.parse(vehicle));

export const mapMarkers: MapMarker[] = fleetVehicles.map((vehicle) =>
  MapMarkerSchema.parse({
    id: `marker_${vehicle.id}`,
    vehicle_id: vehicle.id,
    lat: vehicle.lat,
    lng: vehicle.lng,
    status: vehicle.status,
    label: `${vehicle.plate_number} (${vehicle.driver_name})`
  })
);
