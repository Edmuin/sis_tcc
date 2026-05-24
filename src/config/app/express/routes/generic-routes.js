import { Router } from "express";

import { dashboard } from "../../../../controllers/role-controller.js";

const router = Router();

// rotas das paginas principais
router.get("/", dashboard);

export default router;