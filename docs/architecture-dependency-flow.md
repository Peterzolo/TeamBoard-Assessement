# Architecture & Dependency Flow - How We Avoid Circular Dependencies

## 🎯 Current Dependency Graph (NO Circular Dependencies!)

```
                    ┌─────────────┐
                    │  AppModule  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ UsersModule  │   │  AuthModule  │   │Notifications │
│              │   │              │   │   Module     │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  CoreModule  │
                   │ (Infrastructure)│
                   └──────────────┘
```

## 🔑 Key Design Patterns Used

### 1. **Dependency Inversion Principle (DIP)**
   - High-level modules (Auth) depend on abstractions (interfaces)
   - Low-level modules (Users) implement those abstractions
   - This breaks the circular dependency cycle

### 2. **Interface Segregation**
   - `IUserLookupService` interface defines ONLY what Auth needs
   - Clean separation of concerns
   - Easy to swap implementations (monolith ↔ microservices)

## 📊 Module Dependencies Explained

### **CoreModule** (Foundation Layer)
- **Purpose**: Shared infrastructure services
- **Exports**: `EmailService`, `TemplateService`, etc.
- **Imports**: None from feature modules
- **Dependencies**: None (base layer)

### **UsersModule** (Independent)
```
UsersModule
├── Imports:
│   ├── CoreModule (for EmailService)
│   └── JwtModule (for token generation)
│
├── Provides:
│   ├── UsersService (business logic)
│   ├── UserRepository (data access)
│   ├── UserLookupService (implements IUserLookupService)
│   └── BootstrapService (initialization)
│
└── Exports:
    ├── UsersService
    └── 'IUserLookupService' (interface token)
```
- **No dependency on AuthModule** ✅
- **No dependency on NotificationsModule** ✅
- Can be deployed independently ✅

### **AuthModule** (Depends on Users, but via Interface)
```
AuthModule
├── Imports:
│   ├── UsersModule (to access IUserLookupService)
│   ├── CoreModule (for EmailService)
│   └── JwtModule (for token management)
│
├── Provides:
│   ├── AuthService
│   ├── AuthGuard
│   └── AuthEmailService
│
└── Exports:
    └── AuthGuard, JwtModule
```
- **Depends on UsersModule** via `IUserLookupService` interface
- **NOT a circular dependency** because UsersModule doesn't import AuthModule
- Can be deployed independently (with UsersService as external API) ✅

### **NotificationsModule** (Depends on Users, but via Interface)
```
NotificationsModule
├── Imports:
│   ├── UsersModule (to access IUserLookupService)
│   ├── CoreModule (for EmailService)
│   └── JwtModule
│
└── Provides:
    ├── NotificationService
    └── NotificationGateway
```
- **Depends on UsersModule** via `IUserLookupService` interface
- **NOT a circular dependency** ✅

## 🔍 How Circular Dependencies Were Broken

### ❌ BEFORE (Circular Dependency)
```
AuthModule ──imports──> UsersModule
    ▲                        │
    │                        │
    └──imports (forwardRef)──┘
```
**Problem**: 
- UsersModule needed `AuthEmailService` for sending emails
- AuthModule needed `UsersService` for user lookup
- Required `forwardRef` which is a code smell

### ✅ AFTER (No Circular Dependency)
```
AuthModule ──imports──> UsersModule (via IUserLookupService interface)
    │
    │
    └──uses──> CoreModule (for EmailService)
```
**Solution**:
1. **Moved email templates to CoreModule**: 
   - Templates now in `core/templates/email/auth-templates.ts`
   - Both UsersModule and AuthModule can use them
   
2. **Created IUserLookupService interface**:
   - Defined in `core/interfaces/user-lookup.interface.ts`
   - AuthModule depends on interface, not concrete class
   
3. **UserLookupService implements interface**:
   - Implementation in UsersModule
   - Exported as `'IUserLookupService'` token

## 🔄 Request Flow Examples

### Example 1: User Login Flow
```
1. Client → AuthController.login()
2. AuthController → AuthService.login()
3. AuthService → userLookupService.findUserForLogin(email)
   └─> (Calls IUserLookupService interface)
4. UserLookupService → UsersService.findUserForLogin()
   └─> (Implementation in UsersModule)
5. UsersService → UserRepository
   └─> (Database query)
6. AuthService validates password, generates tokens
7. Returns tokens to client
```
**Flow**: AuthModule → Interface → UsersModule → Database
**No circular dependency** ✅

### Example 2: User Invitation Flow
```
1. Client → UsersController.inviteUser()
2. UsersController → UsersService.createInvitedUser()
3. UsersService:
   ├─> Creates user via UserRepository
   ├─> Generates JWT token (has its own JwtModule)
   └─> Sends email via EmailService (from CoreModule)
       └─> Uses template from core/templates/email/auth-templates.ts
```
**Flow**: UsersModule → CoreModule → Email Service
**No dependency on AuthModule** ✅

### Example 3: Notification Creation Flow
```
1. Client → NotificationsController.createNotification()
2. NotificationsController → NotificationService.createNotification()
3. NotificationService:
   ├─> Validates recipient via userLookupService.findUserById()
   │   └─> (Calls IUserLookupService interface)
   ├─> Creates notification in database
   ├─> Sends WebSocket notification via NotificationGateway
   └─> Sends email via EmailService (from CoreModule)
```
**Flow**: NotificationsModule → Interface → UsersModule → CoreModule
**No circular dependency** ✅

## 🛡️ How We Prevent Future Circular Dependencies

### 1. **Dependency Rules**
   - ✅ Feature modules can import CoreModule
   - ✅ Feature modules can import other feature modules via interfaces
   - ❌ Feature modules CANNOT import other feature modules' services directly
   - ❌ Feature modules CANNOT create circular imports

### 2. **Interface-First Design**
   - When Module A needs something from Module B:
     1. Create interface in `core/interfaces/`
     2. Module B implements and exports the interface
     3. Module A imports Module B and uses the interface
     4. This creates one-way dependency: A → B (no cycle)

### 3. **Shared Code Location**
   - Shared templates → `core/templates/`
   - Shared interfaces → `core/interfaces/`
   - Shared services → `core/services/`
   - No cross-module dependencies for shared code

## 🚀 Microservices Migration Readiness

### Current State (Monolith)
```
UsersModule (implements IUserLookupService)
    ↑
AuthModule (uses IUserLookupService interface)
```

### Future State (Microservices)
```
Users Service (HTTP API)
    ↑
Auth Service (uses UserApiClient implementing IUserLookupService)
```

**Migration Steps**:
1. Replace `UserLookupService` with `UserApiClient`
2. `UserApiClient` makes HTTP calls to Users Service
3. Auth Service code stays the same (uses interface)
4. No circular dependencies possible (services are separate)

## ✅ Verification Checklist

- [x] No `forwardRef` between feature modules
- [x] AuthModule → UsersModule (one-way, via interface)
- [x] NotificationsModule → UsersModule (one-way, via interface)
- [x] UsersModule → CoreModule only (no feature modules)
- [x] All shared templates in CoreModule
- [x] All cross-module communication via interfaces
- [x] Each module can be understood independently

## 📝 Summary

**Why We Won't Have Circular Dependencies**:
1. **Clear dependency hierarchy**: CoreModule (base) ← Feature Modules (consumers)
2. **Interface-based communication**: Modules depend on abstractions, not concrete classes
3. **One-way dependencies**: Auth → Users, Notifications → Users (never reversed)
4. **Shared infrastructure**: Common code lives in CoreModule
5. **Self-contained modules**: Each module has its own dependencies (like JwtModule)

The architecture follows **SOLID principles**, particularly:
- **Dependency Inversion**: Depend on abstractions (interfaces), not concretions
- **Single Responsibility**: Each module has one clear purpose
- **Interface Segregation**: Interfaces define only what's needed

