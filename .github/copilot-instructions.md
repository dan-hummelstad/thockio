# Copilot Instructions for thock

## Project Overview

This is a **React + TypeScript + Vite** monorepo, structured for modular UI development and rapid prototyping. The codebase is organized around feature directories under `src/`, with a strong emphasis on composable UI components, hooks, and state management.

## Architecture & Major Components

- **UI Components**: Located in [`src/components/ui/`](src/components/ui/), these are built using Radix UI primitives and Tailwind CSS. Components follow a pattern of wrapping Radix primitives and customizing with utility classes via [`cn`](src/lib/utils.ts).
- **Core Logic**: Domain-specific logic is in [`src/core/`](src/core/), split into `entities`, `geom`, and `types` for clear separation.
- **State Management**: Uses [`zustand`](https://github.com/pmndrs/zustand) (see [`src/stores/CameraStore.ts`](src/stores/CameraStore.ts)) for local/global state.
- **Hooks**: Custom React hooks live in [`src/hooks/`](src/hooks/), e.g., [`use-mobile.ts`](src/hooks/use-mobile.ts).
- **Assets & API**: Static assets in [`src/assets/`](src/assets/) and API logic in [`src/api/`](src/api/).

## Developer Workflows

- **Build**: Run `npm run build` or `pnpm build` (see [`package.json`](package.json)). This runs TypeScript (`tsc -b`) and Vite build.
- **Dev Server**: Use `npm run dev` or `pnpm dev` to start Vite on port 5173.
- **Linting**: Run `npm run lint` or `pnpm lint`. ESLint config is in [`eslint.config.js`](eslint.config.js), with type-aware and React-specific rules.
- **Preview**: Use `npm run preview` for production preview.

## Project-Specific Patterns

- **Component Aliasing**: Use path aliases (`@/components`, `@/lib/utils`, etc.) as defined in [`components.json`](components.json) and [`tsconfig.app.json`](tsconfig.app.json).
- **Tailwind CSS**: Utility-first styling, merged with `clsx` via [`cn`](src/lib/utils.ts).
- **Radix UI Integration**: Most UI components wrap Radix primitives for accessibility and composability (see [`src/components/ui/popover.tsx`](src/components/ui/popover.tsx), [`src/components/ui/dropdown-menu.tsx`](src/components/ui/dropdown-menu.tsx)).
- **Icon Library**: Uses Lucide icons (`lucide-react`).
- **No test directory**: There is no explicit test setup or test scripts in the current codebase.

## External Dependencies & Integration

- **Radix UI**: Used extensively for UI primitives.
- **Tailwind CSS**: Configured via plugin in [`vite.config.ts`](vite.config.ts).
- **SWC**: Vite uses `@vitejs/plugin-react-swc` for fast refresh.
- **Other Libraries**: Includes `zustand`, `clsx`, `tailwind-merge`, `recharts`, `sonner`, and more.

## Conventions

- **File Naming**: Use `.tsx` for React components, `.ts` for logic/utilities.
- **Exports**: Prefer named exports for components and utilities.
- **Accessibility**: Components often set ARIA attributes and roles (see [`src/components/ui/breadcrumb.tsx`](src/components/ui/breadcrumb.tsx)).
- **No global styles**: All styling is via Tailwind classes.

## Example Patterns

- **Composable UI**: Components accept `className` and spread props for flexibility.
- **Radix Wrapping**: Example:
  ```tsx
  // src/components/ui/popover.tsx
  function PopoverContent({ className, ...props }) {
    return <PopoverPrimitive.Content className={cn(className)} {...props} />
  }
  ```
- **Utility Function**: Example:
  ```ts
  // src/lib/utils.ts
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  ```

---

**Feedback Request:**  
Please review these instructions. Are any architectural details, workflows, or conventions unclear or missing? Let me know if you need more specifics or examples.