# eslint-plugin-astro-attributes-order

ESLint 9 flat-config plugin enforcing a fixed attribute order on `.astro` template elements. No configuration. Auto-fixable.

## Install

```sh
pnpm add -D eslint-plugin-astro-attributes-order
```

Requires `eslint@^9` and Node 20+.

## Usage

```js
// eslint.config.js
import attrOrder from "eslint-plugin-astro-attributes-order";

export default [attrOrder.configs.recommended];
```

`configs.recommended` is a single flat-config object that registers `astro-eslint-parser` for `**/*.astro` and turns the rule on as `error`.

## Group order

1. `is`
2. `id`, `key`, `name`, `ref`, `slot`
3. `class`, `class:list`, `style`
4. Astro directives: `^(client|server|set|transition|is):` (e.g. `client:load`, `set:html`)
5. HTML attributes and unrecognized/custom attributes (everything not matched elsewhere)
6. `aria-*`
7. Event handlers: `on*`
8. `data-*`

Between groups: enforced. Within a group: source order is preserved.

`{...spread}` is a hard barrier — attributes are sorted independently on each side and never reordered across a spread.

Applies to both lowercase HTML elements and uppercase component elements.

## Attribution

The fixer and AST handling are informed by:

- [`eslint-plugin-perfectionist`](https://github.com/azat-io/eslint-plugin-perfectionist) (`sort-astro-attributes`) — MIT
- [`eslint-plugin-astro`](https://github.com/ota-meshi/eslint-plugin-astro) (`sort-attributes`) — MIT

## License

MIT
