import { Linter, RuleTester } from "eslint";
import * as astroParser from "astro-eslint-parser";
import { describe, expect, it } from "vitest";
import rule from "../src/rules/attributes-order.js";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: astroParser as unknown as Parameters<RuleTester["run"]>[2] extends {
      languageOptions: { parser: infer P };
    }
      ? P
      : never,
  },
});

const wrap = (inner: string) => `---\n---\n${inner}`;

describe("attributes-order", () => {
  it("runs RuleTester suite", () => {
    ruleTester.run("attributes-order", rule, {
      valid: [
        wrap(
          `<div is="foo" id="x" class="c" client:load href="/a" aria-label="l" onclick={fn} data-x="1" />`,
        ),
        wrap(`<div id="x" name="n" />`),
        wrap(`<div class="c" style="color:red" />`),
        wrap(`<div class:list={[]} />`),
        wrap(`<div set:html={raw} />`),
        wrap(`<div href="/a" type="button" />`),
        wrap(`<div aria-label="l" />`),
        wrap(`<div onclick={fn} />`),
        wrap(`<div data-x="1" />`),
        wrap(
          `<Foo is="bar" id="x" class="c" client:load aria-label="l" onclick={fn} data-x="1" />`,
        ),
        wrap(`<div class="c" onclick={fn} {...rest} id="x" data-x="1" />`),
        wrap(`<div {value} />`),
        wrap(`<div name=\`tpl-\${x}\` />`),
        wrap(`<div\n  id="x"\n  class="c"\n  data-x="1"\n/>`),
      ],
      invalid: [
        {
          code: wrap(`<div class="c" id="x" />`),
          output: wrap(`<div id="x" class="c" />`),
          errors: 1,
        },
        {
          code: wrap(`<div data-x="1" onclick={fn} />`),
          output: wrap(`<div onclick={fn} data-x="1" />`),
          errors: 1,
        },
        {
          code: wrap(`<div onclick={fn} aria-label="l" />`),
          output: wrap(`<div aria-label="l" onclick={fn} />`),
          errors: 1,
        },
        {
          code: wrap(`<div href="/a" class="c" />`),
          output: wrap(`<div class="c" href="/a" />`),
          errors: 1,
        },
        {
          code: wrap(`<div client:load class="c" />`),
          output: wrap(`<div class="c" client:load />`),
          errors: 1,
        },
        {
          code: wrap(`<div id="x" is="b" />`),
          output: wrap(`<div is="b" id="x" />`),
          errors: 1,
        },
        {
          code: wrap(
            `<div data-x="1" class="c" id="x" onclick={fn} aria-label="l" client:load href="/a" is="b" />`,
          ),
          output: wrap(
            `<div is="b" id="x" class="c" client:load href="/a" aria-label="l" onclick={fn} data-x="1" />`,
          ),
          errors: 1,
        },
        {
          code: wrap(
            `<div data-x="1" class="c" {...rest} onclick={fn} id="x" />`,
          ),
          output: wrap(
            `<div class="c" data-x="1" {...rest} id="x" onclick={fn} />`,
          ),
          errors: 2,
        },
        {
          code: wrap(`<Foo data-x="1" id="x" />`),
          output: wrap(`<Foo id="x" data-x="1" />`),
          errors: 1,
        },
        {
          code: wrap(`<div\n  data-x="1"\n  id="x"\n/>`),
          output: wrap(`<div\n  id="x"\n  data-x="1"\n/>`),
          errors: 1,
        },
        {
          code: wrap(`<div data-x={value} class="c" />`),
          output: wrap(`<div class="c" data-x={value} />`),
          errors: 1,
        },
        {
          code: wrap(`<div data-x=\`tpl-\${x}\` class="c" />`),
          output: wrap(`<div class="c" data-x=\`tpl-\${x}\` />`),
          errors: 1,
        },
      ],
    });
  });

  it("is idempotent: applying fix twice yields no further changes", () => {
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

    const cases = [
      `---\n---\n<div data-x="1" class="c" id="x" onclick={fn} aria-label="l" client:load href="/a" is="b" />`,
      `---\n---\n<div data-x="1" class="c" {...rest} onclick={fn} id="x" />`,
      `---\n---\n<div\n  data-x="1"\n  id="x"\n  class="c"\n/>`,
    ];

    for (const code of cases) {
      const first = linter.verifyAndFix(code, config, { filename: "f.astro" });
      const second = linter.verifyAndFix(first.output, config, {
        filename: "f.astro",
      });
      expect(second.fixed).toBe(false);
      expect(second.output).toBe(first.output);
    }
  });
});
