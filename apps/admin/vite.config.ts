import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.ADMIN_PORT ?? 3004);

  return {
    plugins: [react()],
    envPrefix: ["VITE_", "NAITON_", "ADMIN_"],
    server: {
      host: "0.0.0.0",
      port
    },
    preview: {
      host: "0.0.0.0",
      port
    }
  };
});
