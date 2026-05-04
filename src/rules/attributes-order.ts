import type { Rule } from "eslint";
import { classify, rank } from "../groups.ts";

type AttrInfo = {
  node: any;
  name: string;
  rank: number;
  index: number;
};

function getAttrName(attribute: any, sourceText: string): string {
  const nameNode = attribute.name;
  if (typeof nameNode?.name === "string") {
    return nameNode.name;
  }
  return sourceText.slice(nameNode.range[0], nameNode.range[1]);
}

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description:
        "Enforce a fixed attribute order on Astro template elements.",
    },
    fixable: "code",
    schema: [],
    messages: {
      outOfOrder:
        'Attribute "{{name}}" should come before "{{before}}" based on the configured group order.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    function checkOpeningElement(openingElement: any) {
      const attributes = openingElement.attributes;
      if (!attributes || attributes.length < 2) return;

      const segments: AttrInfo[][] = [[]];
      for (const attribute of attributes) {
        if (attribute.type === "JSXSpreadAttribute") {
          segments.push([]);
          continue;
        }
        const name = getAttrName(attribute, sourceCode.text);
        const seg = segments[segments.length - 1]!;
        seg.push({
          node: attribute,
          name,
          rank: rank(classify(name)),
          index: seg.length,
        });
      }

      for (const segment of segments) {
        if (segment.length < 2) continue;

        const sorted = [...segment].sort((a, b) => {
          if (a.rank !== b.rank) return a.rank - b.rank;
          return a.index - b.index;
        });

        let firstMismatch = -1;
        for (let i = 0; i < segment.length; i++) {
          if (segment[i] !== sorted[i]) {
            firstMismatch = i;
            break;
          }
        }
        if (firstMismatch === -1) continue;

        const offending = segment[firstMismatch]!;
        const expected = sorted[firstMismatch]!;

        const start = segment[0]!.node.range[0];
        const end = segment[segment.length - 1]!.node.range[1];

        const gaps: string[] = [];
        for (let i = 0; i < segment.length - 1; i++) {
          gaps.push(
            sourceCode.text.slice(
              segment[i]!.node.range[1],
              segment[i + 1]!.node.range[0],
            ),
          );
        }

        let replacement = "";
        for (let i = 0; i < sorted.length; i++) {
          replacement += sourceCode.text.slice(
            sorted[i]!.node.range[0],
            sorted[i]!.node.range[1],
          );
          if (i < sorted.length - 1) replacement += gaps[i]!;
        }

        context.report({
          node: offending.node,
          messageId: "outOfOrder",
          data: { name: expected.name, before: offending.name },
          fix(fixer) {
            return fixer.replaceTextRange([start, end], replacement);
          },
        });
      }
    }

    return {
      JSXOpeningElement(node: any) {
        checkOpeningElement(node);
      },
    };
  },
};

export default rule;
