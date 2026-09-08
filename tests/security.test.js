import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { isPublicRegistrationRole } from "../src/services/registration-policy.js";
import { requireApiAuth } from "../src/middlewares/auth-middleware.js";
import { sanitizeUser, sanitizeUsers } from "../src/utils/sanitize-user.js";
import { sameOrigin } from "../src/middlewares/same-origin-middleware.js";

test("palavras-passe hashed podem ser verificadas", async () => {
  const hash = await bcrypt.hash("senha-de-teste", 4);
  assert.notEqual(hash, "senha-de-teste");
  assert.equal(await bcrypt.compare("senha-de-teste", hash), true);
  assert.equal(await bcrypt.compare("senha-errada", hash), false);
});

test("cadastro público não permite criar coordenadores", () => {
  assert.equal(isPublicRegistrationRole("aluno"), true);
  assert.equal(isPublicRegistrationRole("tutor"), true);
  assert.equal(isPublicRegistrationRole("coordenador"), false);
  assert.equal(isPublicRegistrationRole("administrador"), false);
});

test("bypass da API só funciona fora de produção", () => {
  const originalEnvironment = process.env.NODE_ENV;
  const originalAuthRequired = process.env.API_AUTH_REQUIRED;
  const request = { headers: {} };
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalls = 0;

  process.env.API_AUTH_REQUIRED = "false";
  process.env.NODE_ENV = "production";
  requireApiAuth(request, response, () => { nextCalls += 1; });
  assert.equal(nextCalls, 0);
  assert.equal(response.statusCode, 401);

  process.env.NODE_ENV = "development";
  requireApiAuth(request, response, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);

  if (originalEnvironment === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnvironment;
  if (originalAuthRequired === undefined) delete process.env.API_AUTH_REQUIRED;
  else process.env.API_AUTH_REQUIRED = originalAuthRequired;
});

test("respostas de utilizadores não expõem palavras-passe", () => {
  const user = { id: 1, email: "user@example.com", password: "hash-secreto" };
  assert.deepEqual(sanitizeUser(user), { id: 1, email: "user@example.com" });
  assert.deepEqual(sanitizeUsers([user]), [{ id: 1, email: "user@example.com" }]);
});

test("pedidos de sessão mutáveis exigem uma origem válida", () => {
  const run = (headers) => {
    const response = { statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
    let called = false;
    sameOrigin({ method: "POST", headers, protocol: "https", get: () => "gestor.example" }, response, () => { called = true; });
    return { response, called };
  };

  assert.equal(run({}).response.statusCode, 403);
  assert.equal(run({ origin: "https://outro.example" }).response.statusCode, 403);
  assert.equal(run({ origin: "https://gestor.example" }).called, true);
});
