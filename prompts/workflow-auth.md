## Authentication Architecture

### Overview

Inferpipe uses two distinct authentication systems:

1. **Dashboard Authentication**: Clerk + Convex for the web application
2. **Service Authentication**: API keys for developers consuming HTTPS endpoints

### Dashboard Authentication (Clerk + Convex)

The Inferpipe dashboard uses Clerk for user authentication and Convex for the backend:

- **Identity Provider**: Clerk for authentication, user management, organizations, sessions
- **Benefits**: Drop-in UI, OAuth providers, MFA, device management, webhooks
- **Backend**: Convex with server-side validation via Clerk JWTs
- **User Management**: Workspaces, roles, permissions within the dashboard

#### Workspaces and Roles
- Workspace entity; users can belong to multiple workspaces
- Roles: Owner, Admin, Editor, Viewer
- Permissions map to actions: create/run workflows, manage API keys, manage secrets

### Service Authentication (API Keys)

Developers consuming Inferpipe's HTTPS endpoints use API key authentication:

- **Service Infrastructure**: Powered by Inngest
- **Authentication Method**: API keys for accessing workflow endpoints
- **Key Format**: `prefix_inferpipe_xxx`; store hashed, display once on creation
- **Security**: Optional IP allowlist (enterprise feature)

#### API Key Scoping & Permissions

When creating an API key in the Inferpipe dashboard, users can configure:

- **Workspace-level access**: Key works for all workflows in the workspace
- **Workflow-specific access**: Key works only for selected workflows
- **Per-workflow permissions**: For each workflow, specify allowed actions:
  - `runs:create` - Can trigger workflow executions
  - `runs:read` - Can query workflow run status and results
  - `runs:cancel` - Can cancel running workflows
  - `webhooks:read` - Can access webhook endpoints for this workflow

#### API Key Creation Flow

1. User navigates to API Keys section in Inferpipe dashboard
2. Clicks "Create API Key"
3. Selects scope:
   - **All Workflows** (workspace-level)
   - **Specific Workflows** (select from list)
4. For each selected workflow, choose permissions
5. Optional: Set IP allowlist restrictions
6. Generate key - display once, then store hashed

### Webhook Security

For webhook endpoints and callbacks:

- **Signature**: HMAC SHA-256 signature in header using workspace webhook secret
- **Replay Protection**: Timestamp validation with tolerance window
- **Verification**: Recipients can verify webhook authenticity

### Enterprise Features

- **IP Allowlisting**: Restrict API key usage to specific IP addresses or CIDR blocks
- **Audit Logging**: Track API key creation, usage, and revocation
- **Rate Limiting**: Per-API key rate limits to prevent abuse

### Data Privacy & Security

- **Secrets Management**: Per-workspace secrets vault with encrypted storage
- **Log Security**: Redact secrets from logs and traces
- **API Key Security**: Hash storage, single display on creation
- **Session Management**: Secure session handling via Clerk/Convex integration
