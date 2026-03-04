"use client";

import { useEffect, useState } from "react";
import { UserPlus, Trash2, ShieldCheck, User, Loader2 } from "lucide-react";

import { apiFetchJson } from "./api";
import type { PageMember, PageMembersResponse, InviteMemberResponse } from "./types";

export function PageMembersPanel({
  pageId,
  token,
  isAdmin,
}: {
  pageId: string;
  token: string;
  isAdmin: boolean;
}) {
  const [members, setMembers] = useState<PageMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadMembers() {
    try {
      const res = await apiFetchJson<PageMembersResponse>(
        `/api/pages/${pageId}/members`,
        { token, method: "GET" },
      );
      setMembers(res.members || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    setSuccess(null);
    setInviting(true);
    try {
      const res = await apiFetchJson<InviteMemberResponse>(
        `/api/pages/${pageId}/members`,
        { token, method: "POST", body: { email: trimmed } },
      );
      setMembers((prev) => {
        const exists = prev.some((m) => m.user_id === res.member.user_id);
        return exists ? prev : [...prev, res.member];
      });
      setEmail("");
      setSuccess(`${res.member.email ?? trimmed} added successfully`);
    } catch (e: any) {
      setError(e?.message || "Failed to add member");
    } finally {
      setInviting(false);
    }
  }

  async function remove(userId: string) {
    setError(null);
    setRemoving(userId);
    try {
      await apiFetchJson<{ ok: true }>(
        `/api/pages/${pageId}/members/${userId}`,
        { token, method: "DELETE" },
      );
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch (e: any) {
      setError(e?.message || "Failed to remove member");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Member list */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500 py-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading members…
        </div>
      ) : members.length === 0 ? (
        <div className="text-sm text-neutral-500">No members yet.</div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {m.role === "admin" ? (
                  <ShieldCheck className="w-4 h-4 text-primary-500 shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {m.display_name ?? m.email ?? m.user_id}
                  </div>
                  {m.display_name && m.email && (
                    <div className="text-xs text-neutral-500 truncate">{m.email}</div>
                  )}
                </div>
                <span
                  className={`ml-1 text-xs px-1.5 py-0.5 rounded-full border shrink-0 ${
                    m.role === "admin"
                      ? "bg-primary-50 text-primary-700 border-primary-200"
                      : "bg-neutral-100 text-neutral-600 border-neutral-200"
                  }`}
                >
                  {m.role}
                </span>
              </div>

              {isAdmin && m.role !== "admin" && (
                <button
                  onClick={() => remove(m.user_id)}
                  disabled={removing === m.user_id}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 disabled:opacity-50 transition-colors"
                >
                  {removing === m.user_id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Invite form — admins only */}
      {isAdmin && (
        <form onSubmit={invite} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Employee email address"
            className="flex-1 min-w-0 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <button
            type="submit"
            disabled={inviting || !email.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {inviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Add
          </button>
        </form>
      )}

      {error && <div className="text-sm text-rose-600">{error}</div>}
      {success && <div className="text-sm text-emerald-600">{success}</div>}
    </div>
  );
}
