import { plugin as shadcn } from "@shadcn/lint"
import tsParser from "@typescript-eslint/parser"
import { defineConfig } from "eslint/config"

import {
  LINTER_OPTIONS,
  designSystemRules,
  sharedSettings,
} from "./reui-lint.shared.mjs"

// Design-system lint for registry source. Run with `pnpm lint:ds`.
// Kept out of eslint.config.mjs on purpose: this config governs registry source
// only, and its severities ratchet independently of the app's lint gate.
//
// The rule vocabulary lives in reui-lint.shared.mjs, which is the source of
// truth for every authoring surface and is mirrored into this repo by reui.io's
// scripts/sync-oss.mts. This file adds only what is local to this repo: which
// paths it authors, and which non-Tailwind classes are real here. Change a rule
// in the shared file, not here.

const settings = sharedSettings(
  "Design system rules: https://reui.io/docs. Raw Tailwind palette classes are a deliberate ReUI decision, not a defect."
)

// Not Tailwind utilities, so no-unknown-classes must not judge them.
//
// cn-* is deliberately NOT listed. The linter already resolves declared hooks
// from registry/styles/style-*.css, so only a cn-* hook that NO style implements
// is flagged. That is real signal, not noise.
//
// This list stays SHORT on purpose. The remaining no-unknown-classes findings in
// this repo are real defects, not local CSS, so the shared localCssClasses()
// helper is deliberately NOT used here: it would mask them.
const RESERVED = [
  // Per-style variant prefixes, declared @custom-variant in styles/globals.css.
  "style-*",
  // sonner ships its own stylesheet and targets this class (ui/sonner.tsx).
  "toaster",
  // Declared in a component-local <style> block
  // (registry-reui/bases/base/components/dialog/c-dialog-6.tsx:17).
  "transparent-scrollbar",
]

// registry/ is shadcn-owned: read it to resolve components and variants (see
// COMPONENT_IMPORTS in the shared file), never lint it. Findings there are not
// ours to fix. Scope is registry-reui/ only.
const PRIMITIVES = ["registry-reui/bases/*/reui/**/*.tsx"]
const EXAMPLES = ["registry-reui/bases/*/components/**/*.tsx"]

export default defineConfig([
  {
    files: [...PRIMITIVES, ...EXAMPLES],
    linterOptions: LINTER_OPTIONS,
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    plugins: { shadcn },
    settings: { shadcn: settings },
    rules: designSystemRules({
      allowUnknown: RESERVED,
      overrides: {
        // no-restyle is scoped per surface below, so it is off at this level.
        "shadcn/no-restyle": "off",
      },
    }),
  },

  // c-* examples CONSUME the design system, so component ownership applies to them.
  {
    files: EXAMPLES,
    rules: {
      "shadcn/no-restyle": ["warn", { allow: ["layout"] }],
    },
  },

  // Primitives DEFINE the design system. A primitive composing another primitive is
  // a deliberate internal decision, not a consumer restyling a black box. The
  // arbitrary values and inline styles here are system authoring (ring-[3px],
  // calc, cubic-bezier) and computed layout in gantt, data-grid and event-calendar,
  // so all three advisory rules are off and the primitive report stays pure signal.
  {
    files: PRIMITIVES,
    rules: {
      "shadcn/no-restyle": "off",
      "shadcn/no-arbitrary-values": "off",
      "shadcn/no-inline-styles": "off",
    },
  },
])
