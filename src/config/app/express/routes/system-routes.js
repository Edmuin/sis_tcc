import { Router } from "express";

import { dashboard, roles, MeusDados, ConfigSobre, PainelPrincipal, Configuracoes, AreadeFormacao, modulePage} from "../../../../controllers/system-controller.js";

const router = Router();

// rotas das paginas principais
router.get("/", dashboard);
router.get("/roles", roles);
router.get("/tcc", modulePage);
router.get("/MeusDados", MeusDados);
router.get("/ConfigSobre", ConfigSobre);
router.get("/ConfigUtilizadores", modulePage);
router.get("/Agendar", modulePage);
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
router.get("/ProfessorBancas", modulePage);
router.get("/Defesas", modulePage);
router.get("/Documentos", modulePage);
router.get("/Avaliacoes", modulePage);
router.get("/Aprovacoes", modulePage);
router.get("/AprovacaoTccs", modulePage);
router.get("/AprovacaoBancas", modulePage);
router.get("/AprovacaoDefesas", modulePage);
router.get("/DetalhesTcc", modulePage);
router.get("/Relatorios", modulePage);

export default router;
