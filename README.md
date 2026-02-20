# PostAgent - LinkedIn AI Post Scheduler

**Tagline:** LinkedIn Posting on Autopilot

A full-stack application that automatically generates AI-powered LinkedIn posts and schedules them for automatic publishing. Users can set up recurring schedules (daily, weekly, monthly) and the system handles content generation and posting completely automatically.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Code Patterns](#code-patterns)
- [Flow Diagrams](#flow-diagrams)
- [Dependencies Explanation](#dependencies-explanation)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What It Does

PostAgent is an automated LinkedIn content management system that:

1. **Generates Content**: Uses AI (Groq API with Llama 3.3 70B model) to create engaging LinkedIn posts
2. **Schedules Posts**: Allows users to schedule posts for specific dates/times or create recurring schedules
3. **Auto-Publishes**: Automatically publishes posts to LinkedIn without user intervention
4. **OAuth Integration**: Securely connects to LinkedIn via OAuth 2.0
5. **Recurring Automation**: Creates "set and forget" schedules that run indefinitely

### Problem It Solves

- **Time Consumption**: Eliminates 10+ hours/week spent on content creation
- **Inconsistency**: Ensures posts are published regularly without manual effort
- **Creative Block**: Uses AI to generate professional content on demand
- **Multi-tasking**: Handles scheduling, generation, and publishing automatically

### Target Users

- LinkedIn content creators
- Personal brand builders
- Marketing professionals
- Business owners
- Thought leaders

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Frontend (Next.js 14)                        │   │
│  │  - React Components (TypeScript)                         │   │
│  │  - Redux Toolkit (State Management)                      │   │
│  │  - RTK Query (API Calls)                                 │   │
│  │  - Shadcn UI Components                                  │   │
│  │  - Tailwind CSS                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↕ HTTP/HTTPS                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Layer (REST)                                        │   │
│  │  - Auth Module (JWT, OAuth)                              │   │
│  │  - Posts Module                                          │   │
│  │  - LinkedIn Module                                       │   │
│  │  - Schedules Module                                      │   │
│  │  - Scheduler Service (Cron Jobs)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↕ Prisma ORM                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL 15)                            │
│  - Users Table                                                   │
│  - Posts Table                                                   │
│  - LinkedinAccounts Table                                        │
│  - Schedules Table                                               │
└─────────────────────────────────────────────────────────────────┘

External Integrations:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  LinkedIn API    │  │   Groq AI API    │  │  Cron Scheduler  │
│  (OAuth & Posts) │  │  (LLM: Llama)    │  │  (Node-cron)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Request Flow

```
User Request → Next.js Frontend → Redux Action → RTK Query
    ↓
API Call (HTTPS) → NestJS Backend → Controller
    ↓
Service Layer → Business Logic
    ↓
Prisma Client → PostgreSQL Database
    ↓
Response ← Database ← Prisma ← Service ← Controller ← NestJS
    ↓
Frontend Update ← Redux Store ← RTK Query ← API Response
```

### Cron Job Flow

```
Every Minute (Cron Trigger)
    ↓
SchedulerService.handleScheduledPosts()
    ↓
Query Database for Due Posts (scheduledAt <= NOW, status = 'scheduled')
    ↓
For Each Due Post:
    ├─ Get User's LinkedIn Access Token
    ├─ Call LinkedIn API to Publish Post
    ├─ Update Post Status to 'published'
    └─ Update Post.publishedAt timestamp

SchedulerService.handleRecurringSchedules()
    ↓
Query Database for Active Schedules (nextRunAt <= NOW, isActive = true)
    ↓
For Each Due Schedule:
    ├─ Pick Random Category from Schedule.categories[]
    ├─ Generate Post Content with Groq AI
    ├─ Create New Post in Database
    ├─ Publish Post to LinkedIn
    ├─ Update Schedule.lastRunAt
    └─ Calculate and Update Schedule.nextRunAt
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Redux Toolkit** | 2.x | State management |
| **RTK Query** | - | API data fetching and caching |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Shadcn UI** | - | Pre-built component library |
| **date-fns** | - | Date manipulation and formatting |
| **Lucide React** | - | Icon library |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **NestJS** | 11.x | Node.js framework |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 5.22.0 | ORM (Object-Relational Mapping) |
| **PostgreSQL** | 15 | Relational database |
| **Passport.js** | - | Authentication middleware |
| **JWT** | - | JSON Web Tokens for auth |
| **bcrypt** | - | Password hashing |
| **@nestjs/schedule** | - | Cron job scheduler |
| **Groq SDK** | - | AI model integration |
| **Axios** | - | HTTP client for LinkedIn API |

### DevOps & Deployment

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy |
| **AWS EC2** | Backend hosting |
| **Vercel** | Frontend hosting |
| **Let's Encrypt** | SSL certificates |
| **Git** | Version control |
| **GitHub Actions** | CI/CD (optional) |

---

## 📁 Project Structure

### Complete Directory Tree

```
linkedin-post-scheduler/
│
├── backend/                          # NestJS Backend Application
│   ├── prisma/                       # Database Schema & Migrations
│   │   ├── schema.prisma            # Database models definition
│   │   └── migrations/              # Migration files (auto-generated)
│   │
│   ├── src/                         # Source code
│   │   ├── auth/                    # Authentication Module
│   │   │   ├── auth.controller.ts   # Auth endpoints (login, register)
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── auth.module.ts       # Module definition
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── strategies/          # Passport strategies
│   │   │   │   └── jwt.strategy.ts  # JWT authentication strategy
│   │   │   └── guards/              # Route guards
│   │   │       └── jwt-auth.guard.ts
│   │   │
│   │   ├── posts/                   # Posts Module
│   │   │   ├── posts.controller.ts  # Post endpoints (CRUD)
│   │   │   ├── posts.service.ts     # Post business logic & AI generation
│   │   │   ├── posts.module.ts      # Module definition
│   │   │   └── dto/
│   │   │       ├── create-post.dto.ts
│   │   │       └── generate-post.dto.ts
│   │   │
│   │   ├── linkedin/                # LinkedIn Integration Module
│   │   │   ├── linkedin.controller.ts # OAuth & publish endpoints
│   │   │   ├── linkedin.service.ts    # LinkedIn API interactions
│   │   │   └── linkedin.module.ts
│   │   │
│   │   ├── schedules/               # Recurring Schedules Module
│   │   │   ├── schedules.controller.ts
│   │   │   ├── schedules.service.ts   # Schedule CRUD & calculations
│   │   │   ├── schedules.module.ts
│   │   │   └── dto/
│   │   │       ├── create-schedule.dto.ts
│   │   │       └── update-schedule.dto.ts
│   │   │
│   │   ├── scheduler/               # Cron Jobs Module
│   │   │   ├── scheduler.service.ts  # Cron job logic
│   │   │   └── scheduler.module.ts
│   │   │
│   │   ├── prisma/                  # Prisma Module (Global)
│   │   │   ├── prisma.service.ts    # Prisma client wrapper
│   │   │   └── prisma.module.ts
│   │   │
│   │   ├── app.module.ts            # Root application module
│   │   └── main.ts                  # Application entry point
│   │
│   ├── .env                         # Environment variables
│   ├── .dockerignore                # Docker ignore patterns
│   ├── Dockerfile                   # Docker image definition
│   ├── docker-compose.yml           # Docker services configuration
│   ├── package.json                 # Node.js dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   └── nest-cli.json                # NestJS CLI configuration
│
├── frontend/                        # Next.js Frontend Application
│   ├── public/                      # Static assets
│   │   └── (images, favicon, etc.)
│   │
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── layout.tsx           # Root layout (wraps all pages)
│   │   │   ├── page.tsx             # Landing page (/)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page (/login)
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # Register page (/register)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Dashboard page (/dashboard)
│   │   │   │   └── layout.tsx       # Dashboard layout with navbar
│   │   │   └── schedules/
│   │   │       └── page.tsx         # Schedules page (/schedules)
│   │   │
│   │   ├── components/              # React Components
│   │   │   ├── ui/                  # Shadcn UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── (other UI components)
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   └── ReduxProvider.tsx  # Redux store provider
│   │   │   │
│   │   │   ├── Navbar.tsx             # Navigation bar
│   │   │   ├── PostGenerator.tsx      # AI post generation form
│   │   │   ├── PostList.tsx           # List of user's posts
│   │   │   ├── LinkedInConnect.tsx    # LinkedIn OAuth connection
│   │   │   ├── ScheduleCreator.tsx    # Create recurring schedule
│   │   │   ├── ScheduleList.tsx       # List of schedules
│   │   │   └── LandingPage.tsx        # Landing page component
│   │   │
│   │   ├── lib/                     # Utilities & Configuration
│   │   │   ├── features/
│   │   │   │   ├── api/
│   │   │   │   │   └── apiSlice.ts    # RTK Query API definitions
│   │   │   │   └── auth/
│   │   │   │       └── authSlice.ts   # Auth state (if needed)
│   │   │   │
│   │   │   ├── store.ts              # Redux store configuration
│   │   │   └── utils.ts              # Helper functions
│   │   │
│   │   ├── hooks/
│   │   │   └── use-toast.ts          # Toast notifications hook
│   │   │
│   │   └── styles/
│   │       └── globals.css           # Global styles & Tailwind imports
│   │
│   ├── .env.local                   # Local environment variables
│   ├── .env.production              # Production environment variables
│   ├── next.config.js               # Next.js configuration
│   ├── package.json                 # Node.js dependencies
│   ├── postcss.config.js            # PostCSS configuration (for Tailwind)
│   ├── tailwind.config.ts           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── components.json              # Shadcn UI configuration
│
├── docs/                            # Documentation
│   ├── README.md                    # This file
│   ├── deployment-guide.md          # Deployment instructions
│   ├── linkedin-setup.md            # LinkedIn OAuth setup
│   └── api-documentation.md         # API endpoints documentation
│
└── .gitignore                       # Git ignore patterns
```

### Key File Purposes

#### Backend Files

**`backend/prisma/schema.prisma`**
- Defines database schema (tables, relations, indexes)
- Used by Prisma to generate TypeScript types and migrations
- Contains User, Post, LinkedinAccount, Schedule models

**`backend/src/main.ts`**
- Application entry point
- Configures CORS, validation pipes, global prefix
- Starts NestJS server on specified port

**`backend/src/auth/auth.service.ts`**
- Handles user registration and login
- Password hashing with bcrypt
- JWT token generation
- User validation

**`backend/src/posts/posts.service.ts`**
- AI post generation using Groq API
- Post CRUD operations
- Database queries via Prisma
- Post scheduling logic

**`backend/src/linkedin/linkedin.service.ts`**
- LinkedIn OAuth flow (getAuthUrl, handleCallback)
- Access token management and refresh
- Publishing posts to LinkedIn API
- Account connection/disconnection

**`backend/src/schedules/schedules.service.ts`**
- Schedule CRUD operations
- Calculate next run time based on frequency
- Get due schedules for cron jobs
- Update schedules after execution

**`backend/src/scheduler/scheduler.service.ts`**
- Cron jobs (runs every minute)
- `handleScheduledPosts()`: Publishes one-time scheduled posts
- `handleRecurringSchedules()`: Auto-generates and publishes from schedules

**`backend/docker-compose.yml`**
- Defines PostgreSQL and Backend services
- Environment variables configuration
- Volume mounting for data persistence
- Network configuration

#### Frontend Files

**`frontend/src/app/layout.tsx`**
- Root layout component
- Wraps entire application
- Includes Redux provider, Toaster, fonts

**`frontend/src/lib/features/api/apiSlice.ts`**
- RTK Query API slice
- Defines all API endpoints
- Handles caching and invalidation
- Auto-generates hooks (useMutation, useQuery)

**`frontend/src/components/PostGenerator.tsx`**
- Form for generating posts
- Category selection
- AI generation trigger
- Scheduling functionality
- Converts local time to UTC

**`frontend/src/components/ScheduleCreator.tsx`**
- Form for creating recurring schedules
- Frequency selection (daily, weekly, monthly, custom)
- Category multi-select
- Optional description input

**`frontend/src/lib/store.ts`**
- Redux store configuration
- Combines reducers
- Middleware setup (RTK Query)

---

## 💾 Database Schema

### Complete Schema (Prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts            Post[]
  linkedinAccounts LinkedinAccount[]
  schedules        Schedule[]
}

model Post {
  id           String    @id @default(uuid())
  content      String
  category     String
  status       String    @default("draft") // draft, scheduled, published, failed
  scheduledAt  DateTime?
  publishedAt  DateTime?
  linkedinPostId String?
  scheduleId   String?   // Reference to Schedule if auto-generated
  userId       String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  schedule Schedule? @relation(fields: [scheduleId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([status])
  @@index([scheduledAt])
}

model LinkedinAccount {
  id           String    @id @default(uuid())
  userId       String
  accessToken  String
  refreshToken String?
  expiresAt    DateTime
  linkedinId   String
  name         String?
  email        String?
  profileUrl   String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
}

model Schedule {
  id          String    @id @default(uuid())
  name        String
  description String?   // Topic/theme for AI generation
  frequency   String    // 'daily' | 'weekly' | 'monthly' | 'custom'
  interval    Int       @default(1) // For custom frequency (every X days)
  categories  String[]  // Multiple categories to rotate through
  isActive    Boolean   @default(true)
  lastRunAt   DateTime?
  nextRunAt   DateTime
  userId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  posts Post[]

  @@index([userId])
  @@index([nextRunAt])
  @@index([isActive])
}
```

### Database Relationships

```
User (1) ←→ (Many) Post
User (1) ←→ (1) LinkedinAccount
User (1) ←→ (Many) Schedule
Schedule (1) ←→ (Many) Post
```

### Indexes Explanation

- **`@@index([userId])`**: Fast lookups for user's posts/schedules
- **`@@index([status])`**: Quick filtering by post status
- **`@@index([scheduledAt])`**: Efficient querying for due posts
- **`@@index([nextRunAt])`**: Fast lookup for due schedules
- **`@@index([isActive])`**: Filter active schedules quickly

---

## 🔌 API Endpoints

### Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://stayeasy.online`

### Authentication Endpoints

#### POST `/auth/register`
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/auth/login`
Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Posts Endpoints

All posts endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### POST `/posts/generate`
Generate AI post content

**Request Body:**
```json
{
  "category": "Technology"
}
```

**Response:**
```json
{
  "content": "As we navigate the ever-evolving landscape of technology..."
}
```

#### POST `/posts`
Create a new post

**Request Body:**
```json
{
  "content": "Post content here",
  "category": "Technology",
  "scheduledAt": "2026-02-10T10:00:00.000Z",
  "status": "scheduled"
}
```

**Response:**
```json
{
  "id": "uuid",
  "content": "Post content here",
  "category": "Technology",
  "status": "scheduled",
  "scheduledAt": "2026-02-10T10:00:00.000Z",
  "userId": "uuid",
  "createdAt": "2026-02-08T05:00:00.000Z",
  "updatedAt": "2026-02-08T05:00:00.000Z"
}
```

#### GET `/posts`
Get all user's posts

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Post content",
    "category": "Technology",
    "status": "published",
    "scheduledAt": "2026-02-08T10:00:00.000Z",
    "publishedAt": "2026-02-08T10:00:05.000Z",
    "linkedinPostId": "urn:li:share:123456789",
    "scheduleId": null,
    "userId": "uuid",
    "createdAt": "2026-02-08T05:00:00.000Z",
    "updatedAt": "2026-02-08T10:00:05.000Z"
  }
]
```

#### GET `/posts/:id`
Get single post

**Response:**
```json
{
  "id": "uuid",
  "content": "Post content",
  "category": "Technology",
  "status": "draft",
  "userId": "uuid",
  "createdAt": "2026-02-08T05:00:00.000Z",
  "updatedAt": "2026-02-08T05:00:00.000Z"
}
```

#### PATCH `/posts/:id`
Update a post

**Request Body:**
```json
{
  "content": "Updated content",
  "scheduledAt": "2026-02-10T15:00:00.000Z"
}
```

#### DELETE `/posts/:id`
Delete a post

**Response:** `204 No Content`

#### POST `/posts/:id/publish`
Immediately publish a post to LinkedIn

**Response:**
```json
{
  "message": "Post published successfully",
  "linkedinPostId": "urn:li:share:123456789"
}
```

### LinkedIn Endpoints

#### GET `/linkedin/auth`
Get LinkedIn OAuth URL

**Response:**
```json
{
  "url": "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=..."
}
```

#### GET `/linkedin/callback`
LinkedIn OAuth callback (handles code exchange)

**Query Parameters:**
- `code`: Authorization code from LinkedIn
- `state`: CSRF protection state

**Response:** Redirects to frontend with success/error

#### GET `/linkedin/account`
Get connected LinkedIn account info

**Response:**
```json
{
  "id": "uuid",
  "linkedinId": "12345",
  "name": "John Doe",
  "email": "john@example.com",
  "profileUrl": "https://www.linkedin.com/in/johndoe",
  "createdAt": "2026-02-08T05:00:00.000Z"
}
```

#### DELETE `/linkedin/disconnect`
Disconnect LinkedIn account

**Response:** `204 No Content`

### Schedules Endpoints

#### POST `/schedules`
Create recurring schedule

**Request Body:**
```json
{
  "name": "Daily Tech Posts",
  "description": "AI trends and innovations",
  "frequency": "daily",
  "interval": 1,
  "categories": ["Technology", "Business"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Daily Tech Posts",
  "description": "AI trends and innovations",
  "frequency": "daily",
  "interval": 1,
  "categories": ["Technology", "Business"],
  "isActive": true,
  "lastRunAt": null,
  "nextRunAt": "2026-02-09T09:00:00.000Z",
  "userId": "uuid",
  "createdAt": "2026-02-08T05:00:00.000Z",
  "updatedAt": "2026-02-08T05:00:00.000Z"
}
```

#### GET `/schedules`
Get all user's schedules

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Daily Tech Posts",
    "frequency": "daily",
    "categories": ["Technology"],
    "isActive": true,
    "nextRunAt": "2026-02-09T09:00:00.000Z",
    "_count": {
      "posts": 15
    }
  }
]
```

#### GET `/schedules/:id`
Get single schedule

#### PATCH `/schedules/:id`
Update a schedule

**Request Body:**
```json
{
  "name": "Updated Name",
  "categories": ["Technology", "Career"]
}
```

#### DELETE `/schedules/:id`
Delete a schedule

#### PATCH `/schedules/:id/toggle`
Toggle schedule active status

**Response:**
```json
{
  "id": "uuid",
  "isActive": false,
  "updatedAt": "2026-02-08T06:00:00.000Z"
}
```

---

## ✨ Features

### 1. AI Post Generation

**Technology:** Groq API with Llama 3.3 70B Versatile model

**Process:**
1. User selects category (Technology, Business, Career, Marketing)
2. Frontend sends POST request to `/posts/generate`
3. Backend constructs prompt:
   ```typescript
   const prompt = `Create a professional LinkedIn post about ${category}. 
   The post should be engaging, informative, and between 150-300 characters. 
   Include relevant hashtags.`;
   ```
4. Groq API generates content
5. Response returned to frontend
6. User can edit before saving

**Features:**
- Multiple category support
- Custom prompts (via description field in schedules)
- Character limit enforcement
- Professional tone

### 2. Manual Scheduling

**User Flow:**
1. Generate or write post content
2. Select date and time (in local timezone)
3. Frontend converts to UTC ISO string
4. Saves to database with `status: 'scheduled'`
5. Cron job checks every minute for due posts
6. Publishes when `scheduledAt <= NOW()`

**Technical Details:**
- Uses `datetime-local` input (HTML5)
- JavaScript `Date.toISOString()` for UTC conversion
- Database stores in UTC
- Frontend displays in user's local timezone

### 3. Recurring Schedules

**Configuration:**
- **Name**: Descriptive name for schedule
- **Description**: Optional topic/theme for AI
- **Frequency**: Daily, Weekly, Monthly, or Custom (every X days)
- **Categories**: Multiple categories to rotate through
- **Status**: Active/Paused toggle

**Execution Flow:**
1. Cron runs every minute: `@Cron(CronExpression.EVERY_MINUTE)`
2. Query active schedules: `nextRunAt <= NOW() AND isActive = true`
3. For each due schedule:
   - Pick random category from `categories[]`
   - Generate post with AI (uses description if provided)
   - Create Post record in database
   - Publish to LinkedIn
   - Update `lastRunAt = NOW()`
   - Calculate `nextRunAt` based on frequency
   - Save updated schedule

**Next Run Calculation:**
```typescript
calculateNextRunTime(frequency: string, interval: number = 1): Date {
  const now = new Date();
  const next = new Date(now);
  
  // Set to 9 AM UTC (default posting time)
  next.setUTCHours(9, 0, 0, 0);
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'custom':
      next.setDate(next.getDate() + interval);
      break;
  }
  
  // If calculated time is in the past, move forward
  while (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}
```

### 4. LinkedIn OAuth Integration

**OAuth 2.0 Flow:**

1. **User clicks "Connect LinkedIn"**
   ```typescript
   GET /linkedin/auth
   → Returns authorization URL
   ```

2. **User redirects to LinkedIn**
   ```
   https://www.linkedin.com/oauth/v2/authorization?
     response_type=code&
     client_id=YOUR_CLIENT_ID&
     redirect_uri=YOUR_CALLBACK_URL&
     state=RANDOM_STATE&
     scope=openid profile email w_member_social
   ```

3. **User authorizes app on LinkedIn**

4. **LinkedIn redirects back with code**
   ```
   YOUR_CALLBACK_URL?code=AUTHORIZATION_CODE&state=STATE
   ```

5. **Backend exchanges code for tokens**
   ```typescript
   POST https://www.linkedin.com/oauth/v2/accessToken
   Body: {
     grant_type: 'authorization_code',
     code: AUTHORIZATION_CODE,
     client_id: YOUR_CLIENT_ID,
     client_secret: YOUR_CLIENT_SECRET,
     redirect_uri: YOUR_CALLBACK_URL
   }
   ```

6. **Backend saves tokens to database**
   ```typescript
   LinkedinAccount.create({
     userId: user.id,
     accessToken: tokens.access_token,
     refreshToken: tokens.refresh_token,
     expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
     linkedinId: profile.sub,
     name: profile.name,
     email: profile.email
   })
   ```

**Token Refresh:**
- Tokens expire after 60 days
- Before publishing, check if `expiresAt < NOW()`
- If expired, refresh:
  ```typescript
  POST https://www.linkedin.com/oauth/v2/accessToken
  Body: {
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN,
    client_id: YOUR_CLIENT_ID,
    client_secret: YOUR_CLIENT_SECRET
  }
  ```

### 5. LinkedIn Publishing

**API Endpoint:** `POST https://api.linkedin.com/v2/ugcPosts`

**Request Structure:**
```typescript
{
  author: `urn:li:person:${linkedinAccount.linkedinId}`,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: post.content
      },
      shareMediaCategory: 'NONE'
    }
  },
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
  }
}
```

**Headers:**
```typescript
{
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-Restli-Protocol-Version': '2.0.0'
}
```

**Error Handling:**
- Token expired → Refresh and retry
- Rate limit → Log and retry later
- Invalid content → Mark as failed, don't retry
- Network error → Retry up to 3 times

### 6. Cron Job Scheduler

**Implementation:** `@nestjs/schedule` with node-cron

**Configuration:**
```typescript
@Cron(CronExpression.EVERY_MINUTE)
async handleScheduledPosts() {
  // Runs every minute
}
```

**Two Separate Jobs:**

**Job 1: One-Time Scheduled Posts**
```typescript
async handleScheduledPosts() {
  const duePosts = await this.prisma.post.findMany({
    where: {
      status: 'scheduled',
      scheduledAt: { lte: new Date() }
    },
    include: { user: { include: { linkedinAccounts: true } } }
  });

  for (const post of duePosts) {
    try {
      await this.linkedinService.publishPost(post);
      await this.prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'published',
          publishedAt: new Date()
        }
      });
    } catch (error) {
      await this.prisma.post.update({
        where: { id: post.id },
        data: { status: 'failed' }
      });
    }
  }
}
```

**Job 2: Recurring Schedules**
```typescript
async handleRecurringSchedules() {
  const dueSchedules = await this.schedulesService.getDueSchedules();

  for (const schedule of dueSchedules) {
    try {
      // Pick random category
      const category = schedule.categories[
        Math.floor(Math.random() * schedule.categories.length)
      ];

      // Generate content
      const content = schedule.description
        ? await this.postsService.generatePostWithDescription(
            category,
            schedule.description
          )
        : await this.postsService.generatePost(category);

      // Create post
      const post = await this.prisma.post.create({
        data: {
          content,
          category,
          status: 'published',
          scheduleId: schedule.id,
          userId: schedule.userId
        }
      });

      // Publish to LinkedIn
      await this.linkedinService.publishPost(post);

      // Update schedule
      await this.schedulesService.updateAfterRun(schedule.id);
    } catch (error) {
      console.error(`Schedule ${schedule.id} failed:`, error);
    }
  }
}
```

### 7. State Management (Frontend)

**Technology:** Redux Toolkit + RTK Query

**Store Structure:**
```typescript
{
  api: {
    queries: {
      'getPosts(undefined)': { ... },
      'getSchedules(undefined)': { ... }
    },
    mutations: {
      'login({"email":"...","password":"..."})': { ... }
    }
  }
}
```

**RTK Query Setup:**
```typescript
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Post', 'Schedule', 'LinkedInAccount'],
  endpoints: (builder) => ({
    // Auto-generates hooks:
    // useLoginMutation
    // useGetPostsQuery
    // useCreatePostMutation
    // etc.
  })
});
```

**Benefits:**
- Automatic caching
- Automatic refetching
- Optimistic updates
- Loading/error states
- Normalized data
- Tag-based invalidation

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v9 or higher
- **PostgreSQL**: v15 or higher (or use Docker)
- **Docker & Docker Compose**: For containerized deployment (optional)
- **Git**: For version control

### Local Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/linkedin-post-scheduler.git
cd linkedin-post-scheduler
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Install Prisma 5 (if using Prisma 7, downgrade)
npm uninstall prisma @prisma/client
npm install prisma@5.22.0 @prisma/client@5.22.0

# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

**Backend runs on:** `http://localhost:3001`

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

#### 4. Database Setup (Local PostgreSQL)

**Option A: Use Local PostgreSQL**

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb linkedin_scheduler

# Create user
sudo -u postgres psql
CREATE USER youruser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE linkedin_scheduler TO youruser;
\q

# Update .env
DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/linkedin_scheduler"
```

**Option B: Use Docker Compose** (Recommended)

```bash
cd backend
docker-compose up -d postgres
```

Database will be available at `localhost:5432`

#### 5. Get API Keys

**Groq API Key** (Free):
1. Go to https://console.groq.com/keys
2. Sign up / Login
3. Create API key
4. Add to `.env`: `GROQ_API_KEY=your_key_here`

**LinkedIn OAuth Credentials**:
1. Go to https://www.linkedin.com/developers/apps
2. Create new app
3. Request access to "Sign In with LinkedIn" and "Share on LinkedIn"
4. Get Client ID and Client Secret
5. Set Redirect URI: `http://localhost:3001/linkedin/callback`
6. Add to `.env`:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   LINKEDIN_REDIRECT_URI=http://localhost:3001/linkedin/callback
   ```

#### 6. Test the Application

1. **Register**: http://localhost:3000/register
2. **Login**: http://localhost:3000/login
3. **Connect LinkedIn**: Dashboard → Connect LinkedIn
4. **Generate Post**: Dashboard → Generate Post
5. **Create Schedule**: Schedules → Create Schedule

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/linkedin_scheduler"
# or for local: "postgresql://user:password@localhost:5432/linkedin_scheduler"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRATION="7d"

# AI Model
GROQ_API_KEY="gsk_your_groq_api_key_here"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your_linkedin_client_id"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
LINKEDIN_REDIRECT_URI="http://localhost:3001/linkedin/callback"
# Production: "https://stayeasy.online/linkedin/callback"

# Application
PORT=3001
NODE_ENV="development"
# Production: "production"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
# Production: "https://your-app.vercel.app"

# Docker-specific (when using PostgreSQL in Docker)
DB_PASSWORD="your_strong_database_password"
```

### Frontend (.env.local for development)

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Frontend (.env.production for production)

```bash
NEXT_PUBLIC_API_URL="https://stayeasy.online"
```

### Security Best Practices

1. **Never commit .env files** to Git
2. **Use strong passwords** (32+ characters)
3. **Rotate secrets** regularly in production
4. **Use different secrets** for dev and production
5. **Store production secrets** in secure vault (AWS Secrets Manager, etc.)

---

## 🌐 Deployment

### Backend Deployment (AWS EC2 with Docker)

Complete guide in `/docs/deployment-guide.md`

**Quick Summary:**

1. **Launch EC2 Instance** (t2.medium, Ubuntu 22.04)
2. **Allocate Elastic IP**
3. **Install Docker & Docker Compose**
4. **Clone repository**
5. **Configure .env**
6. **Build and run:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```
7. **Setup Nginx** as reverse proxy
8. **Get SSL certificate** with Let's Encrypt
9. **Update LinkedIn redirect URI**

**Backend URL:** `https://stayeasy.online`

### Frontend Deployment (Vercel)

**Quick Deploy:**

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://stayeasy.online`
5. Deploy

**Frontend URL:** `https://your-app.vercel.app`

### Database Options

**Option 1: Docker on EC2** (Current setup)
- PostgreSQL in Docker container
- Data persists in Docker volume
- Manual backups required

**Option 2: AWS RDS** (Recommended for production)
- Managed PostgreSQL
- Automatic backups
- High availability
- More expensive (~$15-30/month)

**Option 3: Supabase** (Easiest)
- Free tier (500MB)
- Managed PostgreSQL
- Automatic backups
- Web interface

---

## 📝 Code Patterns

### Backend Patterns

#### Module Structure

Each feature follows this pattern:

```
feature/
├── feature.controller.ts    # HTTP endpoints
├── feature.service.ts       # Business logic
├── feature.module.ts        # Module definition
└── dto/                     # Data Transfer Objects
    ├── create-feature.dto.ts
    └── update-feature.dto.ts
```

#### Controller Pattern

```typescript
@Controller('posts')
@UseGuards(JwtAuthGuard)  // Protect all routes
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() dto: CreatePostDto, @Request() req) {
    return this.postsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(@Request() req) {
    return this.postsService.findAll(req.user.id);
  }
}
```

#### Service Pattern

```typescript
@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreatePostDto, userId: string) {
    return this.prisma.post.create({
      data: { ...dto, userId }
    });
  }
}
```

#### DTO Pattern (Data Validation)

```typescript
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
```

### Frontend Patterns

#### Component Structure

```typescript
'use client';  // Client component (uses hooks)

import { useState } from 'react';
import { useSomeMutation } from '@/lib/features/api/apiSlice';

export default function MyComponent() {
  const [state, setState] = useState('');
  const [mutation, { isLoading }] = useSomeMutation();

  const handleSubmit = async () => {
    try {
      await mutation(data).unwrap();
      // Success
    } catch (error) {
      // Error
    }
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### RTK Query Pattern

```typescript
endpoints: (builder) => ({
  getPosts: builder.query<Post[], void>({
    query: () => '/posts',
    providesTags: ['Post'],
  }),
  
  createPost: builder.mutation<Post, CreatePostDto>({
    query: (data) => ({
      url: '/posts',
      method: 'POST',
      body: data,
    }),
    invalidatesTags: ['Post'],  // Refetch getPosts
  }),
})
```

#### Page Structure (App Router)

```typescript
// app/dashboard/page.tsx
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
  return <DashboardContent />;
}
```

---

## 📊 Flow Diagrams

### User Registration Flow

```
User → Register Form → Submit
    ↓
Frontend validates input
    ↓
POST /auth/register
    ↓
Backend validates DTO
    ↓
Check if email exists
    ↓ (No)
Hash password with bcrypt
    ↓
Create User in database
    ↓
Generate JWT token
    ↓
Return { token, user }
    ↓
Frontend stores token in localStorage
    ↓
Redirect to /dashboard
```

### Post Generation & Scheduling Flow

```
User → Dashboard → Generate Post
    ↓
Select Category (e.g., "Technology")
    ↓
POST /posts/generate { category }
    ↓
Backend constructs AI prompt
    ↓
Call Groq API (Llama 3.3 70B)
    ↓
Receive generated content
    ↓
Return to Frontend
    ↓
User edits content (optional)
    ↓
User selects date/time (local timezone)
    ↓
Frontend converts to UTC
    ↓
POST /posts { content, category, scheduledAt, status: 'scheduled' }
    ↓
Backend saves to database
    ↓
Cron job waits for scheduledAt time
    ↓
When time arrives:
    ├─ Get LinkedIn access token
    ├─ POST to LinkedIn API
    ├─ Update post status to 'published'
    └─ Save LinkedIn post ID
```

### Recurring Schedule Execution Flow

```
Cron Job (Every Minute)
    ↓
Query: Active Schedules WHERE nextRunAt <= NOW()
    ↓
For each due schedule:
    ├─ Pick random category from schedule.categories[]
    │   Example: ['Technology', 'Business'] → picks 'Technology'
    ├─ Construct AI prompt
    │   If description exists: "Create a LinkedIn post about Technology focusing on {description}"
    │   Else: "Create a LinkedIn post about Technology"
    ├─ Call Groq API
    ├─ Receive generated content
    ├─ Create Post in database
    │   data: { content, category, status: 'published', scheduleId, userId }
    ├─ Get user's LinkedIn access token
    ├─ Check if token expired
    │   ├─ If expired: Refresh token
    │   └─ If valid: Continue
    ├─ POST to LinkedIn API
    │   Body: { author, lifecycleState, specificContent, visibility }
    ├─ Save LinkedIn post ID in Post.linkedinPostId
    ├─ Update Schedule:
    │   ├─ lastRunAt = NOW()
    │   └─ nextRunAt = calculateNextRunTime(frequency, interval)
    │       Examples:
    │       - daily: NOW() + 1 day at 9 AM UTC
    │       - weekly: NOW() + 7 days at 9 AM UTC
    │       - monthly: NOW() + 1 month at 9 AM UTC
    │       - custom (interval=3): NOW() + 3 days at 9 AM UTC
    └─ Log success/failure
```

### LinkedIn OAuth Flow

```
User → Dashboard → "Connect LinkedIn"
    ↓
GET /linkedin/auth
    ↓
Backend generates OAuth URL with state parameter
    ↓
Frontend redirects to LinkedIn authorization page
    ↓
User logs in to LinkedIn and authorizes app
    ↓
LinkedIn redirects to callback URL with code
    GET /linkedin/callback?code=XXX&state=YYY
    ↓
Backend validates state parameter
    ↓
Backend exchanges code for tokens
    POST https://www.linkedin.com/oauth/v2/accessToken
    ↓
Receive: { access_token, refresh_token, expires_in }
    ↓
Get user profile from LinkedIn
    GET https://api.linkedin.com/v2/userinfo
    ↓
Save to database:
    LinkedinAccount {
      userId,
      accessToken: encrypted(access_token),
      refreshToken: encrypted(refresh_token),
      expiresAt: NOW() + expires_in,
      linkedinId,
      name,
      email
    }
    ↓
Redirect to frontend with success message
    ↓
Frontend shows "Connected" status with user profile
```

---

## 📦 Dependencies Explanation

### Backend Dependencies

| Package | Purpose | Why We Use It |
|---------|---------|---------------|
| `@nestjs/common` | Core NestJS framework | Decorators, DI, HTTP utilities |
| `@nestjs/core` | NestJS runtime | Application bootstrap |
| `@nestjs/platform-express` | Express adapter | HTTP server (alternative: Fastify) |
| `@nestjs/config` | Configuration management | Load .env files, type-safe config |
| `@nestjs/jwt` | JWT utilities | Token generation and validation |
| `@nestjs/passport` | Authentication framework | Integrates Passport.js strategies |
| `@nestjs/schedule` | Cron jobs | Task scheduling for auto-posting |
| `passport` | Authentication middleware | OAuth and JWT strategies |
| `passport-jwt` | JWT strategy | Validate JWT tokens |
| `passport-local` | Local strategy | Email/password authentication |
| `bcrypt` | Password hashing | Secure password storage |
| `class-validator` | DTO validation | Validate request bodies |
| `class-transformer` | DTO transformation | Transform plain objects to class instances |
| `@prisma/client` | Database client | Type-safe database queries |
| `prisma` | ORM toolkit | Schema definition, migrations |
| `groq-sdk` | Groq API client | AI post generation |
| `axios` | HTTP client | LinkedIn API requests |
| `rxjs` | Reactive programming | NestJS uses observables |

### Frontend Dependencies

| Package | Purpose | Why We Use It |
|---------|---------|---------------|
| `next` | React framework | SSR, routing, optimization |
| `react` | UI library | Component-based UI |
| `react-dom` | React renderer | Render React to DOM |
| `@reduxjs/toolkit` | State management | Simplified Redux with RTK Query |
| `react-redux` | React bindings | Connect React to Redux |
| `tailwindcss` | CSS framework | Utility-first styling |
| `postcss` | CSS processor | Required for Tailwind |
| `autoprefixer` | CSS prefixer | Browser compatibility |
| `date-fns` | Date utilities | Format dates, calculations |
| `lucide-react` | Icons | Modern icon library |
| `sonner` | Toast notifications | User feedback |
| `@radix-ui/*` | Headless UI primitives | Accessible components (Shadcn base) |

### DevDependencies

| Package | Purpose |
|---------|---------|
| `typescript` | Type checking |
| `@types/node` | Node.js type definitions |
| `@types/react` | React type definitions |
| `eslint` | Code linting |
| `prettier` | Code formatting |

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**Issue: Prisma 7 schema validation error**
```
Error: The datasource property `url` is no longer supported
```

**Solution:** Downgrade to Prisma 5
```bash
npm uninstall prisma @prisma/client
npm install prisma@5.22.0 @prisma/client@5.22.0
rm prisma/prisma.config.ts
npx prisma generate
```

---

**Issue: Docker container restarts continuously**
```
linkedin-backend  | Error: Could not parse schema engine response
```

**Solution:** Install OpenSSL in Docker
```dockerfile
# In Dockerfile
RUN apk add --no-cache openssl
```

---

**Issue: Database connection failed**
```
Error: Can't reach database server at `postgres:5432`
```

**Solution:** Check Docker network
```bash
docker-compose ps
docker logs linkedin-postgres
# Ensure postgres container is healthy
```

---

**Issue: LinkedIn API returns 401**
```
Error: Unauthorized - Invalid access token
```

**Solution:** Refresh access token
```typescript
// Token may have expired
// Backend should auto-refresh
// Check expiresAt field in LinkedinAccount
```

---

#### Frontend Issues

**Issue: API calls fail with CORS error**
```
Access to fetch at 'http://localhost:3001' has been blocked by CORS
```

**Solution:** Update backend CORS config
```typescript
// In backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

---

**Issue: Toasts not showing**
```
toast() is called but nothing appears
```

**Solution:** Add Toaster component
```typescript
// In app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

---

**Issue: Time zone issues with scheduling**
```
Scheduled for 10 AM but shows 3 PM
```

**Solution:** Convert to UTC before sending
```typescript
const localDate = new Date(scheduledDate);
const utcDate = localDate.toISOString();
// Send utcDate to backend
```

---

**Issue: Redux state not persisting**
```
Token lost on page refresh
```

**Solution:** Store in localStorage
```typescript
// After login
localStorage.setItem('token', result.token);

// In RTK Query baseQuery
prepareHeaders: (headers) => {
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
}
```

---

### Deployment Issues

**Issue: Nginx 502 Bad Gateway**
```
nginx: 502 Bad Gateway
```

**Solution:** Check backend is running
```bash
docker ps  # Ensure linkedin-backend is running
docker logs linkedin-backend  # Check for errors
sudo systemctl status nginx
```

---

**Issue: SSL certificate failed**
```
certbot: Could not automatically find matching server block
```

**Solution:** Set server_name in Nginx
```nginx
server {
    server_name stayeasy.online www.stayeasy.online;
    # ...
}
```

---

**Issue: Cron jobs not running**
```
Posts not auto-publishing
```

**Solution:** Check logs and timezone
```bash
# View cron job logs
docker logs linkedin-backend | grep "Cron"

# Verify server timezone is UTC
timedatectl

# Check database has due posts
docker exec linkedin-postgres psql -U postgres -d linkedin_scheduler -c "SELECT * FROM \"Post\" WHERE status='scheduled';"
```

---

## 📚 Additional Resources

### Documentation

- **NestJS**: https://docs.nestjs.com/
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **LinkedIn API**: https://docs.microsoft.com/en-us/linkedin/

### API Documentation

- **Groq API**: https://console.groq.com/docs
- **LinkedIn OAuth**: https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication
- **LinkedIn Share API**: https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares

### Tools

- **Prisma Studio**: `npx prisma studio` - Database GUI
- **Postman**: API testing
- **Docker Desktop**: Container management
- **Vercel Dashboard**: Frontend deployments
- **AWS Console**: Backend infrastructure

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes
3. Test locally
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (2 spaces, single quotes)
- **Linting**: ESLint
- **Naming**: camelCase for variables, PascalCase for components

---

## 📄 License

MIT License - See LICENSE file

---

## 👨‍💻 Author

Your Name
- Website: https://stayeasy.online
- LinkedIn: [Your LinkedIn]
- GitHub: [Your GitHub]

---

## 🎯 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: February 2026

---

**This README provides complete context for any LLM to understand the entire project structure, architecture, and implementation details.**