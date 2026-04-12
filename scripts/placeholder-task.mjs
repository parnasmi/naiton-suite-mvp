const [, , task = "task", workspace = "workspace"] = process.argv;

const messages = {
  dev: "placeholder dev script for Phase 1 scaffolding",
  build: "placeholder build script until app implementation starts",
  lint: "placeholder lint script until tooling is added",
  typecheck: "placeholder typecheck script until source files are added",
  test: "placeholder test script until Phase 3 and later"
};

const message = messages[task] ?? `placeholder ${task} script`;

console.log(`[phase-1] ${workspace}: ${message}`);
