import { verifyToken } from "./../utils/token/jwt.js";



export const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header){
        return res.status(400).send({message: "Token de autenticação ausente, Erro de autorização."});
    }

    const token = header.split(" ")[1];

    try {
        const is_logged = verifyToken(token);

        if (is_logged !== true) {
            return res.status(401).send({message: "Acesso não autorizado, Erro de autorização."});
        }

        next();
    } catch (error) {
        return res.status(500).send({message: "Ocorreu algum erro no servidor"});
    }
};

export const requireAuth = (req, res, next) => {
  if (!req.user && req.session?.user) req.user = req.session.user;
  if (req.user) return next();

  return res.redirect("/auth/sign-in");
};

export const requireApiAuth = (req, res, next) => {
  if (process.env.API_AUTH_REQUIRED !== "true") return next();
  if (!req.user && req.session?.user) req.user = req.session.user;
  if (req.user || req.headers.authorization || req.headers["x-user-email"]) return next();

  return res.status(401).json({ message: "Autenticação obrigatória para consumir a API." });
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user && req.session?.user) req.user = req.session.user;
    if (!req.user) return res.redirect("/auth/sign-in");
    if (roles.length === 0 || roles.includes(req.user.role)) return next();

    return res.status(403).json({ message: "Não tem permissão para aceder a este recurso." });
  };
};
