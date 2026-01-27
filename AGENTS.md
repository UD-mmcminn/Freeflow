# Flowise AGENTS Notes

## Context
- The former `enterprise` namespace has been renamed to `iam` across the server/UI. Imports now point to `packages/server/src/iam`.
- The IAM module is scaffolded with **stubs** only: empty routes, services, controllers, entities, migrations, RBAC, and auth middleware. These exist to keep the project building; real logic is still required.
- Licensing checks were removed from `IdentityManager`; platform is driven by `PLATFORM_TYPE` env (`cloud`, `open_source`/`open-source`, default `iam`).

## Key stubs and behaviors
- `iam/middleware/passport.ts`: injects a stub `LoggedInUser` (generated UUID, admin flags, default org/workspace IDs from `DEFAULT_*` envs). `verifyToken*` functions are permissive.
- `iam/rbac/Permissions.ts` and `iam/rbac/PermissionCheck.ts`: allow-all placeholders.
- `iam/utils/*`: `ControllerServiceUtils` returns simple workspace filters; `encryption.util` wraps bcrypt; `validation.util` returns `false` for `isInvalidPassword`.
- Entities under `iam/database/entities/*.ts`: placeholder classes with optional fields; migrations under `iam/database/migrations/*` export empty classes matching expected names.
- SSO providers (`iam/sso/*`): no-op classes with static URIs only.
- Routes (`iam/routes/*.route.ts`): empty routers to satisfy imports.
- Services: minimal/no-op methods (e.g., `WorkspaceService.getSharedItemsForWorkspace` returns `[]`; `WorkspaceUserService.readWorkspaceUserByUserId` returns `[]`; `LoginMethodService` returns empty lists).

## Platform notes
- `IdentityManager` sets platform via `PLATFORM_TYPE`; IAM mode enables all `IAM_FEATURE_FLAGS`; Cloud mode expects Stripe for features/quotas; Open Source skips extras.
- License key/public.pem handling was removed; no `iam/license/public.pem` in repo.

## Next implementation steps
- Replace stub auth/RBAC with real JWT/session handling and permission checks.
- Implement IAM entities/migrations/services/controllers/routes with actual database logic.
- Wire SSO providers, login methods, org/workspace models, and feature gating.
- Remove stubbed fallback user in passport once real auth is in place.***

## Database transaction rule
- All database reads/writes that involve more than one operation (and ideally even single operations) must run inside a transaction.
- If a database type cannot support this requirement, noop those code paths for now; SQLite is the exception for local deployments.
