# Hairdrama Task Manager

A full-stack task management web application developed for the Hairdrama
Tech internship assignment.

## Overview

Hairdrama Task Manager allows authenticated users to sign in with
Google, create tasks, assign tasks to other registered users, view their
tasks, mark tasks as completed, and receive Gmail notifications when
tasks are assigned or completed.

The implementation focuses on the requested internship requirements
without adding unrelated AI, analytics, chatbot, or unnecessary modules.

## Features

### Google Authentication

-   Google OAuth 2.0 login through Supabase Auth
-   Next.js OAuth callback route
-   Automatic profile creation after successful authentication
-   Authenticated dashboard
-   User logout

### User Management

-   User profiles stored in Supabase
-   Stores user ID, email, full name, and creation time
-   Registered users can be selected as task assignees

### Task Management

-   Create tasks
-   Add title and optional description
-   Assign tasks to registered users
-   Track task creator and assignee
-   Pending and completed task status
-   Store task creation and completion timestamps
-   View tasks created by the current user
-   View tasks assigned to the current user
-   Prevent an already completed task from being completed again

### Gmail Notifications

Gmail SMTP is integrated with a Gmail App Password.

When a task is created: 1. The task is saved in Supabase. 2. The
assigned user's profile is retrieved. 3. A Gmail notification is sent to
the assigned user.

When a task is completed: 1. The existing task is retrieved. 2. The task
status is changed to completed. 3. The completion timestamp is stored.
4. The creator's profile is retrieved. 5. A Gmail notification is sent
to the task creator.

The API also returns whether the email was sent successfully and
includes an email error when delivery fails.

## Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Supabase JavaScript client
-   Supabase SSR
-   Next.js App Router

### Backend

-   Python
-   Flask
-   Flask-CORS
-   python-dotenv
-   Supabase Python client
-   Python smtplib
-   Python EmailMessage

### Database and Authentication

-   Supabase PostgreSQL
-   Supabase Auth
-   Google OAuth 2.0

### Email

-   Gmail SMTP
-   Gmail App Password

### Version Control

-   Git
-   GitHub

### Production Deployment

-   Vercel for the Next.js frontend
-   Render for the Flask backend
-   Supabase for database and authentication

## Architecture

``` text
                         User
                          |
                          v
                 Next.js Frontend
                 React + TypeScript
                          |
                   Google OAuth
                          |
                          v
                   Supabase Auth
                          |
                          v
                      Dashboard
                          |
                       REST API
                          |
                          v
                   Flask Backend
                    Python/Flask
                     /                           /                            v           v
             Supabase       Gmail SMTP
             PostgreSQL     Notifications
              /                  v       v
        profiles    tasks
```

## Authentication Flow

``` text
User
  |
  v
Next.js Login Page
  |
  v
Supabase signInWithOAuth()
  |
  v
Google OAuth
  |
  v
Supabase Auth
  |
  v
/ auth / callback
  |
  +-- Exchange OAuth code for session
  +-- Check profiles table
  +-- Create profile if needed
  |
  v
Dashboard
```

## Task Creation Flow

``` text
User creates task
       |
       v
Next.js Dashboard
       |
       v
POST /tasks
       |
       v
Flask Backend
       |
       +----> Insert task into Supabase
       |
       +----> Get assigned user's email
       |
       v
Gmail SMTP
       |
       v
Assigned user receives notification
```

## Task Completion Flow

``` text
Assigned user selects Mark Completed
       |
       v
PATCH /tasks/<task_id>/complete
       |
       v
Flask Backend
       |
       +----> Check task status
       +----> Update status
       +----> Store completed_at
       +----> Get creator email
       |
       v
Gmail SMTP
       |
       v
Task creator receives notification
```

## Project Structure

``` text
hairdrama-task-manager/
|
+-- backend/
|   +-- app.py
|   +-- requirements.txt
|   +-- .env.example
|   |
|   +-- migrations/
|       +-- 001_initial_schema.sql
|
+-- frontend/
|   +-- app/
|   |   +-- auth/
|   |   |   +-- callback/
|   |   |       +-- route.ts
|   |   |
|   |   +-- dashboard/
|   |   |   +-- page.tsx
|   |   |
|   |   +-- globals.css
|   |   +-- layout.tsx
|   |   +-- page.tsx
|   |
|   +-- lib/
|   |   +-- supabase.ts
|   |
|   +-- .env.example
|   +-- package.json
|   +-- package-lock.json
|   +-- next.config.ts
|   +-- tsconfig.json
|
+-- .gitignore
+-- README.md
```

## Database Design

The application uses two main tables.

### profiles

  Column       Type          Description
  ------------ ------------- ----------------------------------------
  id           UUID          References authenticated Supabase user
  email        TEXT          User email
  full_name    TEXT          User full name
  created_at   TIMESTAMPTZ   Profile creation time

The `id` references `auth.users(id)` with cascading deletion.

### tasks

  Column         Type          Description
  -------------- ------------- ---------------------------
  id             UUID          Unique task ID
  title          TEXT          Task title
  description    TEXT          Optional task description
  assigned_to    UUID          User receiving the task
  created_by     UUID          User creating the task
  status         TEXT          Current task status
  created_at     TIMESTAMPTZ   Task creation time
  completed_at   TIMESTAMPTZ   Task completion time

`assigned_to` and `created_by` reference the `profiles` table.

## Row Level Security

Row Level Security is enabled on both application tables.

### Profiles

-   Authenticated users can view profiles.
-   Users can insert their own profile.

### Tasks

-   Users can view tasks they created or tasks assigned to them.
-   Authenticated users can create tasks where they are the creator.
-   The assigned user or creator can update a task.

The Flask backend uses the Supabase service role for server-side
database operations. The frontend uses the Supabase publishable key for
authentication.

## Backend API

### Health Check

``` text
GET /
```

Returns:

``` json
{
  "message": "Hairdrama Task Manager API is running"
}
```

### Get Users

``` text
GET /users
```

Returns registered user profiles available for task assignment.

### Get Tasks

``` text
GET /tasks?user_id=<user_id>
```

Returns tasks created by or assigned to the specified user.

### Create Task

``` text
POST /tasks
```

Example body:

``` json
{
  "title": "Complete assignment",
  "description": "Finish the Hairdrama internship assignment",
  "assigned_to": "USER_UUID",
  "created_by": "USER_UUID"
}
```

The endpoint validates required values, creates the task, retrieves the
assignee's email, sends the Gmail notification, and returns the task and
email delivery status.

### Complete Task

``` text
PATCH /tasks/<task_id>/complete
```

The endpoint checks the task, updates its status, stores the completion
timestamp, retrieves the creator's email, and sends the completion
notification.

## Environment Variables

### Backend

Create `backend/.env`:

``` env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GMAIL_EMAIL=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### Frontend

Create `frontend/.env.local`:

``` env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

Real secrets are intentionally excluded from GitHub. The repository
contains `.env.example` files with placeholders.

## Google OAuth Configuration

Google authentication is configured through Supabase Auth.

The production setup requires the deployed frontend URL to be added to
the appropriate Supabase and Google OAuth redirect/origin settings.

## Gmail Configuration

The Flask backend sends mail using:

``` text
SMTP host: smtp.gmail.com
SMTP port: 465
Security: SMTP over SSL
Authentication: Gmail App Password
```

The normal Gmail account password is never stored in the project.

## Local Setup

### Backend

``` powershell
cd backend
python -m venv venv
.env\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend:

``` text
http://127.0.0.1:5000
```

### Frontend

Open another terminal:

``` powershell
cd frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:3000
```

## Complete User Workflow

``` text
Google Login
     |
     v
Dashboard
     |
     v
Select registered user
     |
     v
Create task
     |
     v
Task saved in Supabase
     |
     v
Email sent to assigned user
     |
     v
Assigned user views task
     |
     v
Mark task completed
     |
     v
Task updated in Supabase
     |
     v
Email sent to task creator
```

## Testing Completed

The main application workflow has been tested locally.

### Authentication

-   Google OAuth configured
-   Google login successfully tested
-   Dashboard access tested
-   User profiles created in Supabase

### Tasks

-   Task creation tested
-   Task descriptions tested
-   Task assignment tested
-   Task listing tested
-   Task completion tested
-   Completion timestamp tested
-   Duplicate completion prevented

### Gmail

-   New task notification tested successfully
-   Task completion notification tested successfully
-   Gmail SMTP App Password authentication tested

### Supabase

-   `profiles` table created
-   `tasks` table created
-   Foreign key relationships configured
-   RLS enabled and policies configured
-   Migration file included

## Security

-   Real `.env` files are excluded from Git.
-   The Supabase service role key is never stored in frontend code.
-   The frontend uses the Supabase publishable key.
-   Gmail uses an App Password.
-   `backend/venv/`, `frontend/node_modules/`, and Next.js build files
    are excluded from Git.
-   Supabase Row Level Security is enabled.

## GitHub Repository

Repository:

https://github.com/Nithin3117/hairdrama-task-manager

The project is maintained on the `main` branch.

## Production Deployment

The planned production architecture is:

``` text
User
 |
 v
Vercel
Next.js Frontend
 |
 | HTTPS API
 v
Render
Flask Backend
 |
 +------------------+
 |                  |
 v                  v
Supabase           Gmail
Database/Auth      SMTP
```

Production configuration will include:

-   Vercel frontend environment variables
-   Render backend environment variables
-   Supabase production Site URL
-   Supabase production redirect URL
-   Google OAuth production origin
-   Google OAuth production redirect URI
-   Frontend API URL pointing to the deployed Flask backend
-   Production CORS configuration

## Assignment Requirements Covered

-   Google OAuth / Gmail login
-   User accounts
-   User profiles
-   Task creation
-   Task assignment
-   Task completion
-   Task status tracking
-   Gmail notification when a task is created
-   Gmail notification when a task is completed
-   Supabase database
-   Flask backend
-   Next.js frontend
-   TypeScript
-   Database migration
-   `.env.example`
-   GitHub repository
-   Architecture documentation
-   Production deployment structure

## Project Status

### Completed

-   Google OAuth authentication
-   Supabase authentication
-   User profiles
-   Task creation
-   Task assignment
-   Task listing
-   Task completion
-   Completion timestamp
-   Gmail task assignment notification
-   Gmail task completion notification
-   Supabase schema
-   RLS policies
-   Flask REST API
-   Next.js and TypeScript frontend
-   Local end-to-end testing
-   GitHub repository
-   Root project documentation

### Remaining Production Steps

-   Deploy Flask backend
-   Deploy Next.js frontend
-   Configure production environment variables
-   Configure production OAuth URLs
-   Test the complete live application
-   Record the required Loom walkthrough
-   Submit the live application URL and Loom URL

## Author

**Nithin Bollineni**

GitHub: https://github.com/Nithin3117

## License

This project was developed as part of the Hairdrama Tech internship
assignment.
