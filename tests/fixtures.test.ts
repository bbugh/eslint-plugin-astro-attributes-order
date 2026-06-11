import { Linter } from "eslint";
import * as astroParser from "astro-eslint-parser";
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import rule from "../src/rules/attributes-order.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "fixtures");

const linter = new Linter();
const config: Linter.Config = {
  files: ["**/*.astro"],
  languageOptions: {
    parser: astroParser as unknown as Linter.Parser,
  },
  plugins: {
    local: { rules: { "attributes-order": rule } },
  },
  rules: {
    "local/attributes-order": "error",
  },
};

const fixtures = readdirSync(fixturesDir)
  .filter((f) => f.endsWith(".input.astro"))
  .map((f) => f.replace(/\.input\.astro$/, ""));

describe("fixtures", () => {
  for (const name of fixtures) {
    const inputFile = `${name}.input.astro`;
    const outputFile = `${name}.output.astro`;

    it(`fixes ${inputFile} to match ${outputFile}`, () => {
      const input = readFileSync(join(fixturesDir, inputFile), "utf8");
      const expected = readFileSync(join(fixturesDir, outputFile), "utf8");
      const result = linter.verifyAndFix(input, config, {
        filename: inputFile,
      });
      expect(result.output).toBe(expected);
    });

    it(`re-running fix on ${inputFile} is a no-op`, () => {
      const input = readFileSync(join(fixturesDir, inputFile), "utf8");
      const first = linter.verifyAndFix(input, config, { filename: inputFile });
      const second = linter.verifyAndFix(first.output, config, {
        filename: inputFile,
      });
      expect(second.fixed).toBe(false);
      expect(second.output).toBe(first.output);
    });
  }
});
