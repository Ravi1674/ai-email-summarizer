# AI Email Summarizer Workflow

This project is a small full-stack workflow automation POC that:

- Loads a mock list of emails
- Uses OpenAI to generate 2–3 sentence summaries and categories
- Stores results in a Neon PostgreSQL database via Drizzle ORM
- Exposes a lightweight React dashboard to view and manage summarized emails
- Supports re-summarize, delete, and CSV export actions

This aligns with the **AI Email Summarizer Workflow** assignment.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: Neon PostgreSQL + Drizzle ORM
- **AI**: OpenAI Chat Completions API

---

## 1. Backend Setup

### 1.1. Environment

Create a Neon project and copy the PostgreSQL connection string.

Then in `backend/.env`:

```env
PORT=4000
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>
OPENAI_API_KEY=openai-api-key
CORS_ORIGIN=http://localhost:5173
```

> **Note:** For Replit, add these as **Secrets**.

### 1.2. Install & Run

```bash
cd backend
npm install
npm run drizzle:generate   # optional: generate SQL from schema
npm run drizzle:push       # create the emails table
npm run dev                # start the dev server on http://localhost:4000
```

### 1.3. API Overview

Base URL: `http://localhost:4000`

#### `GET /health`

Simple health check.

#### `GET /api/emails?category=Invoice`

Returns all stored emails, optionally filtered by category.

#### `POST /api/emails/ingest`

Runs the workflow on a mock list of emails:

1. Loads `mockEmails` from `src/data/mockEmails.ts`
2. Calls OpenAI to:
   - Summarize in 2–3 sentences
   - Assign a category (Meeting, Invoice, Support Request, Promotion, General)
3. Writes results into Neon via Drizzle
4. Returns created rows

#### `POST /api/emails/:id/resummarize`

Re-runs the OpenAI summarization and categorization for a single email and updates the row.

#### `DELETE /api/emails/:id`

Deletes a single email record.

#### `GET /api/emails/export`

Exports all email summaries as CSV.

---

## 2. Frontend Setup

### 2.1. Environment

Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:4000
```

For Replit, adjust the base URL to your backend URL.

### 2.2. Install & Run

```bash
cd frontend
npm install
npm run dev   # Vite dev server on http://localhost:5173
```

Open the URL in a browser.

---

## 3. Frontend UX

The React dashboard provides:

- **Run summarization workflow** button

  - Calls `POST /api/emails/ingest`
  - Populates the table with AI-generated summaries

- **Category filter dropdown**

  - Filters emails by Meeting / Invoice / Support Request / Promotion / General
  - Uses `GET /api/emails?category=...`

- **Table view**

  - Columns: Sender, Subject, Summary, Category, Actions

- **Actions**

  - **Re-summarize**: Calls `POST /api/emails/:id/resummarize`
  - **Delete**: Calls `DELETE /api/emails/:id`

- **Export CSV**
  - Opens the `/api/emails/export` endpoint to download a CSV file of all summaries

---

## 4. Design Decisions

### OpenAI Usage

- Uses `gpt-4o-mini` for cost-effective, fast summarization.
- Prompt asks for:
  - 2–3 sentence summary
  - One category from a fixed set
  - Strict JSON response (`summary`, `category`)

If parsing fails, the service falls back to a safe default summary and `General` category.

### Data Model

Single `emails` table:

- `id` (PK)
- `sender`
- `subject`
- `body`
- `summary`
- `category`
- `created_at`
- `updated_at`

This keeps the data model simple but extensible (e.g., adding keywords or PDF invoice metadata later).

### Workflow Logic

- Ingestion is manual (triggered by the button) to match the assignment scope.
- AI calls are done per email to keep prompts focused and maximize quality.

### Error Handling

- Backend catches and logs errors for each endpoint, returning friendly JSON messages.
- Frontend shows error banners at the top of the page.

---

## 5. Optional Extensions (How to Add)

The current structure makes it straightforward to add:

- **Keyword extraction step**

  - Add a new function in `src/services/openai.ts` to call OpenAI for keywords.
  - Store keywords in an array column or separate table via Drizzle.

- **PDF invoice parsing**
  - Add a `pdfUrl` or `hasInvoice` field to the emails table.
  - Add another route to simulate attaching a PDF and parse item–price pairs using an AI call.

---

## 6. Running in Replit

1. Create a new **Node.js** Replit for the backend:

   - Upload the `backend` folder contents.
   - Set environment variables (DATABASE_URL, OPENAI_API_KEY, CORS_ORIGIN).
   - Install dependencies (`npm install`) and run `npm run dev`.

2. Create another Replit for the **React frontend**:
   - Upload the `frontend` folder.
   - Set `VITE_API_BASE` to the backend Replit URL.
   - Install dependencies and run `npm run dev`.

> Alternatively, host the backend on a service like Render and the frontend on Vercel, pointing `VITE_API_BASE` to the backend URL.

---

## 7. What to Share for the Assignment

- **GitHub repo** containing `/backend` and `/frontend` folders.
- **Deployed demo link**:
  - Replit (backend + frontend), or
  - Render + Vercel
- Short note describing:
  - How the workflow is triggered
  - How OpenAI is used
  - Any bonus features you added

This completes the full AI email summarizer workflow as requested in the assignment.
