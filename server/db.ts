import { DatabaseSync } from "node:sqlite"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const db = new DatabaseSync(path.join(__dirname, "data.db"))

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    resume      TEXT NOT NULL DEFAULT '',
    experience  TEXT NOT NULL DEFAULT '',
    email       TEXT NOT NULL DEFAULT '',
    linkedin    TEXT NOT NULL DEFAULT '',
    github      TEXT NOT NULL DEFAULT '',
    website     TEXT NOT NULL DEFAULT ''
  );

  INSERT OR IGNORE INTO profile (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS preps (
    id          TEXT PRIMARY KEY,
    date        TEXT NOT NULL,
    company     TEXT NOT NULL,
    role        TEXT NOT NULL,
    output      TEXT NOT NULL,
    prep_type   TEXT NOT NULL DEFAULT 'recruiter-call',
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reflections (
    id               TEXT PRIMARY KEY,
    company          TEXT NOT NULL,
    role             TEXT NOT NULL,
    date             TEXT NOT NULL,
    interview_type   TEXT NOT NULL DEFAULT '',
    questions_asked  TEXT NOT NULL DEFAULT '',
    went_well        TEXT NOT NULL DEFAULT '',
    didnt_go_well    TEXT NOT NULL DEFAULT '',
    outcome          TEXT NOT NULL DEFAULT 'pending',
    rating           INTEGER,
    additional_notes TEXT NOT NULL DEFAULT '',
    ai_action_plan   TEXT NOT NULL DEFAULT '',
    created_at       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    source      TEXT NOT NULL DEFAULT 'manual',
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id               TEXT PRIMARY KEY,
    url              TEXT NOT NULL DEFAULT '',
    company          TEXT NOT NULL,
    role             TEXT NOT NULL,
    team             TEXT NOT NULL DEFAULT '',
    status           TEXT NOT NULL DEFAULT 'in-review',
    key_points       TEXT NOT NULL DEFAULT '[]',
    requirements     TEXT NOT NULL DEFAULT '[]',
    application_date TEXT NOT NULL,
    created_at       TEXT NOT NULL
  );
`)

const applicationColumns = db.prepare("PRAGMA table_info(applications)").all() as Array<{ name: string }>
const hasStatusColumn = applicationColumns.some((column) => column.name === "status")

if (!hasStatusColumn) {
  db.exec("ALTER TABLE applications ADD COLUMN status TEXT NOT NULL DEFAULT 'in-review';")
}
