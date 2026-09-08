import { Router } from "express";

import { requireApiAuth } from "../../../../middlewares/auth-middleware.js";
import genericRoutes from "./operational/generic-routes.js";
import systemRoutes from "./operational/system-routes.js";

const router = Router();

router.use(requireApiAuth);

router.use(systemRoutes);
router.use("/:resource", (req, res, next) => {
	const { role } = req.user || {};
	const resource = req.params.resource;
	const readOnly = req.method === "GET";

	if (["coordenador", "administrador"].includes(role)) return next();
	if (role === "juri" && ["tccs", "bancas", "defesas"].includes(resource) && readOnly) return next();
	if (role === "aluno" && resource === "tccs" && (readOnly || req.method === "POST")) return next();
	if (role === "tutor" && ["estudantes", "bancas", "cursos"].includes(resource) && readOnly) return next();
	if (role === "tutor" && resource === "tccs" && (readOnly || req.method === "POST")) return next();
	return res.status(403).json({ message: "Não tem permissão para este recurso." });
});
router.use(genericRoutes);

export default router;
