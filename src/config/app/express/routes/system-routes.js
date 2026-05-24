import { Router } from "express";

import { dashboard, roles, tcc, MeusDados, ConfigSobre, ConfigUtilizadores, Agendar, PainelPrincipal, Configuracoes, Curso, AreadeFormacao} from "../../../../controllers/system-controller.js";

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
router.get("/Configuracoes", Configuracoes);
router.get("/Curso", Curso);
router.get("/AreadeFormacao", AreadeFormacao);


export default router;