import test from "node:test";
import assert from "node:assert/strict";
import appServer from "../src/config/app/express/server.js";
import { pool } from "../src/config/database/mysql/db.js";

let server;
let baseUrl;

test.before(async () => {
  server = appServer.app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await pool.end();
});

test("health confirma aplicação e base de dados", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", service: "sis-tcc", database: "ok" });
});

test("rota protegida redireciona visitante não autenticado", async () => {
  const response = await fetch(`${baseUrl}/tcc`, { redirect: "manual" });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/auth/sign-in");
});
