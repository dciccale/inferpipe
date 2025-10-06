## UI and Workflow Builder

### Goals

- Enable non-technical users to design LLM workflows rapidly and safely
- Provide a responsive, accessible, modern UI that scales to complex graphs
- Balance in-house ownership with time-to-market by leveraging proven OSS

### Frontend Stack (MVP)

- Framework: React + Vite + TypeScript (already in repo)
- Styling: Tailwind CSS + CSS variables for theming
- Headless primitives: Radix UI
- Component kit: shadcn/ui (generated on top of Radix)
- Icons: Lucide
- State (client): Zustand for ephemeral UI state; TanStack Query for server state
- Form helpers: React Hook Form + Zod
- Date/time: date-fns

### Workflow Builder

- Recommended library: React Flow (aka @xyflow/react)
  - Pros: mature, great docs, performant, extensible node/edge types, viewport controls
  - Cons: pro features for layout/minimap; auto-layout via Dagre/ELK integration
- Alternatives considered:
  - Rete.js: powerful plugin ecosystem, steeper learning curve for our use case
  - Diagram libs + custom (elkjs/dagre + dnd-kit): more control, longer build time

We will start with React Flow for speed, and evaluate moving specific features in-house only if needed.

> Inspiration: Typebot’s node-based builder demonstrates strong UX patterns for node editing, variable chips, and inline testing. See the Typebot monorepo for reference: [Typebot monorepo](https://github.com/baptisteArno/typebot.io/tree/main).

### Node/Edge Model (MVP)

- Node kinds:
  - LLM Call: prompt + model + inputs → outputs
  - Transform: small JS expression/template transform
  - Branch: conditional routing on variables
  - Input/Output: workflow boundaries
- Edge kinds: default (directed), with optional labels for branches
- Variables: typed name → value, with scoping rules (workflow-level + node outputs)
- Schema shape (stored in backend):
  - workflow: { id, name, version, nodes[], edges[], variables[], permissions }
  - node: { id, type, position, data, ioSchema }
  - edge: { id, source, target, label?, condition? }

### UX Requirements

- Canvas: pan/zoom, grid, snap-to-grid, rubberband selection
- Node editing: drawer/side panel with tabs (Config, IO, Test)
- Variables: chip/mention insert in prompts ({{variable}} or $variable)
- Keyboard: copy/paste/duplicate/delete; undo/redo
- Validation: live highlighting of missing inputs and broken edges
- Testing: run a single node or subgraph with sample inputs (non-persistent)
- Accessibility: focus rings, ARIA labels, color contrast

### Theming

- Light/dark via CSS variables and Tailwind tokens
- Theme object persisted per workspace; preview in builder

### Performance Considerations

- Virtualized view when nodes > ~150
- Debounced persistence (500–1000ms) to backend
- Lazy-load heavy panels (model pickers, history)
- Keep node render pure; memoize node components

### Packages

- @xyflow/react (React Flow)
- zustand, @tanstack/react-query
- radix-ui, shadcn/ui, lucide-react
- zod, react-hook-form
- tailwindcss, autoprefixer, postcss
- dagre/elkjs (optional, for auto-layout later)

### Build vs Reuse: Decision

- Start with React Flow + shadcn/ui to ship quickly
- Revisit custom canvas only if we hit hard limitations
- Adopt UX patterns inspired by Typebot’s builder for familiarity and speed

### Textarea with variables

https://uiwjs.github.io/react-codemirror/

Example of openai using codemirror according to image in ./resources/openai_codemirror1.png and ./resources/openai_codemirror2.png
