import { Router } from "express";

import { dashboard, roles, MeusDados, ConfigSobre, PainelPrincipal, Configuracoes, AreadeFormacao, WorkflowTcc, modulePage} from "../../../../controllers/system-controller.js";
import { allowRoles, requireAuth } from "../../../../middlewares/auth-middleware.js";

const router = Router();

router.use(requireAuth);

// rotas das paginas principais
router.get("/", dashboard);
router.get("/roles", allowRoles("coordenador", "administrador"), roles);
router.get("/tcc", allowRoles("aluno", "tutor", "coordenador", "juri", "administrador"), modulePage);
router.get("/WorkflowTcc/:id", allowRoles("aluno", "tutor", "coordenador", "juri", "administrador"), WorkflowTcc);
router.get("/MeusDados", MeusDados);
router.get("/ConfigSobre", allowRoles("coordenador", "administrador"), ConfigSobre);
router.get("/ConfigUtilizadores", allowRoles("coordenador", "administrador"), modulePage);
router.get("/Agendar", (req, res) => res.redirect("/Defesas"));
router.get("/PainelPrincipal", PainelPrincipal);
router.get("/Configuracoes", allowRoles("coordenador", "administrador"), Configuracoes);
router.get("/Curso", allowRoles("coordenador", "administrador"), modulePage);
router.get("/AreadeFormacao", allowRoles("coordenador", "administrador"), AreadeFormacao);
router.get("/Utilizadores", allowRoles("coordenador", "administrador"), modulePage);
router.get("/Perfis", allowRoles("coordenador", "administrador"), modulePage);
router.get("/Cursos", allowRoles("coordenador", "administrador"), modulePage);
router.get("/Estudantes", allowRoles("tutor", "coordenador", "administrador"), modulePage);
router.get("/Professores", allowRoles("coordenador", "administrador"), modulePage);
router.get("/Subdireccoes", allowRoles("coordenador", "administrador"), modulePage);
router.get("/Bancas", allowRoles("coordenador", "juri", "administrador"), modulePage);
router.get("/Defesas", allowRoles("coordenador", "juri", "administrador"), modulePage);
router.get("/Juri", allowRoles("coordenador", "juri", "administrador"), modulePage);
router.get("/Administracao", allowRoles("administrador"), Configuracoes);
router.get("/DetalhesTcc", allowRoles("tutor", "coordenador", "juri", "administrador"), modulePage);

export default router;
