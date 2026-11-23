# 🎓 Campus ERP + LMS

**AI-Powered Education Management Platform** — A complete, production-ready Campus ERP + LMS system similar to Camu, built with modern scalable architecture.

> "Camu + Notion + Google Classroom + AI"

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Flutter     │  │   Next.js    │  │  Third-Party     │  │
│  │   Mobile App  │  │   Web Admin  │  │  Integrations    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼──────────────────┼───────────────────┼────────────┘
          │                  │                   │
┌─────────▼──────────────────▼───────────────────▼────────────┐
│                    API Gateway (Nginx)                        │
│              Load Balancer + SSL Termination                  │
└─────────┬──────────────────┬───────────────────┬────────────┘
          │                  │                   │
┌─────────▼──────────────────▼───────────────────▼────────────┐
│                    Backend (NestJS)                           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Auth    │ │ Core     │ │ AI       │ │ Realtime       │  │
│  │ Module  │ │ Modules  │ │ Modules  │ │ (WebSocket/FCM)│  │
│  └─────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└─────────┬──────────────────┬───────────────────┬────────────┘
          │                  │                   │
┌─────────▼──────────────────▼───────────────────▼────────────┐
│                    Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL   │  │    Redis     │  │    AWS S3        │  │
│  │  (Primary DB) │  │   (Cache)    │  │   (Storage)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Features

### 👥 User Roles
- **Super Admin** — Multi-institution management, system-wide config
- **Admin** — Institution management, users, courses, fees, reports
- **Faculty** — Attendance, assignments, exams, student analytics
- **Student** — Courses, attendance, exams, fees, LMS
- **Parent** — Child's progress, attendance, fees, notifications

### 📚 Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| **Authentication** | JWT + Refresh Tokens, OTP, RBAC, OAuth-ready | ✅ |
| **Student Information** | Profiles, admissions, enrollment, academic history | ✅ |
| **Attendance** | Manual, QR code, GPS, bulk marking, reports | ✅ |
| **LMS** | Course modules, videos, PDFs, quizzes, progress | ✅ |
| **Examinations** | Online exams, hall tickets, results, GPA/CGPA | ✅ |
| **Timetable** | Dynamic generator, conflict detection, calendar | ✅ |
| **Faculty Dashboard** | Marking, uploads, analytics, communication | ✅ |
| **Parent Portal** | Tracking, alerts, progress, notifications | ✅ |
| **Admin Dashboard** | Analytics, reports, fee management, audit logs | ✅ |
| **Communication** | Push notifications, chat, announcements, email/SMS | ✅ |
| **Fees & Payments** | Fee structure, online payments, receipts, due alerts | ✅ |

### 🤖 AI Features
- **AI Chatbot Assistant** — Natural language queries about attendance, exams, fees
- **Attendance Prediction** — ML-based trend analysis and forecasting
- **Performance Analytics** — Grade distribution, at-risk student identification
- **AI Timetable Generator** — Optimal schedule generation with conflict detection
- **Notes Summarizer** — Automatic content summarization for study materials
- **Exam Evaluator** — AI-powered answer evaluation with feedback
- **Recommendation Engine** — Smart course recommendations based on performance

## 🛠 Tech Stack

### Frontend Mobile
| Technology | Purpose |
|------------|---------|
| Flutter 3 | Cross-platform mobile UI |
| Riverpod | State management |
| GoRouter | Navigation & routing |
| Material 3 | Design system |
| Dio | HTTP client with JWT interceptor |
| fl_chart | Charts & analytics |

### Frontend Web
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| ShadCN UI | Component library |
| TanStack Query | Server state management |
| Recharts | Analytics charts |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| NestJS 10 | Node.js framework |
| TypeScript | Type safety |
| Prisma ORM | Database access & migrations |
| Passport.js | Authentication strategies |
| Socket.IO | WebSocket realtime communication |
| JWT | Token-based auth |
| Swagger | API documentation |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| PostgreSQL 16 | Primary database |
| Redis 7 | Caching & session store |
| AWS S3 | File storage |
| Firebase FCM | Push notifications |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Kubernetes | Orchestration |
| Terraform | Infrastructure as Code |
| GitHub Actions | CI/CD |
| Nginx | Reverse proxy & load balancer |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Flutter 3+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Web Dashboard
cd ../web
npm install

# Mobile App
cd ../mobile
flutter pub get
```

### 2. Environment Configuration

```bash
# Backend (.env)
DATABASE_URL=postgresql://campus:campus123@localhost:5432/campus_erp
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
REDIS_HOST=localhost
REDIS_PORT=6379
AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET=campus-erp-uploads

# Web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Run Development

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Start backend
cd backend
npm run start:dev

# Start web dashboard
cd web
npm run dev

# Start mobile (choose device)
cd mobile
flutter run
```

### 4. Access Applications

| Application | URL |
|-------------|-----|
| Web Dashboard | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger Docs | http://localhost:4000/api/docs |
| WebSocket | ws://localhost:4000/ws |

### 5. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | admin123 |
| Faculty | sharma@campus.edu | faculty123 |
| Student | rahul@campus.edu | student123 |

## 📁 Project Structure

```
campus-erp/
├── backend/                    # NestJS API Server
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (35+ models)
│   │   └── seed.ts             # Database seeder
│   └── src/
│       ├── main.ts             # Entry point with Swagger
│       ├── app.module.ts       # Root module
│       ├── auth/               # Auth module (JWT, OTP, RBAC)
│       ├── modules/            # Business modules (18 modules)
│       ├── common/             # Guards, decorators, interceptors
│       ├── config/             # Redis, S3, Firebase configs
│       ├── ai/                 # AI module (7 sub-modules)
│       ├── realtime/           # WebSocket, Push notifications
│       └── database/           # Prisma service
├── web/                        # Next.js Dashboard
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (dashboard)/    # Protected dashboard pages
│   │   │   └── auth/           # Auth pages
│   │   ├── components/
│   │   │   ├── ui/             # ShadCN UI components
│   │   │   ├── layout/         # Sidebar, header, shell
│   │   │   └── charts/         # Analytics charts
│   │   ├── lib/                # API client, auth, utils
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript types
│   └── public/
├── mobile/                     # Flutter Mobile App
│   └── lib/
│       ├── main.dart
│       ├── app/                # App entry & routing
│       ├── core/               # Theme, network, constants
│       └── features/           # Feature modules
└── infra/                      # Infrastructure
    ├── docker/                 # Dockerfiles, compose, nginx
    ├── k8s/                    # Kubernetes manifests
    ├── ci-cd/                  # GitHub Actions pipeline
    └── terraform/              # AWS IaC
```

## 🔒 Security

- **JWT with refresh tokens** — Short-lived access tokens with secure refresh
- **RBAC** — Role-based access control at API level
- **Password hashing** — bcrypt with 12 salt rounds
- **Rate limiting** — Throttling on all API endpoints
- **Helmet** — HTTP security headers
- **Input validation** — Class-validator with whitelist mode
- **SQL injection prevention** — Prisma parameterized queries
- **Audit logging** — All sensitive actions logged
- **CORS** — Strict origin configuration
- **File validation** — Type and size validation on uploads

## 📊 API Documentation

Once running, visit `http://localhost:4000/api/docs` for interactive Swagger documentation with:
- All endpoints with request/response schemas
- Authentication (Authorize button for JWT)
- Try-it-out functionality
- Model definitions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

Built with ❤️ using NestJS, Next.js, Flutter, PostgreSQL, and AI
