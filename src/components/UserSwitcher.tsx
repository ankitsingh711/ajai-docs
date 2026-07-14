"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { avatarColor, initials } from "@/lib/avatar";

type User = { id: string; name: string; email: string };

// Stands in for real auth: lets the reviewer switch between seeded users to
// exercise the sharing flow (owner vs. recipient view) without a login form.
export default function UserSwitcher() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleChange(userId: string) {
    setLoading(true);
    setOpen(false);
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

  const current = users.find((u) => u.id === currentUserId) ?? users[0];

  return (
    <div className="user-switcher-wrap" ref={wrapRef}>
      <button
        className="user-switcher-trigger"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        aria-label="Switch mocked user"
      >
        <span className="avatar" style={{ background: avatarColor(current.name) }}>
          {initials(current.name)}
        </span>
        {current.name}
        <ChevronIcon />
      </button>

      {open && (
        <div className="user-switcher-menu">
          {users.map((u) => (
            <button
              key={u.id}
              className={`user-switcher-item ${u.id === current.id ? "is-active" : ""}`}
              onClick={() => handleChange(u.id)}
            >
              <span className="avatar avatar-sm" style={{ background: avatarColor(u.name) }}>
                {initials(u.name)}
              </span>
              <span>
                <div className="name">{u.name}</div>
                <div className="email">{u.email}</div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
