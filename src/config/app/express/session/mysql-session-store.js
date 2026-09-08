import session from "express-session";
import { pool } from "../../../database/mysql/db.js";

const defaultTtlMs = 24 * 60 * 60 * 1000;

export class MySqlSessionStore extends session.Store {
  get(sid, callback) {
    pool.query("SELECT data FROM app_session WHERE id = ? AND expires_at > NOW()", [sid])
      .then(([rows]) => callback(null, rows[0] ? JSON.parse(rows[0].data) : null))
      .catch(callback);
  }

  set(sid, sessionData, callback = () => {}) {
    const expiresAt = new Date(Date.now() + (sessionData.cookie?.maxAge || defaultTtlMs));
    pool.query(
      "INSERT INTO app_session (id, data, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), expires_at = VALUES(expires_at)",
      [sid, JSON.stringify(sessionData), expiresAt]
    ).then(() => callback()).catch(callback);
  }

  destroy(sid, callback = () => {}) {
    pool.query("DELETE FROM app_session WHERE id = ?", [sid]).then(() => callback()).catch(callback);
  }

  touch(sid, sessionData, callback = () => {}) {
    const expiresAt = new Date(Date.now() + (sessionData.cookie?.maxAge || defaultTtlMs));
    pool.query("UPDATE app_session SET expires_at = ? WHERE id = ?", [expiresAt, sid])
      .then(() => callback()).catch(callback);
  }
}
