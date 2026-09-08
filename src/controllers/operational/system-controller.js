import { DefesaModel } from "../../models/defesa.model.js";
import { EstudanteModel } from "../../models/estudante.model.js";
import { ProfessorModel } from "../../models/professor.model.js";
import { TccModel } from "../../models/tcc.model.js";
import { UserModel } from "../../models/user.model.js";
import { failure, success } from "./response.js";

export const dashboardSummary = async (req, res) => {
  try {
    const [reportsData, tccs] = await Promise.all([
      Promise.all([
        TccModel.findAll(),
        UserModel.findAll(),
        EstudanteModel.findAll(),
        ProfessorModel.findAll(),
        DefesaModel.findAll(),
      ]),
      TccModel.findAll(),
    ]);

    const [tccRows, userRows, estudanteRows, professorRows, defesaRows] = reportsData;

    success(res, {
      stats: [
        { label: "Total de TCCs", value: tccRows.length },
        { label: "Total de Alunos", value: estudanteRows.length },
        { label: "Orientadores", value: professorRows.length },
        { label: "Defesas", value: defesaRows.length },
      ],
      chart: [
        { label: "TCCs", value: tccRows.length },
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

export const coordinationReport = async (req, res) => {
  try {
    if (!["coordenador", "administrador"].includes(req.user?.role)) {
      return res.status(403).json({ message: "Relatório reservado à coordenação." });
    }
    const [[statusRows], [withoutTutor], [pendingProposals], [lateStages]] = await Promise.all([
      import("../../config/database/mysql/db.js").then(({ pool }) => pool.query("SELECT estado, COUNT(*) AS total FROM tcc GROUP BY estado")),
      import("../../config/database/mysql/db.js").then(({ pool }) => pool.query("SELECT COUNT(*) AS total FROM estudante e LEFT JOIN tcc t ON t.id_estudante = e.id WHERE t.id IS NULL")),
      import("../../config/database/mysql/db.js").then(({ pool }) => pool.query("SELECT COUNT(*) AS total FROM tcc_proposta WHERE estado = 'pendente'")),
      import("../../config/database/mysql/db.js").then(({ pool }) => pool.query("SELECT COUNT(*) AS total FROM tcc_etapa WHERE prazo < CURRENT_DATE AND estado NOT IN ('concluida', 'aprovada')")),
    ]);
    return res.json({ data: {
      tccsPorEstado: statusRows,
      alunosSemOrientador: withoutTutor[0]?.total || 0,
      propostasPendentes: pendingProposals[0]?.total || 0,
      etapasAtrasadas: lateStages[0]?.total || 0,
    } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Não foi possível gerar o relatório." });
  }
};
