import React, { useEffect, useState } from "react";
import type { Email } from "./types";
import {
  fetchEmails,
  ingestMockEmails,
  resummarizeEmail,
  deleteEmail,
  exportCsvUrl,
} from "./api";

const categories = [
  "All",
  "Meeting",
  "Invoice",
  "Support Request",
  "Promotion",
  "General",
];

function App() {
  console.log(
    "API Base URL:",
    exportCsvUrl().replace(/\/api\/emails\/export$/, "")
  );
  const [emails, setEmails] = useState<Email[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const loadEmails = async (selectedCategory = category) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmails(selectedCategory);
      setEmails(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [category]);

  const handleIngest = async () => {
    try {
      setIngesting(true);
      setError(null);
      await ingestMockEmails();
      await loadEmails("All");
      setCategory("All");
    } catch (err: any) {
      setError(err.message || "Failed to ingest emails");
    } finally {
      setIngesting(false);
    }
  };

  const handleResummarize = async (id: number) => {
    try {
      setActiveId(id);
      setError(null);
      const updated = await resummarizeEmail(id);
      setEmails((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch (err: any) {
      setError(err.message || "Failed to resummarize email");
    } finally {
      setActiveId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActiveId(id);
      setError(null);
      await deleteEmail(id);
      setEmails((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete email");
    } finally {
      setActiveId(null);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 600 }}>
          AI Email Summarizer Dashboard
        </h1>
        <p style={{ color: "#555" }}>
          View summarized emails, filter by category, re-summarize or delete
          entries.
        </p>
      </header>

      <section
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleIngest}
          disabled={ingesting}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: 500,
          }}
        >
          {ingesting ? "Running workflow..." : "Run summarization workflow"}
        </button>

        <label>
          Category:{" "}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <a
          href={exportCsvUrl()}
          target="_blank"
          rel="noreferrer"
          style={{
            marginLeft: "auto",
            textDecoration: "none",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #ccc",
            color: "#111",
          }}
        >
          Export CSV
        </a>
      </section>

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            background: "#fee2e2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading emails...</p>
      ) : emails.length === 0 ? (
        <p style={{ color: "#555" }}>
          No emails yet. Click <strong>"Run summarization workflow"</strong> to
          process mock emails.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "700px",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Sender</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>
                  Subject
                </th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>
                  Summary
                </th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>
                  Category
                </th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr
                  key={email.id}
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    background:
                      activeId === email.id ? "#eff6ff" : "transparent",
                  }}
                >
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
                    {email.sender}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
                    {email.subject}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
                    {email.summary}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: "#e5e7eb",
                        fontSize: "0.8rem",
                      }}
                    >
                      {email.category}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleResummarize(email.id)}
                        disabled={activeId === email.id}
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: "#4b5563",
                          color: "white",
                          fontSize: "0.8rem",
                        }}
                      >
                        {activeId === email.id
                          ? "Re-summarizing..."
                          : "Re-summarize"}
                      </button>
                      <button
                        onClick={() => handleDelete(email.id)}
                        disabled={activeId === email.id}
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: "#b91c1c",
                          color: "white",
                          fontSize: "0.8rem",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
