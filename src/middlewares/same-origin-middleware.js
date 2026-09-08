const isMutatingMethod = (method) => ["POST", "PUT", "PATCH", "DELETE"].includes(method);

export const sameOrigin = (req, res, next) => {
  if (!isMutatingMethod(req.method) || req.headers.authorization?.startsWith("Bearer ")) return next();

  const originHeader = req.headers.origin;
  const origin = originHeader && originHeader !== "null" ? originHeader : req.headers.referer;
  if (!origin) return next();

  try {
    const requestOrigin = new URL(origin).origin;
    const expectedOrigin = `${req.protocol}://${req.get("host")}`;
    if (requestOrigin !== expectedOrigin) return res.status(403).json({ message: "Origem da requisição não permitida." });
  } catch {
    return res.status(403).json({ message: "Origem da requisição inválida." });
  }

  return next();
};