# Understanding the Core Folder - Complete Guide

## 🎯 Main Function: **Shared Infrastructure Foundation**

The `core` folder is your application's **foundation layer**. Think of it like the foundation of a house - everything else (your feature modules) builds on top of it.

### What It Contains:

```
src/core/
├── services/          # Reusable services (Email, Cloudinary, PDF, etc.)
├── repositories/      # Base repository with common database operations
├── templates/         # Shared email templates
├── interfaces/        # Shared interfaces/contracts
├── entities/          # Shared database entities (like SequenceCounter)
├── controllers/       # Base controllers and health checks
├── filters/           # Exception filters
├── config/            # Shared configuration
└── core.module.ts     # Exports all core services
```

## 💡 Why It's Called "Core"?

**"Core" means the central, essential foundation**. It's called "core" because:

1. **Everything depends on it** - Like the core of an apple, it's at the center
2. **It provides essentials** - Contains fundamental services everyone needs
3. **It has no dependencies on features** - Core doesn't know about Users, Auth, or Notifications
4. **It's reusable** - Every module can use these services without reinventing the wheel

## 🔍 What Goes in Core vs. Modules?

### ✅ **BELONGS in Core** (Shared Infrastructure):

1. **Email Service** (`EmailService`)
   - **Why**: Everyone needs to send emails (Auth, Users, Notifications)
   - **Example**: 
     - Auth sends verification emails
     - Users sends invitation emails  
     - Notifications sends notification emails

2. **Base Repository** (`BaseRepository`)
   - **Why**: All modules need database operations (CRUD)
   - **Example**: UsersRepository, NotificationRepository extend it

3. **Base Service** (`BaseService`)
   - **Why**: Common service operations (create, find, update, delete)
   - **Example**: UsersService, NotificationService extend it

4. **Shared Templates** (`core/templates/email/`)
   - **Why**: Email templates shared across modules
   - **Example**: `auth-templates.ts` - used by both AuthModule and UsersModule

5. **Shared Interfaces** (`core/interfaces/`)
   - **Why**: Contracts that multiple modules need
   - **Example**: `IUserLookupService` - used by AuthModule and NotificationsModule

6. **Infrastructure Services**
   - `CloudinaryService` - Image uploads (could be used by any module)
   - `PdfGenerationService` - PDF generation (used by multiple modules)
   - `SequenceGeneratorService` - Generate unique IDs/sequences
   - `TemplateService` - Template rendering

### ❌ **Does NOT belong in Core** (Feature-Specific):

1. **User-specific logic** → Goes in `modules/users/`
2. **Auth-specific logic** → Goes in `modules/auth/`
3. **Notification-specific logic** → Goes in `modules/notifications/`
4. **Business rules** → Goes in respective modules

## 📊 Dependency Flow Visualization

```
┌─────────────────────────────────────────┐
│         Feature Modules                 │
│  (Users, Auth, Notifications)           │
│  ┌──────┐ ┌──────┐ ┌─────────────┐     │
│  │Users │ │ Auth │ │Notifications│     │
│  └───┬──┘ └───┬──┘ └──────┬──────┘     │
│      │        │           │            │
│      └────────┴───────────┘            │
│              │                         │
│              ▼                         │
└─────────────────────────────────────────┘
              │
              │ depends on
              │
┌─────────────▼───────────────────────────┐
│          CoreModule                     │
│  (Foundation/Infrastructure)            │
│  ┌──────────────────────────────────┐   │
│  │ EmailService                     │   │
│  │ BaseRepository                   │   │
│  │ BaseService                      │   │
│  │ Templates                        │   │
│  │ Interfaces                       │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
              │
              │ NO dependencies
              │ on feature modules
              │
┌─────────────▼───────────────────────────┐
│      External Libraries/Frameworks      │
│  (NestJS, MongoDB, Nodemailer, etc.)    │
└─────────────────────────────────────────┘
```

## 🔄 Real-World Example: How Core Is Used

### Scenario: User Invitation Flow

**1. UsersModule needs to send an email:**

```typescript
// modules/users/services/users.service.ts
import { EmailService } from '../../../core/services/email.service';
import { emailVerificationTemplate } from '../../../core/templates/email/auth-templates';

@Injectable()
export class UsersService {
  constructor(
    private readonly emailService: EmailService, // ← From CoreModule
  ) {}

  async createInvitedUser(dto: InviteUserDto) {
    // ... create user logic
    
    // Use Core's EmailService
    const template = emailVerificationTemplate({ ... });
    await this.emailService.sendEmail(user.email, template);
  }
}
```

**2. AuthModule also needs to send an email:**

```typescript
// modules/auth/services/auth.service.ts
import { EmailService } from '../../../core/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authEmailService: AuthEmailService, // ← Uses Core's EmailService internally
  ) {}
}
```

**Both modules use the SAME `EmailService` from CoreModule** - no duplication! ✅

## 🎓 Key Concepts

### 1. **Dependency Rule**
- ✅ Core can depend on: External libraries (NestJS, Mongoose, etc.)
- ❌ Core CANNOT depend on: Feature modules (Users, Auth, Notifications)
- ✅ Feature modules CAN depend on: CoreModule

### 2. **Reusability**
- Core provides "batteries included" functionality
- Every module can use Core services without reinventing them
- Example: Want to send email? Just inject `EmailService` from CoreModule

### 3. **Single Source of Truth**
- Email templates in one place → easy to update branding
- Base repository in one place → consistent database operations
- Interfaces in one place → clear contracts between modules

## 🤔 Common Questions

### Q: Why not put everything in Core?
**A**: Core should only have **shared, reusable infrastructure**. Feature-specific code belongs in feature modules to maintain separation of concerns.

### Q: Can Core import from modules?
**A**: **NO!** Core is the foundation. If Core imports from modules, you create circular dependencies and lose the clean architecture.

### Q: What if two modules need the same thing?
**A**: Move it to Core! That's exactly what Core is for - shared, reusable code.

## ✅ Summary

**Core = Foundation Infrastructure**
- Contains reusable services, utilities, and shared code
- Everything depends on it, but it depends on nothing (feature-wise)
- Makes your code DRY (Don't Repeat Yourself)
- Enables clean separation of concerns
- Essential for microservices migration (shared infrastructure can become separate services later)

**Think of it like this:**
- **Core** = The tools and infrastructure Hazırlık altyapısı (Turkish for "preparation infrastructure")
- **Modules** = The features that use those tools

Just like a construction site: Core provides the tools (cranes, bulldozers), and modules are the buildings being constructed with those tools!

