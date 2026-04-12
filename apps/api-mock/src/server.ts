import { API_PORT } from "./config";
import { createApiMockApp } from "./app";

const app = createApiMockApp();

app.listen(API_PORT, () => {
  console.log(`@naiton/api-mock listening on http://localhost:${API_PORT}`);
});
