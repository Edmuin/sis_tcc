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
