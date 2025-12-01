// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unusedImports from "eslint-plugin-unused-imports";
import filenamesSimple from "eslint-plugin-filenames-simple";

// Local custom rules plugin
import localRules from "./eslint-plugin-local-rules/index.js";

const reactEventProps = [
  "onClick",
  "onChange",
  "onSubmit",
  "onKeyDown",
  "onKeyUp",
  "onKeyPress",
  "onMouseDown",
  "onMouseUp",
  "onFocus",
  "onBlur",
];

export default [
  // Ignore build artifacts
  { ignores: ["dist"] },

  // Apply TS recommended base first to establish parser and TS-aware rules
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      "unused-imports": unusedImports,
      "filenames-simple": filenamesSimple,
      "local-rules": localRules,
    },
    rules: {
      "eol-last": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Bring in JS recommended (TS rules take precedence where overlapping)
      ...js.configs.recommended.rules,

      // React Hooks recommended latest
      ...reactHooks.configs["recommended-latest"].rules,

      // React Fast Refresh for Vite
      ...reactRefresh.configs.vite.rules,

      // Accessibility: discourage click handlers on non-interactive elements
      "jsx-a11y/no-noninteractive-element-interactions": [
        "error",
        { handlers: ["onClick", "onKeyDown", "onKeyUp", "onKeyPress"] },
      ],
      "jsx-a11y/no-static-element-interactions": [
        "error",
        { handlers: ["onClick"] },
      ],
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      // Extra guardrails
      "jsx-a11y/no-noninteractive-tabindex": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",

      // We allow inline arrow handlers for colocation and clarity
      "react/jsx-no-bind": "off",

      // Hygiene
      "unused-imports/no-unused-imports": "warn",
      "no-unused-vars": "off", // disable base in favor of TS variant
      "filenames-simple/naming-convention": [
        "warn",
        { rule: "kebab-case", allowLeadingUnderscore: false, allowSingleWord: true },
      ],

      // Custom rules encoding the “red flags” guidance:

      // 1) Discourage generic named handlers; prefer inline or descriptive names
      "local-rules/no-generic-event-handlers": [
        "warn",
        {
          bannedPatterns: [
            "^handle[A-Z].*$",
            "^[a-z]*Handler$",
            "^on[A-Z].*Handler$",
          ],
          allowlistPatterns: [
            "^(open|close|toggle|submit|save|load|fetch|track|start|stop|focus|blur)[A-Z].*$",
          ],
          reactEventProps,
        },
      ],

      // Prefer inline when a handler is referenced only once
      "local-rules/prefer-inline-single-use-handlers": [
        "warn",
        {
          reactEventProps,
          ignoreIfHandlerUsedMultipleTimes: true,
        },
      ],

      // 2) Memoization guidance
      "local-rules/no-bare-use-memo-callback": [
        "warn",
        {
          hooks: ["useMemo", "useCallback"],
          requireJustificationComment: true,
          commentPattern: "@perf|@expensive|@stable-props",
        },
      ],
      "local-rules/no-trivial-use-memo": "warn",
    },
  },

  // Optionally relax memo rules in tests
  {
    files: ["**/*.test.*", "**/*.spec.*"],
    rules: {
      "local-rules/no-bare-use-memo-callback": "off",
      "local-rules/no-trivial-use-memo": "off",
    },
  },
];