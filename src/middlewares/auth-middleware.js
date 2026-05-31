export const requireAuth = (req, res, next) => {
  if (req.user) return next();

  return res.redirect("/auth/form-login");
};

export const requireApiAuth = (req, res, next) => {
  if (process.env.API_AUTH_REQUIRED !== "true") return next();
  if (req.user || req.headers.authorization || req.headers["x-user-email"]) return next();

  return res.status(401).json({ message: "Autenticação obrigatória para consumir a API." });
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.redirect("/auth/form-login");
    if (roles.length === 0 || roles.includes(req.user.role)) return next();

    return res.status(403).json({ message: "Não tem permissão para aceder a este recurso." });
  };
};
