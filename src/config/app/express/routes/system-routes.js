import { Router } from "express";

import { dashboard, roles, tcc, MeusDados, ConfigSobre, ConfigUtilizadores, agendar, PainelPrincipal, Configuracoes, Curso, AreadeFormacao} from "../../../../controllers/system-controller.js";

const router = Router();

// rotas das paginas principais
router.get("/", dashboard);
router.get("/roles", roles);
router.get("/tcc", tcc);
router.get("/MeusDados", MeusDados);
router.get("/ConfigSobre", ConfigSobre);
router.get("/ConfigUtilizadores", ConfigUtilizadores);
router.get("/agendar", agendar);
router.get("/PainelPrincipal", PainelPrincipal);
router.get("/Configuracoes", Configuracoes);
router.get("/Curso", Curso);
router.get("/AreadeFormacao", AreadeFormacao);
router.get("/api/tccs", async (req, res) => {
    const dados = await TccModel.findAll();
    res.json(dados);
});

export default router;