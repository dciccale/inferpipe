## Workflow and Tools Model

### Concept: Prompts-as-Tools

- Each node encapsulates a capability with an explicit input/output schema
- A "tool" can be purely declarative (prompt + model) or imperative (code sandbox)
- Users interact as prompts and variables; code is generated/managed internally when needed

### Node Types (MVP)

- LLM Call Node
  - Inputs: prompt template, variables, model, sampling params
  - Output: text (and optional JSON/object if schema-guided)
- Transform Node
  - Inputs: expression/template
  - Output: transformed value(s)
- Branch Node
  - Inputs: condition expression referencing variables
  - Output: route selection

### Schemas

- Inputs/outputs defined via JSON Schema
- System validates compatibility between connected nodes
- Enables auto-generated forms and runtime validation

### Code Generation & Execution

- For Transform nodes and advanced tools, compile to a restricted JS function
- Execute in sandboxed environment with time/memory limits
- Deterministic runtime (no network) for safety; LLM calls only in LLM nodes

### Storage & Versioning

- Store tool (node) definitions alongside workflow version
- Immutable versions; publish version to generate stable API endpoint
- Draft edits create a new version; runs reference exact version id

### Testing & Debugging

- Inline test runner per node with sample inputs
- Record/replay runs; snapshot inputs/outputs per step
- Redact secrets; capture token usage and latency

### Visibility & Editing

- Users edit via builder UI; no raw code surface in MVP
- Later, enable advanced mode to view compiled tool code for inspection

### Safety & Governance

- Static checks for prompt injections (e.g., variable substitution only)
- Quotas and rate limits per workspace, per model
- Policy rules: blocklist/allowlist models by workspace tier
