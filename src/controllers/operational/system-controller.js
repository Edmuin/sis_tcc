import { DefesaModel } from "../../models/defesa.model.js";
import { EstudanteModel } from "../../models/estudante.model.js";
import { ProfessorModel } from "../../models/professor.model.js";
import { TccModel } from "../../models/tcc.model.js";
import { UserModel } from "../../models/user.model.js";
import { failure, success } from "./response.js";

const ESTADO_LABELS = {
  rascunho: "Rascunho",
  submetido: "Submetido",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  agendado_defesa: "Agendado para defesa",
  defendido: "Defendido",
};

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const toDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const recentDate = (row) => toDate(row.data_submissao) || toDate(row.created_at) || new Date(0);

const lastSixMonths = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: monthLabels[date.getMonth()],
      value: 0,
    };
  });
};

export const dashboardSummary = async (req, res) => {
  try {
    const [tccRows, userRows, estudanteRows, professorRows, defesaRows] = await Promise.all([
      TccModel.findAll(),
      UserModel.findAll(),
      EstudanteModel.findAll(),
      ProfessorModel.findAll(),
      DefesaModel.findAllWithDetails(),
    ]);

    const estados = tccRows.reduce((acc, row) => {
      const estado = row.estado || "rascunho";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    const chart = lastSixMonths();
    const chartByKey = chart.reduce((acc, item) => {
      acc[item.key] = item;
      return acc;
    }, {});

    tccRows.forEach((row) => {
      const date = recentDate(row);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (chartByKey[key]) chartByKey[key].value += 1;
    });

    const proximasDefesas = defesaRows
      .filter((row) => {
        const date = toDate(row.data_defesa);
        return date && date >= new Date(new Date().toDateString());
      })
      .sort((a, b) => toDate(a.data_defesa) - toDate(b.data_defesa))
      .slice(0, 5);

    const recentTccs = tccRows
      .slice()
      .sort((a, b) => recentDate(b) - recentDate(a))
      .slice(0, 5)
      .map((row) => ({
        id: row.id,
        tema: row.tema,
        objectivo: row.objectivo,
        estado: row.estado,
        estado_label: ESTADO_LABELS[row.estado] || row.estado || "Rascunho",
        data_submissao: row.data_submissao,
        created_at: row.created_at,
        estudante_nome: row.estudantes_nomes?.join(", ") || row.estudante_nome,
        professor_nome: row.professor_nome,
      }));

    success(res, {
      stats: [
        { label: "Total de TCCs", value: tccRows.length },
        { label: "Submetidos", value: estados.submetido || 0 },
        { label: "Aprovados", value: estados.aprovado || 0 },
        { label: "Próximas defesas", value: proximasDefesas.length },
      ],
      chart,
      recentTccs,
      upcomingDefesas: proximasDefesas,
      totals: {
        utilizadores: userRows.length,
        estudantes: estudanteRows.length,
        professores: professorRows.length,
        defesas: defesaRows.length,
        estados,
      },
    });
  } catch (error) {
    failure(res, error);
  }
};
