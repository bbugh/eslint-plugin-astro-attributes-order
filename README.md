# eslint-plugin-astro-attributes-order

Enforce an opinionated fixed attribute order on elements in `.astro` template elements, modeled after `vue/attributes-order`, with autofix support.

```html
<!-- before -->
<Card onclick="func" class="bg-white" id="some-card" />
<!-- after -->
<Card id="some-card" class="bg-white" onclick="func" />
```

### Requirements

- `eslint@^9 || ^10`
- Node 20+

## Install

```sh
npm add -D eslint-plugin-astro-attributes-order
```

```sh
pnpm add -D eslint-plugin-astro-attributes-order
```

```sh
yarn add -D eslint-plugin-astro-attributes-order
```

### Usage

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

> [!NOTE]
> Group order is enforced, but within groups your source order is preserved.

## Attribution

This plugin would not have been possible without the work that went into these other libraries:

- [`eslint-plugin-astro`](https://github.com/ota-meshi/eslint-plugin-astro)
- [`eslint-plugin-vue`](https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/attributes-order.md)

## License

The eslint-plugin-astro-attributes-order library is available as open source under the terms of the MIT License.

This license means you can use it however you want, in whatever sorted order you want, as long as you give me credit.
