import type { Email } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function fetchEmails(category?: string): Promise<Email[]> {
  const params = new URLSearchParams();
  if (category && category !== "All") {
    params.set("category", category);
  }
  const res = await fetch(`${API_BASE}/api/emails?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch emails");
  }
  return res.json();
}

export async function ingestMockEmails() {
  const res = await fetch(`${API_BASE}/api/emails/ingest`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to ingest emails");
  }
  return res.json();
}

export async function resummarizeEmail(id: number): Promise<Email> {
  const res = await fetch(`${API_BASE}/api/emails/${id}/resummarize`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to resummarize email");
  }
  return res.json();
}

export async function deleteEmail(id: number) {
  const res = await fetch(`${API_BASE}/api/emails/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete email");
  }
  return res.json();
}

export function exportCsvUrl() {
  return `${API_BASE}/api/emails/export`;
}
