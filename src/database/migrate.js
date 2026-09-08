import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/database/mysql/db.js";

const currentFile = fileURLToPath(import.meta.url);
const migrationsDirectory = path.join(path.dirname(currentFile), "migrations");

const run = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  const files = (await fs.readdir(migrationsDirectory)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const [applied] = await pool.query("SELECT id FROM schema_migrations WHERE name = ? LIMIT 1", [file]);
    if (applied.length > 0) continue;
    const sql = await fs.readFile(path.join(migrationsDirectory, file), "utf8");
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const statement of sql.split(/;\s*(?:\r?\n|$)/).map((part) => part.trim()).filter(Boolean)) await connection.query(statement);
      await connection.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
      await connection.commit();
      console.log(`Migration applied: ${file}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  await pool.end();
};

run().catch(async (error) => {
  console.error("Migration failed:", error);
  await pool.end();
  process.exitCode = 1;
});
