## Inferpipe Dashboard Authentication

### Overview

The Inferpipe dashboard uses Clerk for user authentication and Convex for the backend. This provides a complete authentication solution with user management, organizations, and secure API access.

### Technology Stack

- **Frontend Authentication**: Clerk React SDK
- **Backend**: Convex with Clerk JWT validation
- **User Management**: Clerk organizations and user roles
- **Session Management**: Clerk sessions with Convex integration

### Integration Setup

#### 1. Clerk Configuration

- **Identity Provider**: Clerk for authentication, user management, organizations, sessions
- **Features**: Drop-in UI components, OAuth providers, MFA, device management, webhooks
- **JWT Templates**: Configure Convex-specific JWT template in Clerk dashboard

#### 2. Convex Configuration

Create `auth.config.ts` in your Convex project:

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

#### 3. Frontend Integration

Install dependencies:
```bash
npm install @clerk/clerk-react convex
```

Set up providers in `src/main.tsx`:

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
);
```

### User Management

#### Organizations & Workspaces
- **Clerk Organizations**: Map to Inferpipe workspaces
- **Multi-tenancy**: Users can belong to multiple organizations/workspaces
- **Role Management**: Leverage Clerk's organization roles

#### Dashboard Roles
- **Owner**: Full workspace control, billing, user management
- **Admin**: Manage workflows, API keys, users (except billing)
- **Editor**: Create/edit workflows, manage own API keys
- **Viewer**: Read-only access to workflows and runs

### Enterprise Authentication

#### Single Sign-On (SSO)
- **Clerk Enterprise**: SAML SSO, SCIM provisioning
- **Supported Providers**: Active Directory, Okta, Google Workspace, Azure AD
- **Just-in-Time Provisioning**: Automatic user creation on first login
- **Role Mapping**: Map SAML attributes to workspace roles

#### Security Features
- **Multi-Factor Authentication**: Built-in MFA support
- **Session Management**: Secure session handling with configurable timeouts
- **Device Management**: Track and manage user devices
- **Audit Logging**: User sign-ins, role changes, administrative actions

### Environment Variables

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# Convex Configuration
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

### Benefits of This Architecture

- **Seamless Integration**: ClerkProvider + ConvexProviderWithClerk work together out of the box
- **Secure by Default**: JWT validation happens automatically in Convex functions
- **Rich User Management**: Organizations, roles, and permissions handled by Clerk
- **Enterprise Ready**: SSO, SCIM, and compliance features available
- **Developer Experience**: Simple setup with minimal configuration

### Notes

- This authentication system is exclusively for the Inferpipe dashboard
- Workflow API access uses separate API key authentication (see `workflow-auth.md`)
- Clerk handles all user-facing authentication flows
- Convex backend automatically validates user sessions via JWT tokens
