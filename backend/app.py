import os
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

app = Flask(__name__)
CORS(app)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


def send_email(to_email, subject, body):
    try:
        message = EmailMessage()
        message["From"] = os.getenv("GMAIL_EMAIL")
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(
                os.getenv("GMAIL_EMAIL"),
                os.getenv("GMAIL_APP_PASSWORD")
            )
            smtp.send_message(message)

        return True, None

    except Exception as e:
        return False, str(e)


@app.get("/")
def home():
    return jsonify({"message": "Hairdrama Task Manager API is running"})


@app.get("/users")
def get_users():
    try:
        response = supabase.table("profiles").select(
            "id, email, full_name"
        ).execute()

        return jsonify(response.data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/tasks")
def get_tasks():
    try:
        user_id = request.args.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        response = supabase.table("tasks").select(
            "*"
        ).or_(
            f"created_by.eq.{user_id},assigned_to.eq.{user_id}"
        ).order(
            "created_at", desc=True
        ).execute()

        return jsonify(response.data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/tasks")
def create_task():
    try:
        data = request.get_json()

        title = data.get("title")
        description = data.get("description")
        assigned_to = data.get("assigned_to")
        created_by = data.get("created_by")

        if not title or not assigned_to or not created_by:
            return jsonify({
                "error": "title, assigned_to and created_by are required"
            }), 400

        response = supabase.table("tasks").insert({
            "title": title,
            "description": description,
            "assigned_to": assigned_to,
            "created_by": created_by,
            "status": "pending"
        }).execute()

        task = response.data[0]

        assigned_user = supabase.table("profiles").select(
            "email, full_name"
        ).eq(
            "id", assigned_to
        ).single().execute()

        assigned_email = assigned_user.data["email"]
        assigned_name = assigned_user.data.get("full_name") or "User"

        subject = "New Task Assigned - Hairdrama Task Manager"

        body = f"""Hello {assigned_name},

You have been assigned a new task in Hairdrama Task Manager.

Task: {title}

Description:
{description or "No description provided."}

Please log in to the Task Manager to view and complete the task.

Regards,
Hairdrama Task Manager
"""

        email_sent, email_error = send_email(
            assigned_email,
            subject,
            body
        )

        return jsonify({
            "task": task,
            "email_sent": email_sent,
            "email_error": email_error
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.patch("/tasks/<task_id>/complete")
def complete_task(task_id):
    try:
        existing_task = supabase.table("tasks").select(
            "id, title, description, assigned_to, created_by, status"
        ).eq(
            "id", task_id
        ).single().execute()

        task = existing_task.data

        if task["status"] == "completed":
            return jsonify({
                "error": "Task is already completed"
            }), 400

        completed_at = datetime.now(timezone.utc).isoformat()

        response = supabase.table("tasks").update({
            "status": "completed",
            "completed_at": completed_at
        }).eq(
            "id", task_id
        ).execute()

        creator = supabase.table("profiles").select(
            "email, full_name"
        ).eq(
            "id", task["created_by"]
        ).single().execute()

        creator_email = creator.data["email"]
        creator_name = creator.data.get("full_name") or "User"

        subject = "Task Completed - Hairdrama Task Manager"

        body = f"""Hello {creator_name},

Your task has been completed in Hairdrama Task Manager.

Task: {task["title"]}

Description:
{task["description"] or "No description provided."}

The task status has been updated to completed.

Regards,
Hairdrama Task Manager
"""

        email_sent, email_error = send_email(
            creator_email,
            subject,
            body
        )

        return jsonify({
            "task": response.data,
            "email_sent": email_sent,
            "email_error": email_error
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)