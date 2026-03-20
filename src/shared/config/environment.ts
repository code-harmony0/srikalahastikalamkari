// Main environment config entrypoint
// Automatically resolves to dev or production config based on NODE_ENV

import environmentDevelopment from "./environment.development";
import environmentProduction from "./environment.production";

const environment =
  process.env.NODE_ENV === "production"
    ? environmentProduction
    : environmentDevelopment;

export default environment;
