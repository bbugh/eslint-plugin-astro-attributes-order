import * as astroParser from "astro-eslint-parser";
import attributesOrder from "./rules/attributes-order.js";

const meta = {
  name: "eslint-plugin-astro-attributes-order",
  version: "0.1.0",
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
