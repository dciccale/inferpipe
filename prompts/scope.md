## Product Scope and Positioning

### Core Thesis

- **Visual AI workflow builder** that sits on top of enterprise execution infrastructure
- **Business-friendly interface** for AI orchestration, powered by developer-grade infrastructure (Inngest)
- **Complementary positioning:** We enable business users to leverage enterprise workflow orchestration without code

### In-Scope (inferpipe UI Layer)

**Visual Workflow Management:**
- Drag-and-drop AI workflow builder
- Visual prompt/variable management and templating
- Real-time workflow monitoring and progress tracking
- Usage analytics and cost tracking dashboard

**Business-Friendly Features:**
- No-code interface for AI workflow creation
- Template library and sharing capabilities
- Team collaboration and workspace management
- Transparent cost tracking and budget controls

**Developer Integration:**
- REST API endpoints for each workflow
- Backend SDK for server-side integration
- Webhook delivery for completed workflows
- API key management and authentication

### Out-of-Scope (Deferred to Infrastructure Layer)

**Execution Infrastructure (Handled by Inngest):**
- Workflow orchestration and step execution
- Long-running job processing and state management
- Retry logic and error handling mechanisms
- Scaling and infrastructure management

**Side Effects (Deferred to Customers):**
- Native integrations (email, CRM, social media posting)
- File storage and document management
- Database write operations
- External API calls beyond LLM providers

### Integration Strategy

**API-First Approach:**
- Clean REST endpoints for each workflow
- Standardized request/response formats
- Comprehensive API documentation and SDKs

**Ecosystem Integration:**
- Compatible with n8n, Zapier, Make via HTTP calls
- Webhook delivery for downstream automation
- Backend SDK for server-side application integration

**Customer Implementation:**
- Customers handle side-effects in their existing stack
- inferpipe provides the AI orchestration layer
- Clear separation of concerns between AI processing and business logic

### Market Differentiation

**vs Traditional Automation (Zapier, n8n):**
- **inferpipe:** AI-native workflow primitives and LLM optimization
- **Traditional:** Generic automation with basic AI bolt-ons

**vs Developer Infrastructure (Inngest, Temporal):**
- **inferpipe:** Visual, business-friendly interface for AI workflows
- **Developer Tools:** Code-first approach requiring technical expertise

**vs AI Development Platforms (LangChain, LlamaIndex):**
- **inferpipe:** Production-ready workflows with no-code interface
- **AI Dev Platforms:** Development frameworks requiring custom implementation

**Unique Value Proposition:**
- Only platform combining visual AI workflow building with enterprise-grade execution
- Business accessibility meets developer reliability
- AI-specific optimizations (cost caps, model fallbacks, token tracking)

### Roadmap Considerations

- Optional side-effect nodes later as thin HTTP hooks or serverless functions
- Template marketplace for common LLM workflows
- More advanced control flow (loops, parallel branches) after MVP
