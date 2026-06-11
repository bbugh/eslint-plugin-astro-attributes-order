import { Linter, RuleTester } from "eslint";
import * as astroParser from "astro-eslint-parser";
import { describe, expect, it } from "vitest";
import rule from "../src/rules/attributes-order.js";

const languageOptions = {
  parser: astroParser as unknown as Linter.Parser,
};

const ruleTester = new RuleTester({ languageOptions });

describe("attributes-order", () => {
  it("enforces canonical group order on Astro elements", () => {
    ruleTester.run("attributes-order", rule, {
      valid: [
        // single attribute
        `<div class="c" />`,
        // already-correct full ladder
        `<div is="x" id="i" class="c" client:load href="/a" aria-label="l" onclick={fn} data-x="1" />`,
        // group 2: all key names in source order
        `<div id="x" key={k} name="n" ref={r} slot="s" />`,
        // group 3: class/style variants
        `<div class="c" class:list={["a","b"]} style="color:red" />`,
        // group 4: multiple directives in source order
        `<div client:load set:html={raw} transition:name="x" />`,
        // group 5: arbitrary HTML
        `<div href="/a" type="button" disabled />`,
        // group 7: multiple events in source order
        `<div onclick={a} onmouseover={b} onfocus={c} />`,
        // group 8: multiple data-* in source order
        `<div data-a="1" data-b="2" data-c="3" />`,
        // component element
        `<Foo is="bar" id="x" class="c" client:load aria-label="l" onclick={fn} data-x="1" />`,
        // segments around a spread are sorted independently
        `<div class="c" onclick={fn} {...rest} id="x" data-x="1" />`,
        // shorthand attr
        `<div {value} />`,
        // template-literal attr
        `<div name=\`tpl-\${x}\` />`,
        // multi-line layout, already in order
        `<div\n  id="x"\n  class="c"\n  data-x="1"\n/>`,
        // tabs between attrs
        `<div\tid="x"\tclass="c"\tdata-x="1" />`,
        // element with children, not self-closing
        `<div id="x" class="c">child</div>`,
        // single spread only
        `<div {...rest} />`,
        // spread between two correctly-ordered segments
        `<div is="x" id="i" {...rest} class="c" data-x="1" />`,
        // two spreads, each segment correct (or empty)
        `<div {...a} {...b} />`,
        `<div id="i" {...a} class="c" {...b} data-x="1" />`,
        // long realistic list (button)
        `<button id="submit" class="btn primary" disabled type="submit" aria-label="Submit" onclick={handle} data-test="submit" />`,
        // long realistic list (img)
        `<img id="hero" class="rounded" src="/x.png" alt="x" width="800" height="600" loading="lazy" aria-hidden="false" data-id="hero" />`,
        // arbitrary unrecognized custom attr falls into group 5
        `<my-element my-custom="x" foo-bar="y" />`,
        // expression value in group 2
        `<div id={dynamicId} class="c" />`,
        // empty/boolean attr in group 5
        `<input type="checkbox" disabled checked />`,
      ],

      invalid: [
        // simplest swap
        {
          code: `<div class="c" id="x" />`,
          output: `<div id="x" class="c" />`,
          errors: 1,
        },
        // event before aria
        {
          code: `<div onclick={fn} aria-label="l" />`,
          output: `<div aria-label="l" onclick={fn} />`,
          errors: 1,
        },
        // data before event
        {
          code: `<div data-x="1" onclick={fn} />`,
          output: `<div onclick={fn} data-x="1" />`,
          errors: 1,
        },
        // arbitrary HTML before class
        {
          code: `<div href="/a" class="c" />`,
          output: `<div class="c" href="/a" />`,
          errors: 1,
        },
        // directive before class
        {
          code: `<div client:load class="c" />`,
          output: `<div class="c" client:load />`,
          errors: 1,
        },
        // id before is
        {
          code: `<div id="x" is="b" />`,
          output: `<div is="b" id="x" />`,
          errors: 1,
        },

        // full reverse ladder (8 → 1)
        {
          code: `<div data-x="1" onclick={fn} aria-label="l" href="/a" client:load class="c" id="i" is="x" />`,
          output: `<div is="x" id="i" class="c" client:load href="/a" aria-label="l" onclick={fn} data-x="1" />`,
          errors: 1,
        },

        // long list with all groups out of order
        {
          code: `<div data-x="1" data-y="2" onclick={fn} onmouseover={fn2} aria-label="l" aria-hidden="false" href="/a" type="button" class="c" style="color:red" client:load set:html={raw} id="i" name="n" is="b" />`,
          output: `<div is="b" id="i" name="n" class="c" style="color:red" client:load set:html={raw} href="/a" type="button" aria-label="l" aria-hidden="false" onclick={fn} onmouseover={fn2} data-x="1" data-y="2" />`,
          errors: 1,
        },

        // segments around multiple spreads are fixed independently
        {
          code: `<div data-x="1" class="c" {...rest} onclick={fn} id="x" />`,
          output: `<div class="c" data-x="1" {...rest} id="x" onclick={fn} />`,
          errors: 2,
        },
        // three segments
        {
          code: `<div data-a="1" id="x" {...one} onclick={fn} class="c" {...two} aria-label="l" href="/a" />`,
          output: `<div id="x" data-a="1" {...one} class="c" onclick={fn} {...two} href="/a" aria-label="l" />`,
          errors: 3,
        },

        // multi-line: newlines preserved between attributes
        {
          code: `<div\n  data-x="1"\n  id="x"\n/>`,
          output: `<div\n  id="x"\n  data-x="1"\n/>`,
          errors: 1,
        },
        // multi-line, full reverse
        {
          code: `<div\n  data-x="1"\n  onclick={fn}\n  aria-label="l"\n  href="/a"\n  client:load\n  class="c"\n  id="i"\n  is="x"\n/>`,
          output: `<div\n  is="x"\n  id="i"\n  class="c"\n  client:load\n  href="/a"\n  aria-label="l"\n  onclick={fn}\n  data-x="1"\n/>`,
          errors: 1,
        },
        // mixed single-line and multi-line gaps
        {
          code: `<div\n  data-x="1" class="c"\n  id="x"\n/>`,
          output: `<div\n  id="x" class="c"\n  data-x="1"\n/>`,
          errors: 1,
        },
        // multi-line component (README example)
        {
          code: `<Card\n  onclick="func"\n  class="bg-white"\n  id="some-card"\n/>`,
          output: `<Card\n  id="some-card"\n  class="bg-white"\n  onclick="func"\n/>`,
          errors: 1,
        },
        // tab whitespace preserved
        {
          code: `<div\tdata-x="1"\tid="x" />`,
          output: `<div\tid="x"\tdata-x="1" />`,
          errors: 1,
        },
        // multiple-space whitespace preserved
        {
          code: `<div   data-x="1"   id="x" />`,
          output: `<div   id="x"   data-x="1" />`,
          errors: 1,
        },

        // shorthand {value} classified by its name (group 5)
        {
          code: `<div data-x="1" {value} />`,
          output: `<div {value} data-x="1" />`,
          errors: 1,
        },
        // template-literal attr at wrong position (group 2 since name=key)
        {
          code: `<div data-x="1" name=\`tpl-\${x}\` />`,
          output: `<div name=\`tpl-\${x}\` data-x="1" />`,
          errors: 1,
        },

        // expression-valued attr classified by name
        {
          code: `<div data-x={value} class="c" />`,
          output: `<div class="c" data-x={value} />`,
          errors: 1,
        },

        // component element same rules
        {
          code: `<Foo data-x="1" id="x" />`,
          output: `<Foo id="x" data-x="1" />`,
          errors: 1,
        },

        // scrambled button across multiple groups
        {
          code: `<button data-test="x" onclick={fn} aria-label="Go" disabled type="submit" class="btn" id="b" />`,
          output: `<button id="b" class="btn" disabled type="submit" aria-label="Go" onclick={fn} data-test="x" />`,
          errors: 1,
        },

        // scrambled img across multiple groups
        {
          code: `<img data-id="hero" onload={fn} aria-hidden="false" src="/x.png" alt="x" width="800" height="600" class="rounded" id="hero" />`,
          output: `<img id="hero" class="rounded" src="/x.png" alt="x" width="800" height="600" aria-hidden="false" onload={fn} data-id="hero" />`,
          errors: 1,
        },

        // within-group ordering preserved (id before name even when both wrong relative to class)
        {
          code: `<div class="c" name="n" id="i" />`,
          output: `<div name="n" id="i" class="c" />`,
          errors: 1,
        },
      ],
    });
  });

  it("is idempotent: applying fix twice yields no further changes", () => {
    const linter = new Linter();
    const config: Linter.Config = {
      files: ["**/*.astro"],
      languageOptions,
      plugins: { local: { rules: { "attributes-order": rule } } },
      rules: { "local/attributes-order": "error" },
    };

    const cases = [
      `<div data-x="1" class="c" id="x" onclick={fn} aria-label="l" client:load href="/a" is="b" />`,
      `<div data-x="1" class="c" {...rest} onclick={fn} id="x" />`,
      `<div\n  data-x="1"\n  id="x"\n  class="c"\n/>`,
      `<div data-a="1" id="x" {...one} onclick={fn} class="c" {...two} aria-label="l" href="/a" />`,
      `<button data-test="x" onclick={fn} aria-label="Go" disabled type="submit" class="btn" id="b" />`,
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
