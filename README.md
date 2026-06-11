# eslint-plugin-astro-attributes-order

Enforce an opinionated fixed attribute order on elements in `.astro` template elements, modeled after `vue/attributes-order`.

```html
<!-- before -->
<Card onclick="func" class="bg-white" id="some-card" />
<!-- after -->
<Card id="some-card" class="bg-white" onclick="func" />
```

## Install

```sh
pnpm add -D eslint-plugin-astro-attributes-order
```

Requires `eslint@^9` and Node 20+.

## Usage

```diff
// eslint.config.js
import eslintPluginAstro from "eslint-plugin-astro";
+import eslintPluginAstroAttrOrder from "eslint-plugin-astro-attributes-order";

export default [
  ...eslintPluginAstro.configs.recommended,
+  eslintPluginAstroAttrOrder.configs.recommended
];
```

## Group order

1. `is`
2. `id`, `key`, `name`, `ref`, `slot`
3. `class`, `class:list`, `style`
4. Astro directives: `^(client|server|set|transition|is):` (e.g. `client:load`, `set:html`)
5. HTML attributes and unrecognized/custom attributes (everything not matched elsewhere)
6. `aria-*`
7. Event handlers: `on*`
8. `data-*`

Group order is enforced, but within groups the source order is preserved.

## Attribution

This plugin would not have been possible without the work that went into these other libraries:

- [`eslint-plugin-astro`](https://github.com/ota-meshi/eslint-plugin-astro)
- [`eslint-plugin-vue`](https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/attributes-order.md)

## License

MIT
