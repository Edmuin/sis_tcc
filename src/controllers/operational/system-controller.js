import { AprovacaoBancaModel } from "../../models/aprovacao_banca.model.js";
import { AprovacaoDefesaModel } from "../../models/aprovacao_defesa.model.js";
import { AprovacaoTccModel } from "../../models/aprovacao_tcc.model.js";
import { AvaliacaoModel } from "../../models/avaliacao.model.js";
import { BancaModel } from "../../models/banca.model.js";
import { CursoModel } from "../../models/curso.model.js";
import { DefesaModel } from "../../models/defesa.model.js";
import { DocumentoModel } from "../../models/documento.model.js";
import { EstudanteModel } from "../../models/estudante.model.js";
import { ProfessorModel } from "../../models/professor.model.js";
import { ProfessorBancaModel } from "../../models/professor_banca.model.js";
import { RoleModel } from "../../models/role.model.js";
import { SubdireccaoModel } from "../../models/subdireccao.model.js";
import { TccModel } from "../../models/tcc.model.js";
import { UserModel } from "../../models/user.model.js";
import { failure, success } from "./response.js";

export const dashboardSummary = async (req, res) => {
  try {
    const [reportsData, tccs, documentos] = await Promise.all([
      Promise.all([
        TccModel.findAll(),
        UserModel.findAll(),
        EstudanteModel.findAll(),
        ProfessorModel.findAll(),
        DefesaModel.findAll(),
        AvaliacaoModel.findAll(),
      ]),
      TccModel.findAll(),
      DocumentoModel.findAll(),
    ]);

    const [tccRows, userRows, estudanteRows, professorRows, defesaRows, avaliacaoRows] = reportsData;

    success(res, {
      stats: [
        { label: "Total de TCCs", value: tccRows.length },
        { label: "Total de Alunos", value: estudanteRows.length },
        { label: "Orientadores", value: professorRows.length },
        { label: "Defesas", value: defesaRows.length },
      ],
      chart: [
        { label: "TCCs", value: tccRows.length },
        { label: "Documentos", value: documentos.length },
        { label: "Avaliações", value: avaliacaoRows.length },
        { label: "Defesas", value: defesaRows.length },
        { label: "Utilizadores", value: userRows.length },
      ],
      recentTccs: tccs
        .slice()
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5),
    });
  } catch (error) {
    failure(res, error);
  }
};

export const reports = async (req, res) => {
  try {
    const [
      tccs,
      users,
      roles,
      cursos,
      estudantes,
      professores,
      subdireccoes,
      bancas,
      defesas,
      documentos,
      avaliacoes,
      professorBancas,
      aprovacoes,
    ] = await Promise.all([
      TccModel.findAll(),
      UserModel.findAll(),
      RoleModel.findAll(),
      CursoModel.findAll(),
      EstudanteModel.findAll(),
      ProfessorModel.findAll(),
      SubdireccaoModel.findAll(),
      BancaModel.findAll(),
      DefesaModel.findAll(),
      DocumentoModel.findAll(),
      AvaliacaoModel.findAll(),
      ProfessorBancaModel.findAll(),
      Promise.all([
        AprovacaoTccModel.findAll(),
        AprovacaoBancaModel.findAll(),
        AprovacaoDefesaModel.findAll(),
      ]).then((groups) => groups.flat()),
    ]);

    success(res, [
      { nome: "TCCs registados", total: tccs.length, categoria: "TCC" },
      { nome: "Utilizadores cadastrados", total: users.length, categoria: "Sistema" },
      { nome: "Perfis configurados", total: roles.length, categoria: "Sistema" },
      { nome: "Cursos cadastrados", total: cursos.length, categoria: "Acadêmico" },
      { nome: "Estudantes cadastrados", total: estudantes.length, categoria: "Acadêmico" },
      { nome: "Professores cadastrados", total: professores.length, categoria: "Acadêmico" },
      { nome: "Subdirecções cadastradas", total: subdireccoes.length, categoria: "Sistema" },
      { nome: "Bancas constituídas", total: bancas.length, categoria: "Defesas" },
      { nome: "Defesas registadas", total: defesas.length, categoria: "Defesas" },
      { nome: "Professores em bancas", total: professorBancas.length, categoria: "Defesas" },
      { nome: "Documentos submetidos", total: documentos.length, categoria: "Documentos" },
      { nome: "Avaliações registadas", total: avaliacoes.length, categoria: "Avaliações" },
      { nome: "Aprovações registadas", total: aprovacoes.length, categoria: "Aprovações" },
    ]);
  } catch (error) {
    failure(res, error);
  }
};
