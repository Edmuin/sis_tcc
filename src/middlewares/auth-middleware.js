import { decodeToken, verifyToken } from "./../utils/token/jwt.js";
import { RoleModel } from "../models/role.model.js";

export const populateUser = async (req, res, next) => {
  if (req.session?.user) {
    req.user = req.session.user;
    if (!req.user.role && req.user.role_id) {
      const role = await RoleModel.findById(req.user.role_id);
      req.user.role = role?.nome;
      req.session.user.role = req.user.role;
    }
    return next();
  }

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    if (verifyToken(token)) req.user = decodeToken(token);
  }

  next();
};


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

        req.user = decodeToken(token);
        req.session.user = req.user;
        next();
    } catch (error) {
        return res.status(500).send({message: "Ocorreu algum erro no servidor"});
    }
};

export const requireAuth = (req, res, next) => {
  if (req.user) return next();

  return res.redirect("/auth/sign-in");
};

export const requireApiAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    if (verifyToken(token)) {
      req.user = decodeToken(token);
      return next();
    }
  }

  if (req.user) return next();
  if (process.env.API_AUTH_REQUIRED === "false") return next();

  return res.status(401).json({ message: "Autenticação obrigatória para consumir a API." });
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.redirect("/auth/sign-in");
    if (roles.length === 0 || roles.includes(req.user.role)) return next();
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(403).json({ message: "Não tem permissão para aceder a este recurso." });
    }
    return res.status(403).send("Não tem permissão para aceder a este recurso.");
  };
};
