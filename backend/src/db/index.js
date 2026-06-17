// src/db/index.js — Neon + Drizzle database connection
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

const sql = neon(process.env.DATABASE_URL);

// Pass the schema so we can use db.query.* (relational queries)
export const db = drizzle(sql, { schema });
