# Hairdrama Task Manager

A simple full-stack task management web application developed for the
Hairdrama Tech internship assignment.

The application allows users to sign in with Google, create tasks,
assign tasks to other registered users, track task status, and receive
Gmail notifications when tasks are assigned and completed.

## Project Status

The core application is completed and tested locally.

Completed: - Google OAuth login - User profile creation and management -
Task creation - Task assignment to other registered users - Task
listing - Task completion - Gmail notification when a task is created
and assigned - Gmail notification when a task is completed - Supabase
PostgreSQL database - Flask backend API - Next.js + TypeScript
frontend - Database migration file - Environment variable example
files - Project documentation

Remaining: - Production deployment - Production OAuth and environment
configuration - Final live application testing - Loom walkthrough
video - Final internship submission

## Features

### Authentication

-   Google OAuth 2.0 login through Supabase Authentication.
-   OAuth callback route handles the Google authentication response.
-   User profile is created in the `profiles` table after successful
    login.
-   Logout functionality is available from the dashboard.

### User Management

-   Registered users are stored in the Supabase `profiles` table.
-   Users can view registered users when assigning a task.
-   A task can be assigned to another registered user.

### Task Management

Users can: - Create a task. - Add a task title. - Add an optional task
description. - Assign the task to a registered user. - View tasks they
created or were assigned. - Mark pending tasks as completed. - View the
current task status.

Task statuses used by the application: - `pending` - `completed`

### Email Notifications

Gmail SMTP is integrated into the Flask backend using a Gmail App
Password.

When a new task is created: - The assigned user receives an email
notification. - The email contains the task title and description.

When a task is completed: - The task creator receives an email
notification. - The email contains the completed task details.

Email credentials are stored in environment variables and are not
committed to GitHub.

## Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Supabase JavaScript Client
-   Supabase SSR

### Backend

-   Python
-   Flask
-   Flask-CORS
-   python-dotenv
-   Supabase Python Client
-   Python `smtplib`
-   Python `email.message`

### Database

-   Supabase
-   PostgreSQL

### Authentication

-   Supabase Authentication
-   Google OAuth 2.0

### Email

-   Gmail SMTP
-   Gmail App Password

### Deployment

Planned production deployment: - Frontend: Vercel - Backend: Render or
Railway - Database and authentication: Supabase

## Architecture

``` text
                         User
                          |
                          v
                Next.js Frontend
                 React + TypeScript
                          |
             +------------+------------+
             |                         |
             v                         v
       Google OAuth              Flask Backend
       via Supabase              REST API
                                       |
                          +------------+------------+
                          |                         |
                          v                         v
                   Supabase PostgreSQL         Gmail SMTP
                   Profiles + Tasks          Notifications
```

### Application Flow

``` text
User
 |
 | Google Login
 v
Supabase Authentication
 |
 | Successful authentication
 v
Next.js Dashboard
 |
 | Create / View / Complete Task
 v
Flask API
 |
 +----------------------+
 |                      |
 v                      v
Supabase Database      Gmail SMTP
 |                      |
 v                      v
Task / User Data       Email Notification
```

## Project Structure

``` text
Hairdrama-Task-Manager/
│
├── backend/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── .env
│   ├── .env.example
│   ├── app.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── public/
│   ├── .env.local
│   ├── .env.example
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## Backend API

The Flask backend currently provides the following endpoints.

### Health Check

``` text
GET /
```

Returns a message confirming that the API is running.

### Get Users

``` text
GET /users
```

Returns registered users from the `profiles` table.

### Get Tasks

``` text
GET /tasks?user_id=<user_id>
```

Returns tasks created by or assigned to the specified user.

### Create Task

``` text
POST /tasks
```

Creates a new task and sends a Gmail notification to the assigned user.

Example request:

``` json
{
  "title": "Complete Hairdrama Assignment",
  "description": "Complete the task manager application.",
  "assigned_to": "user-id",
  "created_by": "user-id"
}
```

### Complete Task

``` text
PATCH /tasks/<task_id>/complete
```

Changes the task status to `completed`, records the completion time, and
sends a Gmail notification to the task creator.

## Database Schema

The application uses two main tables.

### `profiles`

Stores registered user information.

  Column         Type          Description
  -------------- ------------- -------------------------
  `id`           UUID          References `auth.users`
  `email`        text          User email
  `full_name`    text          User name
  `created_at`   timestamptz   Profile creation time

### `tasks`

Stores task information.

  Column           Type          Description
  ---------------- ------------- ---------------------------
  `id`             UUID          Unique task ID
  `title`          text          Task title
  `description`    text          Task description
  `assigned_to`    UUID          User assigned to the task
  `created_by`     UUID          User who created the task
  `status`         text          Pending or completed
  `created_at`     timestamptz   Task creation time
  `completed_at`   timestamptz   Task completion time

The database schema and Row Level Security policies are documented in:

``` text
backend/migrations/001_initial_schema.sql
```

## Row Level Security

Row Level Security is enabled for the application tables.

The database policies allow: - Authenticated users to view profiles. -
Users to insert their own profile. - Users to view tasks they created or
were assigned. - Authenticated users to create tasks as the creator. -
Task creators and assigned users to update tasks.

The Flask backend uses the Supabase service role for server-side
database operations. The service role key is kept only in the backend
environment and is never exposed to the frontend.

## Environment Variables

Real credentials are stored locally and must never be committed to
GitHub.

### Backend

Create:

``` text
backend/.env
```

Required variables:

``` env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GMAIL_EMAIL=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
```

A safe template is available at:

``` text
backend/.env.example
```

### Frontend

Create:

``` text
frontend/.env.local
```

Required variables:

``` env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

A safe template is available at:

``` text
frontend/.env.example
```

## Google OAuth Configuration

Google OAuth is configured through Supabase Authentication.

The local development application uses:

``` text
http://localhost:3000
```

The OAuth callback route is:

``` text
/auth/callback
```

The Next.js callback implementation exchanges the OAuth code for a
Supabase session and creates the user's profile when required.

For production deployment, the production frontend URL and OAuth
callback URL must also be added to the Google Cloud and Supabase
authentication settings.

## Gmail Configuration

Gmail SMTP is used for application email notifications.

A Gmail App Password is used instead of the normal Gmail account
password.

The App Password is stored only in:

``` text
backend/.env
```

It must never be committed to GitHub or included in source code.

## Local Setup

### Prerequisites

Install:

-   Node.js
-   npm
-   Python 3.11 or compatible Python version
-   Git

### Backend Setup

Open a terminal in the project root:

``` bash
cd backend
```

Create or activate the Python virtual environment.

Windows PowerShell:

``` powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

``` bash
pip install -r requirements.txt
```

Configure:

``` text
backend/.env
```

Then start Flask:

``` bash
python app.py
```

The backend runs locally at:

``` text
http://127.0.0.1:5000
```

### Frontend Setup

Open another terminal:

``` bash
cd frontend
```

Install dependencies:

``` bash
npm install
```

Configure:

``` text
frontend/.env.local
```

Start Next.js:

``` bash
npm run dev
```

The frontend runs locally at:

``` text
http://localhost:3000
```

## Local Testing Completed

The following functionality has been tested locally:

-   Google login successfully redirects to the dashboard.
-   User information is loaded after login.
-   Registered users are retrieved from the backend.
-   Users can create tasks.
-   Tasks are stored in Supabase.
-   Tasks can be assigned to registered users.
-   Created and assigned tasks are displayed on the dashboard.
-   Tasks can be marked as completed.
-   Completed tasks display the `completed` status.
-   Gmail task assignment notifications work.
-   Gmail task completion notifications work.
-   Flask backend responds successfully.
-   Next.js frontend communicates with the Flask backend successfully.

## Git and Security

The project excludes sensitive and generated files from Git using
`.gitignore`.

The following are not intended to be committed:

``` text
backend/.env
backend/venv/
frontend/.env.local
frontend/node_modules/
frontend/.next/
```

The following safe configuration templates are included:

``` text
backend/.env.example
frontend/.env.example
```

## Database Migration

The initial database schema is documented in:

``` text
backend/migrations/001_initial_schema.sql
```

The migration contains: - `profiles` table - `tasks` table - Foreign key
relationships - Row Level Security - RLS policies - Service role
database grants

The migration file documents the database setup used for this project.
It should not be executed again on the already-created production/local
Supabase project without checking the current database state first.

## Deployment Plan

The production deployment will use:

``` text
Frontend  -> Vercel
Backend   -> Render or Railway
Database  -> Supabase
Auth      -> Supabase + Google OAuth
Email     -> Gmail SMTP
```

After deployment, the following production configuration is required:

1.  Deploy the Flask backend.
2.  Add backend environment variables on the hosting platform.
3.  Deploy the Next.js frontend to Vercel.
4.  Add frontend production environment variables.
5.  Update the frontend API URL to the deployed Flask backend.
6.  Add the Vercel production URL to Supabase authentication settings.
7.  Add the production OAuth redirect URL to Google Cloud OAuth
    settings.
8.  Test Google login on the live application.
9.  Test task creation and assignment.
10. Test Gmail notifications.
11. Test task completion.
12. Verify the final live application URL.

## Internship Assignment Requirements Covered

The application addresses the requested core requirements:

-   User account creation/login using Google OAuth/Gmail.
-   Task creation.
-   Assigning tasks to other users.
-   Email notification when a task is created/assigned.
-   Email notification when a task is completed.
-   Supabase database.
-   Flask backend.
-   Next.js + TypeScript frontend.
-   Gmail integration.
-   Production deployment target.
-   GitHub project structure.
-   Database migrations.
-   Environment variable example files.
-   Project architecture documentation.

## Author

Nithin Bollineni.

Developed for the Hairdrama Tech internship assignment.

## License

This project was created for educational and internship evaluation
purposes.
