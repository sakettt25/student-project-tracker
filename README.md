# Student Project Tracker

A comprehensive web application for managing student projects and faculty reviews, built with Next.js and modern web technologies.

## Features

### For Students
- **Project Submission**: Submit new projects with detailed information including description, tech stack, and real-life applications
- **Progress Tracking**: Update and monitor project progress with percentage completion
- **Status Monitoring**: Track project status (pending, approved, rejected, in review)
- **Feedback Management**: Receive and view faculty feedback on submitted projects
- **Dashboard Overview**: View project statistics and recent activity

### For Faculty
- **Project Review**: Review and evaluate student project submissions
- **Feedback System**: Provide detailed feedback and approve/reject projects
- **Progress Monitoring**: Track student progress across all assigned projects
- **Student Management**: View and manage students assigned to faculty
- **Analytics Dashboard**: Monitor project statistics and completion rates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Icons**: Lucide React
- **State Management**: React hooks and context

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── projects/             # Project-related endpoints
│   │   └── progress-updates/     # Progress update endpoints
│   ├── auth/                     # Authentication pages
│   ├── faculty/                  # Faculty-specific pages
│   │   ├── dashboard/            # Faculty dashboard
│   │   ├── progress/             # Student progress tracking
│   │   └── project-review/       # Project review interface
│   ├── student/                  # Student-specific pages
│   │   ├── dashboard/            # Student dashboard
│   │   ├── progress/             # Progress tracking
│   │   └── projects/             # Project management
│   └── layout.tsx                # Root layout
├── components/                   # Reusable components
│   ├── ui/                       # UI components (shadcn/ui)
│   ├── faculty-navbar.tsx        # Faculty navigation
│   └── student-navbar.tsx        # Student navigation
├── lib/                          # Utility libraries
│   ├── models/                   # Database models
│   │   ├── User.ts               # User model
│   │   ├── Project.ts            # Project model
│   │   ├── Feedback.ts           # Feedback model
│   │   └── ProgressUpdate.ts     # Progress update model
│   ├── auth.tsx                  # Authentication context
│   └── mongodb.ts                # Database connection
└── hooks/                        # Custom React hooks
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-project-tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/student-project-tracker
   JWT_SECRET=your-jwt-secret-key
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - Get all projects (filtered by user role)
- `POST /api/projects` - Create new project (students only)
- `GET /api/projects/[id]` - Get specific project
- `PATCH /api/projects/[id]` - Update project
- `PATCH /api/projects/[id]/status` - Update project status (faculty only)

### Progress Updates
- `GET /api/progress-updates` - Get progress updates for a project
- `POST /api/progress-updates` - Create new progress update (students only)

## Database Models

### User Model
```typescript
interface IUser {
  email: string
  password: string
  role: "student" | "faculty"
  name: string
  university?: string
  rollNumber?: string
  semester?: string
  facultyId?: ObjectId  // For students
}
```

### Project Model
```typescript
interface IProject {
  studentId: ObjectId
  facultyId: ObjectId
  name: string
  description: string
  techStack: string
  realLifeApplication: string
  expectedCompletionDate: Date
  status: "pending" | "approved" | "rejected" | "evaluated"
  progress: number
  feedback: IFeedback[]
  evaluation?: IEvaluation
}
```

### Progress Update Model
```typescript
interface IProgressUpdate {
  projectId: ObjectId
  studentId: ObjectId
  updateText: string
  date: Date
}
```

## User Roles & Permissions

### Students
- Submit new projects
- Update project progress
- View project status and feedback
- Track project completion

### Faculty
- Review student projects
- Approve/reject submissions
- Provide feedback
- Monitor student progress
- Evaluate completed projects

## Features in Detail

### Project Submission Flow
1. Students submit projects with required details
2. Projects are assigned to faculty (either pre-assigned or default)
3. Faculty reviews and provides feedback
4. Projects can be approved, rejected, or require modifications
5. Approved projects can be tracked for progress

### Progress Tracking
- Students can add progress updates with percentage completion
- Faculty can monitor real-time progress across all students
- Visual progress indicators and completion tracking
- Historical progress updates maintained

### Feedback System
- Rich feedback interface for faculty
- Students receive detailed feedback on submissions
- Feedback history maintained for each project
- Status-based feedback (approval/rejection reasons)

## Development

### Key Components
- [`StudentDashboard`](app/student/dashboard/page.tsx) - Main student interface
- [`FacultyDashboard`](app/faculty/dashboard/page.tsx) - Faculty overview
- [`ProjectReview`](app/faculty/project-review/page.tsx) - Project evaluation interface
- [`StudentProgress`](app/student/progress/page.tsx) - Progress tracking

### Authentication
The app uses JWT-based authentication with role-based access control. See [`lib/auth.tsx`](lib/auth.tsx) for implementation details.

### Database Connection
MongoDB connection is handled in [`lib/mongodb.ts`](lib/mongodb.ts) using Mongoose ODM.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please create an issue in the repository or contact the development team.
