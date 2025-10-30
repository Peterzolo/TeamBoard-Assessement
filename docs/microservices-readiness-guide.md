# Microservices Readiness Guide

## Purpose
This document explains how the current refactor enables splitting the monolith into independent microservices and the exact steps to execute the migration with minimal changes.

## What Makes The Codebase Microservice-Ready

- Clear domain modules: `Auth`, `Users`, `Notifications` are self-contained.
- Interface-based integration: Cross-domain calls go through `IUserLookupService` (in `src/core/interfaces/`).
- No circular dependencies: One-way dependencies via interfaces only.
- Core as infrastructure: Shared utilities (email, templates, base repo/service) live in `CoreModule`, not in feature modules.
- No cross-module DB access: Each module uses its own models; Notifications no longer queries Users collections directly.

## Current Dependency Graph

```
AppModule
├─ UsersModule (exports 'IUserLookupService')
├─ AuthModule (depends on IUserLookupService)
└─ NotificationsModule (depends on IUserLookupService)

CoreModule (infrastructure) is used by all of the above.
```

## Key Abstraction: IUserLookupService

- Location: `src/core/interfaces/user-lookup.interface.ts`
- Monolith implementation: `UserLookupService` in Users module delegates to `UsersService`.
- Microservices implementation: Replace with an HTTP/gRPC client (e.g., `UserApiClient`) implementing the same interface.
- Result: Auth/Notifications continue to compile unchanged; only the provider binding changes.

## How Each Domain Stands Alone

- Users service
  - Owns user schemas, repositories, and business logic.
  - Sends its own emails via `EmailService` from Core.
  - Exports `IUserLookupService` implementation.

- Auth service
  - Uses `IUserLookupService` to read user data (login, verify, reset flows).
  - Maintains its own `JwtModule` and guards. No dependency on Users internals.

- Notifications service
  - Validates recipients via `IUserLookupService` (no Users DB access).
  - Uses its own schemas and WebSocket gateway. Emails via Core.

## Migration Plan: Monolith → Microservices

1) Extract Users service
- Create a new repo/service for Users.
- Move Users module code (entities, repo, service, controller, DTOs).
- Expose HTTP endpoints: get user by id/email, login lookup, update tokens, etc.
- Keep DB connection local to Users service.

2) Replace interface implementation in dependents
- In Auth and Notifications, replace `UserLookupService` provider with `UserApiClient` implementing `IUserLookupService` using HTTP.
- Keep the interface token `'IUserLookupService'` the same to avoid code changes.

3) Share Core pieces
- Option A: Publish a small shared package with interfaces and email templates.
- Option B: Copy minimal `core` pieces needed (interfaces, templates, EmailService) into each service.

4) Environment & configuration per service
- Each service has its own `.env` and configuration (DB URI, JWT secret, MAIL provider settings).
- Assign unique ports: Users (e.g., 3001), Auth (3002), Notifications (3003).

5) Database-per-service
- Users: owns its MongoDB database (e.g., `users_db`).
- Auth & Notifications: no direct access to Users DB; they query via HTTP interface.

6) Security & observability
- Configure CORS per service.
- Add request logging and health endpoints.
- Define service-to-service auth (e.g., service tokens) for internal calls.

## Minimal Code Changes Required

- Create `UserApiClient` (implements `IUserLookupService`) with methods:
  - `findUserForLogin(email)`, `findUserWithEmailVerificationToken(email)`,
  - `findUserById(id)`, `findUserByIdWithResetToken(id)`, `findUserByEmail(email)`,
  - `updateEmailVerificationToken(email, token)`, `getCurrentUser(id)`,
  - `findUsersByRole(roles)`, `getUserEmailById(id)`.
- Register it in providers:
```ts
// In Auth/Notifications modules (microservice mode)
{
  provide: 'IUserLookupService',
  useClass: UserApiClient,
}
```

## Cutover Strategy

- Phase 1: Dual-mode toggle via env (MONOLITH=true uses in-process `UserLookupService`; false uses `UserApiClient`).
- Phase 2: Deploy Users service; point Auth/Notifications to its base URL.
- Phase 3: Remove monolith implementation from dependents after stabilization.

## Readiness Checklist

- Interfaces isolated in `core/interfaces`.
- No feature-to-feature concrete imports.
- Users exports `'IUserLookupService'` binding.
- Auth/Notifications consume `'IUserLookupService'` only.
- Email templates centralized under `core/templates/email`.
- No direct Users DB access from other modules.

## Appendix: Example Provider Bindings

```ts
// Monolith (current)
providers: [
  UserLookupService,
  { provide: 'IUserLookupService', useExisting: UserLookupService },
]

// Microservices (future)
providers: [
  UserApiClient,
  { provide: 'IUserLookupService', useClass: UserApiClient },
]
```
