import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

test("palavras-passe hashed podem ser verificadas", async () => {
  const hash = await bcrypt.hash("senha-de-teste", 4);
  assert.notEqual(hash, "senha-de-teste");
  assert.equal(await bcrypt.compare("senha-de-teste", hash), true);
  assert.equal(await bcrypt.compare("senha-errada", hash), false);
});