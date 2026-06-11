import * as astroParser from "astro-eslint-parser";
import attributesOrder from "./rules/attributes-order.js";

import pkg from "../package.json" with { type: "json" };

const meta = {
  name: pkg.name,
  version: pkg.version,
};

const plugin = {
  meta,
  rules: {
    "attributes-order": attributesOrder,
  },
};

const recommended = {
  files: ["**/*.astro"],
  languageOptions: {
    parser: astroParser,
  },
  plugins: {
    "astro-attributes-order": plugin,
  },
  rules: {
    "astro-attributes-order/attributes-order": "error",
  },
} as const;

export default {
  ...plugin,
  configs: {
    recommended,
  },
};
