# Workspace Rules - Worker Management App

## CockroachDB (Production Database) Schema Update Rule

* **Context**: The production database is CockroachDB (cockdb).
* **Credentials**: The production `DATABASE_URL` connection string is stored locally in [.env.production](file:///c:/Users/Administrator/Documents/gemini/workmanage_app/.env.production).
* **Trigger**: When the user requests database updates/schema migrations (e.g., "cockdb수정해줘", "DB 스키마 수정해줘"), the agent should execute the update using the saved CockroachDB credentials.
* **Procedure**:
  1. Read the `DATABASE_URL` from [.env.production](file:///c:/Users/Administrator/Documents/gemini/workmanage_app/.env.production).
  2. Temporarily modify [prisma/schema.prisma](file:///c:/Users/Administrator/Documents/gemini/workmanage_app/prisma/schema.prisma) to change the datasource provider from `postgresql` to `cockroachdb`.
  3. Run the prisma schema push command in the terminal:
     `cmd /c "set DATABASE_URL=[COCKROACH_URL]&& npx prisma db push"`
  4. After successful push, revert [prisma/schema.prisma](file:///c:/Users/Administrator/Documents/gemini/workmanage_app/prisma/schema.prisma)'s provider back to `postgresql` to keep local development intact.
