"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string };

// Stands in for real auth: lets the reviewer switch between seeded users to
// exercise the sharing flow (owner vs. recipient view) without a login form.
export default function UserSwitcher() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setCurrentUserId(data.currentUserId ?? null);
      })
      .catch(() => {});
  }, []);

  async function handleChange(userId: string) {
    setLoading(true);
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setCurrentUserId(userId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (users.length === 0) return null;

  return (
    <select
      className="user-switcher"
      value={currentUserId ?? ""}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Switch mocked user"
    >
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name} ({u.email})
        </option>
      ))}
    </select>
  );
}
