const docsUrlBase = "https://example.com/eslint-local-rules";

function isReactEventProp(name, allowed) {
  return allowed.includes(name);
}

function isIdentifier(node) {
  return node && node.type === "Identifier";
}

function matchesAny(name, patterns) {
  return patterns.some((p) => new RegExp(p).test(name));
}

export default {
  rules: {
    "no-generic-event-handlers": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Discourage generic handler names for React event props; prefer inline or descriptive names.",
          url: `${docsUrlBase}/no-generic-event-handlers`,
        },
        schema: [
          {
            type: "object",
            properties: {
              bannedPatterns: { type: "array", items: { type: "string" } },
              allowlistPatterns: { type: "array", items: { type: "string" } },
              reactEventProps: { type: "array", items: { type: "string" } },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const opts = context.options[0] || {};
        const banned = opts.bannedPatterns || [];
        const allow = opts.allowlistPatterns || [];
        const reactEventProps = opts.reactEventProps || [];

        return {
          JSXAttribute(node) {
            const name = node.name && node.name.name;
            if (!name || !isReactEventProp(name, reactEventProps)) return;

            const value = node.value;
            if (!value || value.type !== "JSXExpressionContainer") return;
            const expr = value.expression;

            if (
              expr.type === "ArrowFunctionExpression" ||
              expr.type === "FunctionExpression"
            ) {
              return; // inline is fine
            }

            let idName = null;
            if (isIdentifier(expr)) {
              idName = expr.name;
            } else if (expr.type === "MemberExpression") {
              if (isIdentifier(expr.property)) {
                idName = expr.property.name;
              }
            }

            if (!idName) return;

            const bannedHit = matchesAny(idName, banned);
            const allowedHit = matchesAny(idName, allow);

            if (bannedHit && !allowedHit) {
              context.report({
                node,
                message: `Prefer inline handler or descriptive name over generic "${idName}" for ${name}.`,
              });
            }
          },
        };
      },
    },

    "prefer-inline-single-use-handlers": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "If a handler is referenced only once, prefer inlining for colocation and clear intent.",
          url: `${docsUrlBase}/prefer-inline-single-use-handlers`,
        },
        schema: [
          {
            type: "object",
            properties: {
              reactEventProps: { type: "array", items: { type: "string" } },
              ignoreIfHandlerUsedMultipleTimes: { type: "boolean" },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const opts = context.options[0] || {};
        const reactEventProps = opts.reactEventProps || [];
        const ignoreIfMultiple = opts.ignoreIfHandlerUsedMultipleTimes !== false;

        const handlerRefs = new Map();

        function trackIdentifier(id) {
          const name = id.name;
          handlerRefs.set(name, (handlerRefs.get(name) || 0) + 1);
        }

        return {
          JSXAttribute(node) {
            const name = node.name && node.name.name;
            if (!name || !reactEventProps.includes(name)) return;

            const value = node.value;
            if (!value || value.type !== "JSXExpressionContainer") return;
            const expr = value.expression;
            if (expr.type === "Identifier") {
              trackIdentifier(expr);
            }
          },
          "Program:exit"() {
            for (const [name, count] of handlerRefs.entries()) {
              if (count === 1 || !ignoreIfMultiple) {
                context.report({
                  loc: { line: 1, column: 0 },
                  message: `Handler "${name}" appears to be used only once; prefer an inline callback for colocation.`,
                });
              }
            }
          },
        };
      },
    },

    "no-bare-use-memo-callback": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Discourage useMemo/useCallback with empty deps unless justified with a perf comment.",
          url: `${docsUrlBase}/no-bare-use-memo-callback`,
        },
        schema: [
          {
            type: "object",
            properties: {
              hooks: { type: "array", items: { type: "string" } },
              requireJustificationComment: { type: "boolean" },
              commentPattern: { type: "string" },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const opts = context.options[0] || {};
        const hooks = new Set(opts.hooks || ["useMemo", "useCallback"]);
        const needComment = opts.requireJustificationComment !== false;
        const commentRe = opts.commentPattern
          ? new RegExp(opts.commentPattern)
          : /@perf|@expensive|@stable-props/;

        function hasJustificationComment(node) {
          const src = context.getSourceCode();
          const before = src.getCommentsBefore(node);
          const inline = src.getCommentsInside(node);
          const after = src.getCommentsAfter(node);
          const all = [...before, ...inline, ...after].slice(0, 3);
          return all.some((c) => commentRe.test(c.value || ""));
        }

        return {
          CallExpression(node) {
            const callee = node.callee;
            if (callee.type !== "Identifier") return;
            if (!hooks.has(callee.name)) return;

            const args = node.arguments;
            if (args.length < 2) return;

            const deps = args[1];
            const isEmptyArray =
              deps &&
              ((deps.type === "ArrayExpression" && deps.elements.length === 0) ||
                (deps.type === "Literal" && deps.value === undefined));

            if (isEmptyArray && needComment && !hasJustificationComment(node)) {
              context.report({
                node,
                message: `Avoid ${callee.name}([]) without justification. Add a comment like /* @perf: expensive child */.`,
              });
            }
          },
        };
      },
    },

    "no-trivial-use-memo": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Warn when useMemo wraps trivial primitives or simple object literals with cheap construction.",
          url: `${docsUrlBase}/no-trivial-use-memo`,
        },
        schema: [],
      },
      create(context) {
        function isTrivial(expr) {
          if (!expr) return false;
          switch (expr.type) {
            case "Literal":
              return true;
            case "ArrayExpression":
              return (
                expr.elements.length <= 3 &&
                expr.elements.every((e) => e && e.type === "Literal")
              );
            case "ObjectExpression":
              return (
                expr.properties.length <= 3 &&
                expr.properties.every((p) => {
                  if (p.type !== "Property") return false;
                  const v = p.value;
                  return v.type === "Literal";
                })
              );
            default:
              return false;
          }
        }

        return {
          CallExpression(node) {
            const callee = node.callee;
            if (callee.type !== "Identifier" || callee.name !== "useMemo") return;
            const [factory] = node.arguments;
            if (!factory || factory.type !== "ArrowFunctionExpression") return;

            if (isTrivial(factory.body)) {
              context.report({
                node,
                message:
                  "Avoid useMemo for trivial values; over-rendering leaf components is usually fine.",
              });
            }
          },
        };
      },
    },
  },
};