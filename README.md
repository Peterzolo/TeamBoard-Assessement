# TeamBoard Assessment Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A scalable, maintainable NestJS backend application built with modular architecture, designed for seamless microservices migration.
</p>

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architectural Advantages](#architectural-advantages)
- [Scalability](#scalability)
- [Microservices Readiness](#microservices-readiness)
- [Code Quality & Readability](#code-quality--readability)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## 🎯 Overview

TeamBoard Assessment Backend is a robust, enterprise-grade backend application built with **NestJS** and **TypeScript**. The application follows a **modular architecture pattern** with a clear separation of concerns, making it highly maintainable, testable, and ready for microservices migration.

The application provides a comprehensive API for managing users, authentication, teams, projects, tasks, and notifications, with built-in support for email notifications, file uploads, and real-time WebSocket communications.

## 🏗️ Architecture

### Architectural Pattern: **Modular Layered Architecture with Core Foundation**

The application follows a **three-layer modular architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Auth   │  │  Users  │  │ Teams    │  │ Notifications│  │
│  │ Module  │  │ Module  │  │ Module   │  │   Module     │  │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └──────┬──────┘  │
│       │            │             │                │          │
│       └────────────┴─────────────┴────────────────┘          │
│                        │                                     │
│                        ▼                                     │
│              ┌────────────────────┐                          │
│              │  CoreModule        │                          │
│              │  (Foundation)      │                          │
│              │  - Base Services   │                          │
│              │  - Repositories    │                          │
│              │  - Interfaces      │                          │
│              │  - Templates       │                          │
│              └────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Infrastructure    │
              │  - MongoDB         │
              │  - Redis           │
              │  - External APIs   │
              └────────────────────┘
```

### Core Components

#### 1. **CoreModule (Foundation Layer)**
The foundation of the application, providing shared infrastructure and utilities:

- **Base Repository**: Generic repository pattern with comprehensive CRUD operations, pagination, transactions, and advanced querying
- **Base Service**: Abstract service class providing common business logic patterns
- **Shared Services**: Email service, Cloudinary integration, PDF generation, sequence generation, template rendering
- **Interfaces**: Contract definitions for cross-module communication (e.g., `IUserLookupService`)
- **Templates**: Reusable email templates
- **Filters**: Global exception handling
- **Logging**: Winston-based structured logging

#### 2. **Feature Modules (Business Domain Layer)**
Self-contained modules representing business domains:

- **AuthModule**: Authentication, authorization, JWT token management
- **UsersModule**: User management, profiles, invitations
- **TeamsModule**: Team creation and management
- **ProjectsModule**: Project lifecycle management
- **TasksModule**: Task assignment and tracking
- **NotificationsModule**: Real-time notifications via WebSocket and email

#### 3. **Dependency Flow**
```
Feature Modules → CoreModule → Infrastructure
     ↓                ↓
  Interfaces    (One-way flow, no cycles)
```

**Key Principle**: Feature modules communicate via **interfaces** (contracts) defined in CoreModule, not direct service dependencies. This eliminates circular dependencies and enables clean separation.

## ✨ Key Features

- 🔐 **JWT-based Authentication** with refresh tokens
- 👥 **User Management** with role-based access control
- 📧 **Queue-based Email System** using BullMQ and Redis
- 📁 **File Upload** integration with Cloudinary
- 🔔 **Real-time Notifications** via WebSocket (Socket.IO)
- 📊 **Comprehensive Logging** with Winston
- 🏥 **Health Check** endpoints
- 📝 **API Documentation** with Swagger
- 🔄 **Transaction Support** for data consistency
- 🎯 **Base Repository Pattern** for DRY database operations
- 🧩 **Modular Design** with clear boundaries

## 🛠️ Tech Stack

### Core Framework
- **NestJS** (v11) - Progressive Node.js framework
- **TypeScript** (v4.9.5) - Type-safe development
- **Express** - HTTP server

### Database & Caching
- **MongoDB** with **Mongoose** (v8) - Primary database
- **Redis** with **BullMQ** (v5) - Queue management and caching

### Authentication & Security
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Cookie Parser** - Secure cookie handling

### Communication & Integration
- **Socket.IO** - WebSocket for real-time features
- **Nodemailer** - Email delivery
- **Axios** - HTTP client
- **Cloudinary** - Cloud-based image management

### Development & Quality
- **Jest** - Testing framework
- **ESLint** + **Prettier** - Code quality
- **Swagger** - API documentation
- **Winston** - Logging
- **PM2** - Process management

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Application bootstrap
│   ├── app.module.ts           # Root module
│   │
│   ├── core/                   # Foundation layer (shared infrastructure)
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Base controllers (Health, etc.)
│   │   ├── database/           # Database module
│   │   ├── entities/           # Shared entities (SequenceCounter, etc.)
│   │   ├── filters/            # Exception filters
│   │   ├── interfaces/         # Shared interfaces/contracts
│   │   ├── logger/             # Winston logger configuration
│   │   ├── queue/              # Queue module (BullMQ)
│   │   ├── repositories/       # Base repository pattern
│   │   ├── services/           # Shared services (Email, Cloudinary, PDF, etc.)
│   │   ├── templates/          # Email templates
│   │   └── core.module.ts      # Core module exports
│   │
│   └── modules/                # Feature modules (business domains)
│       ├── auth/               # Authentication & authorization
│       ├── users/              # User management
│       ├── teams/              # Team management
│       ├── projects/           # Project management
│       ├── tasks/              # Task management
│       └── notifications/      # Real-time notifications
│
├── docs/                       # Architecture documentation
├── scripts/                    # Utility scripts
├── test/                       # E2E tests
└── dist/                       # Compiled output

```

Each feature module follows a consistent structure:
```
modules/[feature]/
├── controllers/       # HTTP endpoints
├── services/         # Business logic
├── repositories/     # Data access (extends BaseRepository)
├── entities/         # Mongoose schemas
├── dto/             # Data Transfer Objects
├── presenters/      # Response transformers
└── [feature].module.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (v6+)
- Redis (v6+)
- Yarn or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/teamboard

   # Redis
   REDIS_URL=redis://127.0.0.1:6379

   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRATION=24h

   # Email (choose provider)
   EMAIL_PROVIDER=gmail|mailtrap|resend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-password

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Application
   PORT=5000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000
   ```

4. **Run database migrations** (if any)
   ```bash
   # Check available migration scripts in scripts/ directory
   ```

5. **Start the application**
   ```bash
   # Development
   yarn start:dev

   # Production build
   yarn build
   yarn start:prod
   ```

6. **Access API Documentation**
   - Swagger UI: `http://localhost:5000/api/v1/api-docs` (if configured)

## 🎓 Architectural Advantages

### 1. **Separation of Concerns**
- Each module has a single, well-defined responsibility
- Business logic is isolated from infrastructure concerns
- Clear boundaries between layers prevent coupling

### 2. **Dependency Inversion Principle (DIP)**
- Feature modules depend on **abstractions** (interfaces), not concrete implementations
- CoreModule provides contracts that modules implement
- Easy to swap implementations (e.g., in-memory → HTTP client for microservices)

### 3. **No Circular Dependencies**
- One-way dependency flow: Feature Modules → CoreModule → Infrastructure
- Cross-module communication via interfaces only
- Prevents architectural debt and maintainability issues

### 4. **DRY (Don't Repeat Yourself)**
- Base repository pattern eliminates duplicate CRUD code
- Shared services (Email, PDF, etc.) prevent code duplication
- Templates and utilities are centralized

### 5. **Testability**
- Each module can be tested in isolation
- Interfaces allow easy mocking
- Dependency injection simplifies unit testing

### 6. **Consistency**
- Standardized module structure
- Common patterns enforced through base classes
- Uniform error handling and logging

## 📈 Scalability

### Horizontal Scaling
- **Stateless Architecture**: No server-side sessions; JWT tokens enable horizontal scaling
- **Queue-based Processing**: Email and heavy tasks are queued, allowing multiple worker instances
- **Database Optimization**: Base repository pattern supports indexing, pagination, and query optimization

### Vertical Scaling
- **Memory Management**: Built-in memory monitoring and management services
- **Connection Pooling**: MongoDB and Redis connections are pooled efficiently
- **PM2 Support**: Production-ready process management with multiple instances

### Performance Optimizations
- **Lazy Loading**: Modules load only when needed
- **Lean Queries**: Repository supports lean queries for faster reads
- **Caching Ready**: Redis integration enables easy caching layer addition
- **Pagination**: Built-in pagination in base repository reduces memory footprint

### Database Scalability
- **MongoDB Sharding Ready**: Schema design supports horizontal database scaling
- **Read Replicas**: Repository pattern allows easy read replica configuration
- **Transaction Support**: Built-in transaction support for data consistency at scale

## 🔄 Microservices Readiness

The application is **architecturally prepared** for microservices migration with minimal code changes.

### Current Architecture (Monolith)
```
┌─────────────────────────────────────┐
│         AppModule (Monolith)        │
│  ┌─────────┐  ┌─────────┐          │
│  │  Auth   │  │  Users  │          │
│  │         │  │         │          │
│  └────┬────┘  └────┬────┘          │
│       │            │                │
│       └────────────┘                │
│              │                      │
│              ▼                      │
│       IUserLookupService            │
│         (Interface)                 │
└─────────────────────────────────────┘
```

### Future Architecture (Microservices)
```
┌──────────────┐         ┌──────────────┐
│ Auth Service │────────▶│ Users Service│
│              │  HTTP   │              │
│ (Port 3002)  │  API    │ (Port 3001)  │
└──────────────┘         └──────────────┘
       │                        │
       └────────────────────────┘
                  │
                  ▼
         IUserLookupService
        (Interface Contract)
```

### Migration Strategy

1. **Interface-Based Communication**
   - Current: Modules communicate via `IUserLookupService` interface
   - Future: Replace interface implementation with HTTP/gRPC client
   - **Code Change**: Only provider binding changes, business logic stays the same

2. **Module Independence**
   - Each module is self-contained with its own:
     - Controllers (HTTP endpoints)
     - Services (business logic)
     - Repositories (data access)
     - Entities (data models)
   - Modules can be extracted as standalone services

3. **Shared Infrastructure**
   - CoreModule services can be:
     - Published as npm packages
     - Copied to each service
     - Extracted as separate infrastructure services

4. **Database Per Service**
   - Current: Shared MongoDB database
   - Future: Each service owns its database
   - Migration: Data replication and synchronization strategies

### Example: Microservices Migration

**Before (Monolith)**:
```typescript
// AuthModule uses UserLookupService from UsersModule
providers: [
  UserLookupService,
  { provide: 'IUserLookupService', useExisting: UserLookupService }
]
```

**After (Microservices)**:
```typescript
// AuthService uses HTTP client implementing same interface
providers: [
  UserApiClient,  // HTTP client for Users Service
  { provide: 'IUserLookupService', useClass: UserApiClient }
]
```

**Business Logic**: Zero changes required! ✅

### Benefits of This Architecture

- ✅ **Zero Business Logic Changes**: Interface abstraction ensures business code remains unchanged
- ✅ **Gradual Migration**: Can migrate one module at a time
- ✅ **No Big Bang**: Toggle between monolith and microservices via configuration
- ✅ **Clear Boundaries**: Module boundaries become service boundaries

## 📖 Code Quality & Readability

### Consistent Code Organization
- **Standardized Module Structure**: Every feature module follows the same pattern
- **Naming Conventions**: Clear, descriptive naming throughout
- **File Organization**: Logical grouping by responsibility

### Type Safety
- **TypeScript First**: Full type coverage reduces runtime errors
- **DTOs**: Data Transfer Objects ensure type-safe API contracts
- **Interfaces**: Clear contracts between modules and layers

### Documentation
- **Architecture Docs**: Comprehensive documentation in `docs/` folder
- **Code Comments**: Strategic comments explain "why", not "what"
- **Swagger/OpenAPI**: Auto-generated API documentation

### Design Patterns
- **Repository Pattern**: Encapsulates data access logic
- **Service Pattern**: Separates business logic from controllers
- **Factory Pattern**: Email provider factory for extensibility
- **Strategy Pattern**: Pluggable email providers

### Maintainability Features
- **Base Classes**: Common functionality in base classes reduces duplication
- **Error Handling**: Centralized exception filtering
- **Logging**: Structured logging with Winston for observability
- **Validation**: Class-validator for input validation

### Code Metrics
- **Low Coupling**: Modules communicate via interfaces
- **High Cohesion**: Each module has focused responsibilities
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed Principle**: Base classes enable extension without modification

## 📚 API Documentation

The API documentation is available in multiple formats for different use cases:

### Postman Collection (Recommended for Testing)

A complete Postman collection is available with all API endpoints pre-configured:

**📦 Files Location**: `postman/` directory

- **TeamBoard-API.postman_collection.json** - Complete API collection
- **TeamBoard-API.postman_environment.json** - Environment variables template

#### Quick Import

1. **Open Postman** (Desktop or Web)
2. Click **Import**
3. Upload `postman/TeamBoard-API.postman_collection.json`
4. Upload `postman/TeamBoard-API.postman_environment.json` (optional)
5. Select environment from dropdown (top right)
6. Start testing!

#### Features

- ✅ **All endpoints pre-configured** with example requests
- ✅ **Auto token management** - Login automatically saves tokens
- ✅ **Organized by feature** - Health, Auth, Users, Teams, Projects, Tasks, Notifications
- ✅ **Environment variables** - Easy switching between dev/staging/prod
- ✅ **Bearer token authentication** - Automatic for protected endpoints

#### Sharing with Team

**Option 1: Postman Cloud (Easiest)**
1. Import collection in Postman
2. Click **Share** → **Get Link** to generate shareable URL
3. Share the link with your team

**Option 2: Postman Workspace**
1. Create a team workspace in Postman
2. Import collection to workspace
3. Invite team members

**Option 3: Git Repository**
- Collection files are in `postman/` directory
- Team members can import from repository

📖 **Full Documentation**: See [postman/README.md](./postman/README.md) for detailed instructions

### Swagger/OpenAPI

If Swagger is configured, access interactive API documentation:

- **Swagger UI**: `http://localhost:5000/api/v1/api-docs`

### API Endpoints Overview

#### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

#### Authentication
Most endpoints require JWT Bearer token authentication. Login first to obtain tokens:

```bash
POST /api/v1/auth/login
```

#### Available Endpoints

**Health**
- `GET /` - Basic health check
- `GET /health` - Detailed health check with system stats

**Authentication**
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/verify-email` - Verify email address
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

**Users**
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/invite` - Invite new user (SUPER_ADMIN only)
- `POST /users/complete-profile` - Complete user profile

**Teams**
- `GET /teams` - Get all teams (paginated)
- `GET /teams/:id` - Get team by ID
- `POST /teams` - Create team (SUPER_ADMIN only)
- `PUT /teams/:id` - Update team (SUPER_ADMIN only)
- `DELETE /teams/:id` - Delete team (SUPER_ADMIN only)

**Projects**
- `GET /projects` - Get all projects (paginated)
- `GET /projects/:id` - Get project by ID
- `POST /projects` - Create project (ADMIN/PROJECT_MANAGER)
- `PUT /projects/:id` - Update project (ADMIN/PROJECT_MANAGER)
- `DELETE /projects/:id` - Delete project (ADMIN/PROJECT_MANAGER)
- `POST /projects/:id/members` - Add members to project
- `DELETE /projects/:id/members` - Remove members from project

**Tasks**
- `GET /tasks` - Get all tasks (paginated)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create task (ADMIN/PROJECT_MANAGER)
- `PUT /tasks/:id` - Update task (ADMIN/PROJECT_MANAGER)
- `DELETE /tasks/:id` - Delete task (ADMIN/PROJECT_MANAGER)
- `POST /tasks/:id/reviews` - Add review to task
- `POST /tasks/:id/assignees` - Add assignees to task
- `DELETE /tasks/:id/assignees` - Remove assignees from task
- `POST /tasks/:id/status` - Change task status
- `POST /tasks/:id/priority` - Change task priority

**Notifications**
- `GET /notifications` - Get all notifications (with filters)
- `GET /notifications/my-notifications` - Get current user's notifications
- `GET /notifications/unread-count` - Get unread count
- `GET /notifications/:id` - Get notification by ID
- `POST /notifications` - Create notification
- `POST /notifications/bulk` - Create bulk notifications
- `POST /notifications/:id/read` - Mark notification as read
- `POST /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/stats` - Get notification statistics

For detailed request/response examples, please refer to the Postman collection.

## 📚 Additional Resources

- [Architecture & Dependency Flow](./docs/architecture-dependency-flow.md) - Detailed dependency analysis
- [Microservices Readiness Guide](./docs/microservices-readiness-guide.md) - Migration strategy
- [Understanding Core Folder](./docs/understanding-core-folder.md) - Core module explanation
- [Queue & Email Flow](./docs/queue-email-flow.md) - Email processing architecture
- [Postman Collection Guide](./postman/README.md) - Complete Postman setup and sharing guide

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 🚢 Deployment

### Production Build

```bash
# Build
yarn build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Or with node directly
yarn start:prod
```

### PM2 Configuration

The application includes `ecosystem.config.js` for PM2 process management:
- Automatic restarts on failure
- Log rotation
- Cluster mode support
- Environment-specific configurations

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Please follow the architectural patterns and coding standards outlined in this README and the documentation in the `docs/` folder.

---

**Built with ❤️ using NestJS**
