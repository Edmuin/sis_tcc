import { Router } from "express";

import { dashboard, roles, MeusDados, MeusDadosApi, ConfigSobre, PainelPrincipal, Configuracoes, AreadeFormacao, modulePage} from "../../../../controllers/system-controller.js";
import { requireAuth } from "../../../../middlewares/auth-middleware.js";

const router = Router();

// rotas das paginas principais
router.get("/", (req, res) => res.redirect("/auth/user-type"));
router.get("/roles", roles);
router.get("/tcc", modulePage);
router.get("/MeusDados", requireAuth, MeusDados);
router.get("/MeusDados/api", requireAuth, MeusDadosApi);
router.get("/ConfigSobre", ConfigSobre);
router.get("/ConfigUtilizadores", modulePage);
router.get("/Agendar", (req, res) => res.redirect("/Defesas"));
router.get("/PainelPrincipal", PainelPrincipal);
router.get("/Configuracoes", Configuracoes);
router.get("/Curso", modulePage);
router.get("/AreadeFormacao", AreadeFormacao);
router.get("/Utilizadores", modulePage);
router.get("/Perfis", modulePage);
router.get("/Cursos", modulePage);
router.get("/Estudantes", modulePage);
router.get("/Professores", modulePage);
router.get("/Subdireccoes", modulePage);
router.get("/Bancas", modulePage);
router.get("/Defesas", modulePage);
router.get("/DetalhesTcc", modulePage);

export default router;
