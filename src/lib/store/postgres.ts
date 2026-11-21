import { neon } from "@neondatabase/serverless";
import type { Partner } from "../types";
import type { LoggedOutcome, SavedBrief, Store } from "./index";

/** Neon Postgres store. Tables are created on first use. */
export function postgresStore(url: string): Store {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const init = () =>
    (ready ??= Promise.all([
      sql`CREATE TABLE IF NOT EXISTS outcomes (
        id SERIAL PRIMARY KEY, partner_id TEXT NOT NULL, category TEXT NOT NULL,
        result TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', brief_name TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
      sql`CREATE TABLE IF NOT EXISTS briefs (
        id SERIAL PRIMARY KEY, brief JSONB NOT NULL, gaps JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
      sql`CREATE TABLE IF NOT EXISTS added_partners (
        id SERIAL PRIMARY KEY, partner JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    ]).then(() => sql`ALTER TABLE outcomes ADD COLUMN IF NOT EXISTS brief_id TEXT`));
  const toOutcome = (r: Record<string, unknown>): LoggedOutcome => ({
    id: String(r.id), partnerId: r.partner_id as string, category: r.category as string,
    result: r.result as LoggedOutcome["result"], note: r.note as string,
    briefName: r.brief_name as string, briefId: (r.brief_id as string | null) ?? null, createdAt: new Date(r.created_at as string).toISOString(),
  });
  return {
    kind: "database",
    async listOutcomes() {
      await init();
      return (await sql`SELECT * FROM outcomes ORDER BY created_at`).map(toOutcome);
    },
    async addOutcome(o) {
      await init();
      const rows = await sql`INSERT INTO outcomes (partner_id, category, result, note, brief_name, brief_id)
        VALUES (${o.partnerId}, ${o.category}, ${o.result}, ${o.note}, ${o.briefName}, ${o.briefId}) RETURNING *`;
      return toOutcome(rows[0]);
    },
    async listBriefs() {
      await init();
      const rows = await sql`SELECT * FROM briefs ORDER BY created_at DESC LIMIT 200`;
      return rows.map((r): SavedBrief => ({
        id: String(r.id), createdAt: new Date(r.created_at).toISOString(), brief: r.brief, gaps: r.gaps,
      }));
    },
    async listPartners() {
      await init();
      const rows = await sql`SELECT * FROM added_partners ORDER BY id`;
      return rows.map((r): Partner => ({ ...(r.partner as Omit<Partner, "id">), id: `N${String(r.id).padStart(2, "0")}` }));
    },
    async addPartner(p) {
      await init();
      const rows = await sql`INSERT INTO added_partners (partner) VALUES (${JSON.stringify(p)}::jsonb) RETURNING id`;
      return { ...p, id: `N${String(rows[0].id).padStart(2, "0")}` };
    },
    async getBrief(briefId) {
      await init();
      if (!/^\d+$/.test(briefId)) return null;
      const rows = await sql`SELECT * FROM briefs WHERE id = ${Number(briefId)}`;
      const r = rows[0];
      return r ? { id: String(r.id), createdAt: new Date(r.created_at).toISOString(), brief: r.brief, gaps: r.gaps } : null;
    },
    async addBrief(b) {
      await init();
      const rows = await sql`INSERT INTO briefs (brief, gaps)
        VALUES (${JSON.stringify(b.brief)}::jsonb, ${JSON.stringify(b.gaps)}::jsonb) RETURNING *`;
      const r = rows[0];
      return { id: String(r.id), createdAt: new Date(r.created_at).toISOString(), brief: r.brief, gaps: r.gaps };
    },
  };
}
