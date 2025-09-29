## Inferpipe Dashboard Authentication

### Overview

The Inferpipe dashboard uses Clerk for user authentication and Convex for the backend. This provides a complete authentication solution with user management, organizations, and secure API access.

### Technology Stack

- **Frontend Authentication**: Clerk Next.js SDK (@clerk/nextjs)
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
npm install @clerk/nextjs convex
```

Set up providers in `app/layout.tsx`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk
        client={new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)}
        useAuth={useAuth}
      >
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
```

## Multi-Zone Deployment Configuration

### After Sign-Out Redirect
In multi-zone setups (e.g., marketing site at root domain, app at /app subpath), configure the `afterSignOutUrl` on ClerkProvider or globally in Clerk dashboard to redirect to the marketing site. This avoids using the deprecated prop on UserButton components.

For development:
```tsx
// In app/layout.tsx, on ClerkProvider:
<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} afterSignOutUrl="http://localhost:3000">
```

For production, use an environment variable:
```tsx
// In app/layout.tsx:
const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || '/';
<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} afterSignOutUrl={marketingUrl}>
```

Set `NEXT_PUBLIC_MARKETING_URL=https://yourdomain.com` in your environment.

### Complete ClerkProvider Configuration for Multi-Zone

To handle sign-in/sign-up fallbacks and allow cross-origin redirects (e.g., from app at /app to marketing root), add these props:

```tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  afterSignOutUrl={marketingUrl}
  signInUrl="/sign-in"
  signUpUrl="/sign-up"
  signInFallbackRedirectUrl="/app"
  signUpFallbackRedirectUrl="/app"
  allowedRedirectOrigins={['http://localhost:3000']}  // Add production domain in prod
>
```

- `allowedRedirectOrigins`: Whitelists the marketing site for safe redirects (prevents 404/loop in local multi-port dev).
- `signInUrl`/`signUpUrl`: Paths for auth screens in the app.
- `signInFallbackRedirectUrl`/`signUpFallbackRedirectUrl`: Where to go after auth (dashboard root).

### Theming Clerk Components

To make Clerk components (SignIn, UserButton, etc.) match your app's light/dark theme and shadcn/ui styling, use the `shadcn` theme from `@clerk/themes`. This automatically adapts to the ThemeProvider's mode.

1. **Install the package**:
   ```bash
   npm install @clerk/themes
   ```

2. **Import the CSS** in `app/globals.css` (after Tailwind import):
   ```css
   @import "tailwindcss";
   @import '@clerk/themes/shadcn.css';
   ```

3. **Apply to ClerkProvider** in `app/layout.tsx`:
   ```tsx
   import { shadcn } from '@clerk/themes';
   
   <ClerkProvider
     // ... other props
     appearance={{
       baseTheme: shadcn,
     }}
   >
   ```

This ensures seamless integration with your Tailwind v4 and shadcn/ui setup. For custom variables (e.g., primary color), add to `appearance.variables` (see [Clerk Themes docs](https://clerk.com/docs/guides/customizing-clerk/appearance-prop/themes)).

### Note on Current Implementation
The current code uses a plain `ConvexProvider` without Clerk integration. To enable authenticated Convex queries/mutations, update to `ConvexProviderWithClerk` as shown above and install `convex/react-clerk`. Also ensure the backend has `auth.config.ts` configured.

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
