import { Router } from "express";

import { dashboard, roles, tcc, MeusDados, ConfigSobre, ConfigUtilizadores, Agendar, PainelPrincipal} from "../../../../controllers/system-controller.js";

const router = Router();

// rotas das paginas principais
router.get("/", dashboard);
router.get("/roles", roles);
router.get("/tcc", tcc);
router.get("/MeusDados", MeusDados);
router.get("/ConfigSobre", ConfigSobre);
router.get("/ConfigUtilizadores", ConfigUtilizadores);
router.get("/Agendar", Agendar);
router.get("/PainelPrincipal", PainelPrincipal);


export default router;