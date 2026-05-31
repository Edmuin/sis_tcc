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
import { hasValue, positiveInteger, validDate, validEmail } from "./validation.js";

export const resources = {
  users: {
    model: UserModel,
    required: ["nome", "email", "password"],
    hidden: ["password"],
  },
  roles: {
    model: RoleModel,
    required: ["nome"],
  },
  cursos: {
    model: CursoModel,
    required: ["nome"],
  },
  estudantes: {
    model: EstudanteModel,
    required: ["numero_estudante", "id_curso"],
  },
  professores: {
    model: ProfessorModel,
    required: ["id_user"],
  },
  subdireccoes: {
    model: SubdireccaoModel,
    required: ["id_user"],
  },
  bancas: {
    model: BancaModel,
    required: ["sala"],
  },
  professor_bancas: {
    model: ProfessorBancaModel,
    required: ["id_professor", "id_banca"],
  },
  defesas: {
    model: DefesaModel,
    required: ["id_tcc", "id_banca", "data_defesa", "resultado"],
  },
  aprovacao_bancas: {
    model: AprovacaoBancaModel,
    required: ["id_banca", "id_subdireccao", "status"],
  },
  aprovacao_defesas: {
    model: AprovacaoDefesaModel,
    required: ["id_tcc", "id_subdireccao", "observacao"],
  },
  aprovacao_tccs: {
    model: AprovacaoTccModel,
    required: ["id_tcc", "id_subdireccao", "status"],
  },
  documentos: {
    model: DocumentoModel,
    required: ["id_tcc", "nome", "tipo", "caminho_arquivo"],
  },
  avaliacoes: {
    model: AvaliacaoModel,
    required: ["id_tcc", "observacao", "data_avaliacao"],
  },
  tccs: {
    model: TccModel,
    required: ["id_estudante", "id_professor"],
  },
};

export const approvalModels = {
  tcc: AprovacaoTccModel,
  banca: AprovacaoBancaModel,
  defesa: AprovacaoDefesaModel,
};

export const approvalRequiredFields = {
  tcc: ["id_tcc", "id_subdireccao"],
  banca: ["id_banca", "id_subdireccao", "status"],
  defesa: ["id_tcc", "id_subdireccao", "observacao"],
};

export const indexById = (rows) => {
  return rows.reduce((acc, row) => {
    acc[row.id] = row;
    return acc;
  }, {});
};

export const matchesFilters = (row, filters) => {
  return Object.entries(filters).every(([field, value]) => {
    if (!hasValue(value)) return true;
    if (!Object.prototype.hasOwnProperty.call(row, field)) return true;

    return String(row[field] ?? "").toLowerCase().includes(String(value ?? "").toLowerCase());
  });
};

export const sanitize = (resource, data) => {
  if (!resource.hidden || !data) return data;

  const removeHidden = (row) => {
    const sanitized = { ...row };
    resource.hidden.forEach((field) => delete sanitized[field]);
    return sanitized;
  };

  return Array.isArray(data) ? data.map(removeHidden) : removeHidden(data);
};

export const existsById = async (model, id) => {
  if (!positiveInteger(id)) return false;
  return Boolean(await model.findById(id));
};

export const validateApprovalData = async (tipo, data) => {
  const errors = [];
  if (hasValue(data.id_tcc) && !(await existsById(TccModel, data.id_tcc))) errors.push("id_tcc não encontrado");
  if (hasValue(data.id_banca) && !(await existsById(BancaModel, data.id_banca))) errors.push("id_banca não encontrado");
  if (hasValue(data.id_subdireccao) && !(await existsById(SubdireccaoModel, data.id_subdireccao))) errors.push("id_subdireccao não encontrado");
  if (hasValue(data.status) && !["0", "1", "2"].includes(String(data.status))) errors.push("status deve ser 0, 1 ou 2");
  if (tipo === "tcc" && hasValue(data.data_aprovacao) && !validDate(data.data_aprovacao)) errors.push("data_aprovacao inválida");
  if (tipo === "banca" && hasValue(data.data) && !validDate(data.data)) errors.push("data inválida");
  return errors;
};

const resourceValidators = {
  users: async (data) => {
    const errors = [];
    if (hasValue(data.email) && !validEmail(data.email)) errors.push("email inválido");
    if (hasValue(data.idade) && Number(data.idade) < 0) errors.push("idade deve ser positiva");
    if (hasValue(data.role_id) && !(await existsById(RoleModel, data.role_id))) errors.push("role_id não encontrado");
    return errors;
  },
  estudantes: async (data) => {
    const errors = [];
    if (hasValue(data.id_user) && !(await existsById(UserModel, data.id_user))) errors.push("id_user não encontrado");
    if (hasValue(data.id_curso) && !(await existsById(CursoModel, data.id_curso))) errors.push("id_curso não encontrado");
    if (hasValue(data.numero_estudante) && !positiveInteger(data.numero_estudante)) errors.push("numero_estudante deve ser positivo");
    return errors;
  },
  professores: async (data) => {
    const errors = [];
    if (hasValue(data.id_user) && !(await existsById(UserModel, data.id_user))) errors.push("id_user não encontrado");
    return errors;
  },
  subdireccoes: async (data) => {
    const errors = [];
    if (hasValue(data.id_user) && !(await existsById(UserModel, data.id_user))) errors.push("id_user não encontrado");
    return errors;
  },
  bancas: async (data) => {
    const errors = [];
    if (hasValue(data.sala) && !positiveInteger(data.sala)) errors.push("sala deve ser positiva");
    if (hasValue(data.data) && !validDate(data.data)) errors.push("data inválida");
    return errors;
  },
  professor_bancas: async (data) => {
    const errors = [];
    if (hasValue(data.id_professor) && !(await existsById(ProfessorModel, data.id_professor))) errors.push("id_professor não encontrado");
    if (hasValue(data.id_banca) && !(await existsById(BancaModel, data.id_banca))) errors.push("id_banca não encontrado");
    return errors;
  },
  defesas: async (data) => {
    const errors = [];
    if (hasValue(data.id_tcc) && !(await existsById(TccModel, data.id_tcc))) errors.push("id_tcc não encontrado");
    if (hasValue(data.id_banca) && !(await existsById(BancaModel, data.id_banca))) errors.push("id_banca não encontrado");
    if (hasValue(data.data_defesa) && !validDate(data.data_defesa)) errors.push("data_defesa inválida");
    return errors;
  },
  documentos: async (data) => {
    const errors = [];
    if (hasValue(data.id_tcc) && !(await existsById(TccModel, data.id_tcc))) errors.push("id_tcc não encontrado");
    return errors;
  },
  avaliacoes: async (data) => {
    const errors = [];
    if (hasValue(data.id_tcc) && !(await existsById(TccModel, data.id_tcc))) errors.push("id_tcc não encontrado");
    if (hasValue(data.data_avaliacao) && !validDate(data.data_avaliacao)) errors.push("data_avaliacao inválida");
    return errors;
  },
  tccs: async (data) => {
    const errors = [];
    if (hasValue(data.id_estudante) && !(await existsById(EstudanteModel, data.id_estudante))) errors.push("id_estudante não encontrado");
    if (hasValue(data.id_professor) && !(await existsById(ProfessorModel, data.id_professor))) errors.push("id_professor não encontrado");
    if (hasValue(data.data_submissao) && !validDate(data.data_submissao)) errors.push("data_submissao inválida");
    return errors;
  },
  aprovacao_tccs: async (data) => validateApprovalData("tcc", data),
  aprovacao_bancas: async (data) => validateApprovalData("banca", data),
  aprovacao_defesas: async (data) => validateApprovalData("defesa", data),
};

export const validateResourceData = async (resourceName, data) => {
  const validator = resourceValidators[resourceName];
  if (!validator) return [];

  return validator(data);
};

export const decorateRows = async (resourceName, rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  if (resourceName === "estudantes") {
    const [users, cursos] = await Promise.all([UserModel.findAll(), CursoModel.findAll()]);
    const usersById = indexById(users);
    const cursosById = indexById(cursos);

    return rows.map((row) => ({
      ...row,
      utilizador_nome: usersById[row.id_user]?.nome || "",
      curso_nome: cursosById[row.id_curso]?.nome || "",
    }));
  }

  if (resourceName === "professores") {
    const users = await UserModel.findAll();
    const usersById = indexById(users);

    return rows.map((row) => ({
      ...row,
      utilizador_nome: usersById[row.id_user]?.nome || "",
      utilizador_email: usersById[row.id_user]?.email || "",
    }));
  }

  if (resourceName === "subdireccoes") {
    const users = await UserModel.findAll();
    const usersById = indexById(users);

    return rows.map((row) => ({
      ...row,
      utilizador_nome: usersById[row.id_user]?.nome || "",
    }));
  }

  if (resourceName === "tccs") {
    const [estudantes, professores, users] = await Promise.all([
      EstudanteModel.findAll(),
      ProfessorModel.findAll(),
      UserModel.findAll(),
    ]);
    const estudantesById = indexById(estudantes);
    const professoresById = indexById(professores);
    const usersById = indexById(users);

    return rows.map((row) => {
      const estudante = estudantesById[row.id_estudante];
      const professor = professoresById[row.id_professor];

      return {
        ...row,
        estudante_nome: usersById[estudante?.id_user]?.nome || "",
        professor_nome: usersById[professor?.id_user]?.nome || "",
      };
    });
  }

  if (resourceName === "professor_bancas") {
    const [professores, users, bancas] = await Promise.all([
      ProfessorModel.findAll(),
      UserModel.findAll(),
      BancaModel.findAll(),
    ]);
    const professoresById = indexById(professores);
    const usersById = indexById(users);
    const bancasById = indexById(bancas);

    return rows.map((row) => ({
      ...row,
      professor_nome: usersById[professoresById[row.id_professor]?.id_user]?.nome || "",
      banca_sala: bancasById[row.id_banca]?.sala || "",
      banca_data: bancasById[row.id_banca]?.data || "",
    }));
  }

  if (resourceName === "defesas") {
    const [tccs, bancas] = await Promise.all([TccModel.findAll(), BancaModel.findAll()]);
    const tccsById = indexById(tccs);
    const bancasById = indexById(bancas);

    return rows.map((row) => ({
      ...row,
      tcc_tema: tccsById[row.id_tcc]?.tema || "",
      banca_sala: bancasById[row.id_banca]?.sala || "",
    }));
  }

  if (["documentos", "avaliacoes", "aprovacao_tccs", "aprovacao_defesas"].includes(resourceName)) {
    const tccs = await TccModel.findAll();
    const tccsById = indexById(tccs);

    return rows.map((row) => ({
      ...row,
      tcc_tema: tccsById[row.id_tcc]?.tema || "",
    }));
  }

  if (resourceName === "aprovacao_bancas") {
    const bancas = await BancaModel.findAll();
    const bancasById = indexById(bancas);

    return rows.map((row) => ({
      ...row,
      banca_sala: bancasById[row.id_banca]?.sala || "",
      banca_data: bancasById[row.id_banca]?.data || "",
    }));
  }

  return rows;
};
