export const GROUP_ORDER = [
  "is",
  "key",
  "classStyle",
  "directive",
  "other",
  "aria",
  "event",
  "data",
] as const;

export type Group = (typeof GROUP_ORDER)[number];

const KEY_NAMES = new Set(["id", "key", "name", "ref", "slot"]);
const CLASS_STYLE_NAMES = new Set(["class", "class:list", "style"]);
const DIRECTIVE_PREFIX = /^(client|server|set|transition|is):/;

export function classify(name: string): Group {
  if (name === "is") return "is";
  if (KEY_NAMES.has(name)) return "key";
  if (CLASS_STYLE_NAMES.has(name)) return "classStyle";
  if (DIRECTIVE_PREFIX.test(name)) return "directive";
  if (name.startsWith("aria-")) return "aria";
  if (name.startsWith("on") && name.length > 2) return "event";
  if (name.startsWith("data-")) return "data";
  return "other";
}

export function rank(group: Group): number {
  return GROUP_ORDER.indexOf(group);
}
