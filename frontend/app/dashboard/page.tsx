"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type User = {
  id: string;
  email: string;
  full_name: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  created_by: string;
  status: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadData = async (currentUserId: string) => {
    try {
      const [usersResponse, tasksResponse] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/tasks?user_id=${currentUserId}`),
      ]);

      const usersData = await usersResponse.json();
      const tasksData = await tasksResponse.json();

      setUsers(usersData);
      setTasks(tasksData);

      if (!assignedTo && usersData.length > 0) {
        setAssignedTo(usersData[0].id);
      }
    } catch {
      alert("Unable to connect to the backend.");
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      await loadData(user.id);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !assignedTo) {
      alert("Please enter a title and select a user.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          assigned_to: assignedTo,
          created_by: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create task");
      }

      setTitle("");
      setDescription("");

      await loadData(userId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}/complete`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete task");
      }

      await loadData(userId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to complete task");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between rounded-xl bg-white p-6 shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Task Dashboard
            </h1>
            <p className="mt-1 text-gray-600">{email}</p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Logout
          </button>
        </header>

        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Task
          </h2>

          <form onSubmit={createTask} className="mt-4 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-black"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-black"
            />

            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >
              <option value="">Select user</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Task"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            My Tasks
          </h2>

          {tasks.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No tasks available.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {tasks.map((task) => {
                const assignedUser = users.find(
                  (user) => user.id === task.assigned_to
                );

                return (
                  <div
                    key={task.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="mt-1 text-gray-600">
                            {task.description}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-gray-500">
                          Assigned to:{" "}
                          {assignedUser?.full_name ||
                            assignedUser?.email ||
                            "User"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {task.status !== "completed" && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}