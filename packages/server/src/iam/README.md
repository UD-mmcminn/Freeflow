# IAM Module Scaffold

This folder was scaffolded empty to replace the old `enterprise` namespace. File names and layout come only from open-source references already present in this repository:

- `packages/server/src/IdentityManager.ts` imports IAM interfaces, middleware, RBAC, services, SSO providers,
- `packages/server/src/routes/index.ts` and other route files import IAM route modules (auth, audit, user, organization, role, workspace, workspace-user, account, login-method), so matching stubs were created.
- `packages/server/src/services/*` and controllers import IAM services and utilities (`ControllerServiceUtils`, `encryption.util`, `validation.util`), so those filenames are present.
- `packages/server/src/database/entities/index.ts` imports IAM entities (including `IamEntities`), and migration index files enumerate the IAM migration filenames for mysql, mariadb, postgres, and sqlite; those filenames are stubbed here.
- `packages/server/gulpfile.ts` copies `src/iam/emails/*.hbs`, so the `emails` directory exists with a placeholder file.

No non-permissive or external sources were used—only import paths and filenames visible in the open-source codebase guided this scaffold. All files here are currently empty placeholders ready to be implemented.

## Implementation plan (initial)

- Define shared interfaces first (done): `Interface.Iam.ts` now exports `LoggedInUser`, `FeatureFlags`, `JwtPayload`, and `ErrorMessage` for server consumers.
- Next steps: flesh out RBAC (`Permissions`, `PermissionCheck`), auth middleware (`middleware/passport/`), SSO providers, services, routes, and database entities/migrations under `database/`.
- As pieces are implemented, keep types narrow where possible; today most fields in `LoggedInUser` are optional to keep the build unblocked while functionality is filled in.
