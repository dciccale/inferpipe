# inferpipe Pricing Strategy

## Strategic Pricing Philosophy

### Core Principles

- **Value-Based Pricing:** Align costs with business outcomes and AI workflow ROI
- **Transparent Infrastructure:** Clear breakdown of inferpipe platform vs execution costs
- **Competitive Positioning:** Premium to Zapier, competitive with enterprise workflow solutions
- **Growth-Friendly:** Reasonable entry point with natural expansion paths

### Hybrid Infrastructure Pricing Model

**Two-Layer Cost Structure:**

1. **inferpipe Platform Fee:** For visual builder, management, and API access
2. **Execution Costs:** Transparent pass-through of Inngest + LLM provider costs

This reflects our hybrid architecture where inferpipe provides the business layer while Inngest handles execution infrastructure.

---

## Pricing Tiers

### Starter Plan: $49/month
*Perfect for teams getting started with AI workflows*

**Platform Features:**
- Visual workflow builder access
- Up to 10 workflows
- Basic templates library
- Community support
- Standard SLA (99.5% uptime)

**Execution Allowances:**
- 5,000 workflow runs/month included
- $0.05 per additional run
- Basic models priority (GPT-3.5, Claude Haiku)

**Use Cases:**
- Small teams testing AI workflows
- Simple content generation
- Basic document processing
- Customer service automation

---

### Professional Plan: $149/month
*For growing businesses scaling AI operations*

**Platform Features:**
- All Starter features
- Up to 50 workflows
- Advanced workflow templates
- Priority support (24h response)
- Enhanced SLA (99.9% uptime)
- Custom webhook endpoints
- Basic analytics and monitoring

**Execution Allowances:**
- 25,000 workflow runs/month included
- $0.04 per additional run
- All model access (GPT-4, Claude Sonnet/Opus)
- Advanced retry and error handling

**Additional Features:**
- Team collaboration (up to 10 users)
- Workflow versioning and rollback
- Custom integrations

**Use Cases:**
- Mid-market SaaS companies
- E-commerce content automation
- Marketing campaign optimization
- Customer data processing

---

### Business Plan: $399/month
*For enterprises requiring advanced features and support*

**Platform Features:**
- All Professional features
- Unlimited workflows
- Enterprise templates
- Dedicated customer success manager
- Premium SLA (99.95% uptime)
- Advanced analytics and insights
- Custom branding options

**Execution Allowances:**
- 100,000 workflow runs/month included
- $0.03 per additional run
- Priority model access and rate limits
- Advanced monitoring and alerting

**Enterprise Features:**
- SSO integration (SAML, OIDC)
- Advanced RBAC and audit logs
- API rate limit increases
- Webhook security enhancements
- Team collaboration (up to 50 users)

**Use Cases:**
- Large enterprises
- High-volume content operations
- Complex multi-step workflows
- Compliance-sensitive industries

---

### Enterprise Plan: Custom Pricing
*For organizations with specific requirements*

**Platform Features:**
- All Business features
- Custom feature development
- On-premise deployment options
- Dedicated infrastructure
- White-label options
- Enterprise-grade SLA (99.99% uptime)

**Execution Benefits:**
- Volume discounts on execution costs
- Dedicated Inngest infrastructure
- Custom rate limits and priority queues
- Advanced monitoring and observability

**Enterprise Services:**
- Custom onboarding and training
- Integration consulting
- Compliance certifications (SOC2, HIPAA)
- Unlimited users and workflows
- 24/7 phone support

**Requirements for Custom Pricing:**
- 500,000+ monthly workflow runs
- Specific compliance requirements
- Custom integration needs
- Dedicated infrastructure requirements

---

## Execution Cost Structure

### Transparent Infrastructure Pricing

**Inngest Execution Costs (Pass-through + 20% markup):**
- Simple workflows: ~$0.005 per run
- Complex workflows: ~$0.02 per run
- Long-running workflows: ~$0.05 per run

**LLM Provider Costs (Pass-through + 30% markup):**
- GPT-3.5 Turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.06 per 1K tokens
- Claude Haiku: ~$0.0008 per 1K tokens
- Claude Sonnet: ~$0.018 per 1K tokens

### Cost Optimization Features

**Automatic Cost Management:**
- Model fallback on rate limits (GPT-4 → GPT-3.5)
- Intelligent retry with exponential backoff
- Token usage optimization and caching
- Real-time cost tracking and alerts

**Per-Workflow Budget Controls:**
- Set maximum cost per workflow run
- Automatic workflow pausing on budget exceeded
- Daily/monthly spending limits
- Cost allocation by team/project

---

## Competitive Pricing Analysis

### Market Positioning

| Platform      | Entry Price | Enterprise Price | Target Market           |
|:------------- |:----------- |:---------------- |:----------------------- |
| **Zapier**    | $20/month   | $599/month       | Simple automation       |
| **n8n Cloud** | $20/month   | $500/month       | Technical workflows     |
| **Bubble**    | $29/month   | $529/month       | App development         |
| **Retool**    | $10/month   | $50/user/month   | Internal tools          |
| **Inngest**   | $75/month   | Custom pricing   | Function orchestration  |
| **inferpipe** | $49/month   | $399/month       | AI workflow orchestration |

### Inngest Pricing Details

**Inngest Core Plans:**
- **Hobby Plan:** Free (100K executions/month, 25 concurrent steps, up to 3 users)
- **Pro Plan:** $75/month (1M+ executions, 100+ concurrent steps, 15+ users)
- **Enterprise Plan:** Custom pricing (unlimited executions, 500-50K concurrent steps)

**Usage-Based Pricing:**
- First 100K executions/month are free
- Additional executions charged per use with volume discounts
- Event ingestion: 1-5M events/day free, then usage-based pricing

**Positioning Notes:**
- Inngest focuses on developer infrastructure and function orchestration
- Requires technical implementation and code-based workflow definitions
- Lower entry price but lacks business-friendly visual interface
- Primary value is robust execution infrastructure, not AI-specific features

### Value Justification

**Premium Pricing Rationale:**
- **Specialized AI Capabilities:** Purpose-built for LLM workflows
- **Enterprise Infrastructure:** Powered by Inngest's robust execution
- **Developer + Business Friendly:** Serves both technical and non-technical users
- **Cost Transparency:** Clear breakdown of platform vs execution costs
- **Business-Layer Abstraction:** Visual interface vs Inngest's code-first approach

**ROI for Customers:**
- **Time Savings:** 10x faster than custom development
- **Cost Efficiency:** Shared infrastructure vs dedicated engineering
- **Reliability:** Enterprise-grade execution without infrastructure complexity
- **Scalability:** Pay-as-you-grow model aligns with business value

---

## Free Tier Strategy

### Developer-Friendly Onboarding

**Free Plan: $0/month**
*Perfect for developers and small teams to test inferpipe*

**Limitations:**
- 3 workflows maximum
- 1,000 workflow runs/month
- Basic models only (GPT-3.5, Claude Haiku)
- Community support only
- Standard SLA (99% uptime)

**Strategic Purpose:**
- **Product-Led Growth:** Low friction trial experience
- **Developer Adoption:** Technical users can evaluate integration
- **Template Testing:** Users can try pre-built workflow templates
- **Network Effects:** Encourages sharing and community growth

**Conversion Strategy:**
- **Usage-Based Upgrade Prompts:** Hit workflow or run limits
- **Feature Unlocks:** Advanced models and integrations in paid tiers
- **Success Metrics:** Track workflow completion rates and user engagement

---

## Usage-Based Pricing Details

### Per-Execution Breakdown

**What Counts as One Execution:**
- Single workflow run from start to completion
- Includes all steps within the workflow
- Retries and partial failures count as separate executions
- Streaming responses count as single execution

**Cost Transparency Dashboard:**
- Real-time cost tracking per workflow
- Monthly usage summaries and projections
- Cost allocation by team/project
- Detailed execution logs and performance metrics

### Volume Discounts

**High-Volume Pricing Tiers:**

| Monthly Executions | Cost per Execution | Discount |
|:------------------ |:------------------ |:-------- |
| 0 - 100,000       | Standard pricing   | -        |
| 100,001 - 500,000 | 15% discount       | $0.034   |
| 500,001 - 1M      | 25% discount       | $0.030   |
| 1M+                | Custom pricing     | 35%+     |

---

## Payment and Billing

### Billing Structure

**Monthly Platform Fee:**
- Charged on the 1st of each month
- Includes base workflow allowances
- Immediate access to plan features

**Usage-Based Charges:**
- Billed monthly in arrears
- Based on actual execution counts
- Transparent cost breakdown provided

### Payment Methods

**Accepted Payments:**
- Credit cards (Visa, MasterCard, AmEx)
- ACH transfers (Business and Enterprise)
- Wire transfers (Enterprise only)
- Purchase orders (Enterprise with 30-day terms)

### Enterprise Invoicing

**Custom Billing Options:**
- Annual prepayment discounts (10-15%)
- Quarterly billing cycles
- Custom payment terms
- Multi-year agreements with price protection

---

## Pricing Page Messaging

### Value Proposition Hierarchy

**Primary Message:**
"Start building AI workflows in minutes. Scale with enterprise-grade execution."

**Secondary Messages:**
- **For Business Users:** "No code required - drag, drop, deploy"
- **For Developers:** "Enterprise infrastructure without the complexity"
- **For Enterprises:** "Scalable AI orchestration with transparent pricing"

### Common Objections & Responses

**"This is more expensive than Zapier"**
→ "inferpipe is purpose-built for AI workflows with enterprise execution. Compare the cost of building custom AI infrastructure vs our transparent pricing."

**"Why not just use Inngest directly?"**
→ "inferpipe provides the business-friendly interface and AI-specific optimizations. Same as choosing Retool over building React components from scratch."

**"What about usage spikes?"**
→ "Built-in cost controls, automatic scaling, and transparent pricing. You're only charged for what you actually use."

---

## Financial Projections

### Revenue Model

**Year 1 Targets:**
- **Month 3:** 50 Free, 10 Starter, 3 Professional = $1,500 MRR
- **Month 6:** 200 Free, 30 Starter, 15 Professional, 2 Business = $5,700 MRR
- **Month 12:** 1000 Free, 80 Starter, 40 Professional, 8 Business = $18,000 MRR

**Unit Economics:**
- **Average Revenue Per User (ARPU):** $180/month
- **Customer Acquisition Cost (CAC):** $75
- **Lifetime Value (LTV):** $4,320 (24 months × $180)
- **LTV/CAC Ratio:** 57:1
- **Gross Margin:** 78% (after infrastructure and execution costs)

### Pricing Optimization Strategy

**Continuous Testing:**
- A/B testing on pricing page
- Feature packaging experiments
- Free trial length optimization
- Conversion rate tracking by plan

**Market Feedback Integration:**
- Customer interview insights
- Competitive response monitoring
- Price sensitivity analysis
- Feature value quantification

---

## Implementation Timeline

### Launch Strategy

**Phase 1: MVP Launch (Month 1-2)**
- Free tier + Starter plan only
- Basic execution cost pass-through
- Simple billing integration

**Phase 2: Scale Plans (Month 3-4)**
- Professional and Business tiers
- Advanced usage tracking
- Volume discount implementation

**Phase 3: Enterprise Motion (Month 6+)**
- Custom Enterprise plans
- Advanced billing features
- Multi-year contract support

### Success Metrics

**Pricing KPIs:**
- **Conversion Rate:** Free → Paid (target: 15%)
- **Plan Upgrade Rate:** Starter → Professional (target: 25%)
- **Revenue Per Customer:** Monthly tracking vs targets
- **Churn Rate:** <5% monthly for paid plans

---

_This pricing strategy positions inferpipe as a premium, value-driven platform that transparently aligns costs with customer success while leveraging our hybrid Convex + Inngest architecture for optimal pricing flexibility._
