# Hairdrama Task Manager

A full-stack task management web application developed for the Hairdrama Tech internship assignment.

The application allows authenticated users to sign in with Google, create tasks, assign tasks to registered users, view tasks, mark tasks as completed, and receive Gmail notifications for task creation and completion.

## Features

- Google OAuth 2.0 authentication through Supabase Auth
- Automatic user profile creation
- Create tasks with title and description
- Assign tasks to registered users
- View created and assigned tasks
- Mark tasks as completed
- Store task creation and completion timestamps
- Gmail notification when a task is assigned
- Gmail notification when a task is completed

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase JavaScript client
- Supabase SSR
- Next.js App Router

### Backend
- Python
- Flask
- Flask-CORS
- python-dotenv
- Supabase Python client
- urllib.request for HTTPS email relay requests

### Database & Authentication
- Supabase PostgreSQL
- Supabase Auth
- Google OAuth 2.0

### Email
- Google Apps Script Web App
- Gmail / Google MailApp
- HTTPS email relay

### Deployment
- Vercel for frontend
- Render for backend
- Supabase for database and authentication

## Architecture

```text
User
  |
  v
Next.js + TypeScript
  |
  | Google OAuth
  v
Supabase Auth
  |
  v
Dashboard
  |
  | REST API
  v
Flask Backend
  |
  +---------> Supabase PostgreSQL
  |
  +---------> Google Apps Script
                    |
                    v
                  Gmail
```

## Task Workflow

### Create Task

```text
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
       +--> Save task in Supabase
       |
       +--> Get assigned user's email
       |
       +--> Send HTTPS request to Google Apps Script
                         |
                         v
                       Gmail
```

### Complete Task

```text
User selects Mark Completed
       |
       v
PATCH /tasks/<task_id>/complete
       |
       v
Flask Backend
       |
       +--> Update task status
       |
       +--> Store completed_at
       |
       +--> Get creator's email
       |
       +--> Send HTTPS request to Google Apps Script
                         |
                         v
                       Gmail
```

## Database

The application uses two main tables.

### profiles

| Column | Type | Purpose |
|---|---|---|
| id | UUID | References Supabase authenticated user |
| email | TEXT | User email |
| full_name | TEXT | User name |
| created_at | TIMESTAMPTZ | Profile creation time |

### tasks

| Column | Type | Purpose |
|---|---|---|
| id | UUID | Task ID |
| title | TEXT | Task title |
| description | TEXT | Task description |
| assigned_to | UUID | Assigned user |
| created_by | UUID | Task creator |
| status | TEXT | Pending/completed status |
| created_at | TIMESTAMPTZ | Creation time |
| completed_at | TIMESTAMPTZ | Completion time |

Row Level Security is enabled on the application tables. Users can access tasks they created or tasks assigned to them.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend health check |
| GET | `/users` | Get registered users |
| GET | `/tasks?user_id=<id>` | Get user's tasks |
| POST | `/tasks` | Create and assign a task |
| PATCH | `/tasks/<task_id>/complete` | Complete a task |

## Environment Variables

### Backend

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GMAIL_RELAY_URL=your_google_apps_script_web_app_url
GMAIL_RELAY_TOKEN=your_gmail_relay_token
```

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

Real secrets are excluded from GitHub.

## Project Structure

```text
hairdrama-task-manager/
|
+-- backend/
|   +-- app.py
|   +-- requirements.txt
|   +-- .env.example
|   +-- migrations/
|       +-- 001_initial_schema.sql
|
+-- frontend/
|   +-- app/
|   +-- lib/
|   +-- .env.example
|   +-- package.json
|
+-- .gitignore
+-- README.md
```

## Production

Frontend:

```text
https://hairdrama-task-manager-one.vercel.app
```

Backend:

```text
https://hairdrama-task-manager-api.onrender.com
```

The production application has been tested for:

- Google login
- Task creation
- Task assignment
- Task listing
- Task completion
- New-task Gmail notification
- Task-completion Gmail notification

## Security

- Real `.env` files are excluded from Git.
- Supabase service role key is used only by the backend.
- Frontend uses the Supabase publishable key.
- Gmail relay credentials are stored as environment variables.
- Supabase Row Level Security is enabled.
- Virtual environments, dependencies, and build files are excluded from Git.

## GitHub

Repository:

https://github.com/Nithin3117/hairdrama-task-manager

The project includes the backend, frontend, database migration, environment examples, and project documentation.

## Assignment Requirements Covered

- Google OAuth / Gmail login
- User accounts and profiles
- Task creation
- Task assignment
- Task completion
- Task status tracking
- Gmail notification when a task is created
- Gmail notification when a task is completed
- Supabase database
- Flask backend
- Next.js + TypeScript frontend
- Database migration
- `.env.example`
- GitHub repository
- Production deployment
- Architecture documentation

## Author

**Nithin Bollineni**

GitHub: https://github.com/Nithin3117
