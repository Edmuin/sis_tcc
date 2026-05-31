import { AprovacaoBancaModel } from "../models/aprovacao_banca.model.js";
import { AprovacaoDefesaModel } from "../models/aprovacao_defesa.model.js";
import { AprovacaoTccModel } from "../models/aprovacao_tcc.model.js";
import { AvaliacaoModel } from "../models/avaliacao.model.js";
import { BancaModel } from "../models/banca.model.js";
import { CursoModel } from "../models/curso.model.js";
import { DefesaModel } from "../models/defesa.model.js";
import { DocumentoModel } from "../models/documento.model.js";
import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";
import { ProfessorBancaModel } from "../models/professor_banca.model.js";
import { RoleModel } from "../models/role.model.js";
import { SubdireccaoModel } from "../models/subdireccao.model.js";
import { TccModel } from "../models/tcc.model.js";
import { UserModel } from "../models/user.model.js";

const resources = {
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

const approvalModels = {
  tcc: AprovacaoTccModel,
  banca: AprovacaoBancaModel,
  defesa: AprovacaoDefesaModel,
};

const approvalRequiredFields = {
  tcc: ["id_tcc", "id_subdireccao"],
  banca: ["id_banca", "id_subdireccao", "status"],
  defesa: ["id_tcc", "id_subdireccao", "observacao"],
};

const success = (res, data, status = 200) => res.status(status).json({ data });

const failure = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Não foi possível processar o pedido." });
};

const validationError = (res, message) => res.status(400).json({ message });

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const missingFields = (data, fields) => fields.filter((field) => !hasValue(data[field]));

const positiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));

const validDate = (value) => {
  if (!hasValue(value)) return true;
  return !Number.isNaN(Date.parse(value));
};

const existsById = async (model, id) => {
  if (!positiveInteger(id)) return false;
  return Boolean(await model.findById(id));
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

const validateApprovalData = async (tipo, data) => {
  const errors = [];
  if (hasValue(data.id_tcc) && !(await existsById(TccModel, data.id_tcc))) errors.push("id_tcc não encontrado");
  if (hasValue(data.id_banca) && !(await existsById(BancaModel, data.id_banca))) errors.push("id_banca não encontrado");
  if (hasValue(data.id_subdireccao) && !(await existsById(SubdireccaoModel, data.id_subdireccao))) errors.push("id_subdireccao não encontrado");
  if (hasValue(data.status) && !["0", "1", "2"].includes(String(data.status))) errors.push("status deve ser 0, 1 ou 2");
  if (tipo === "tcc" && hasValue(data.data_aprovacao) && !validDate(data.data_aprovacao)) errors.push("data_aprovacao inválida");
  if (tipo === "banca" && hasValue(data.data) && !validDate(data.data)) errors.push("data inválida");
  return errors;
};

const validateResourceData = async (resourceName, data) => {
  const validator = resourceValidators[resourceName];
  if (!validator) return [];

  return validator(data);
};

const sanitize = (resource, data) => {
  if (!resource.hidden || !data) return data;

  const removeHidden = (row) => {
    const sanitized = { ...row };
    resource.hidden.forEach((field) => delete sanitized[field]);
    return sanitized;
  };

  return Array.isArray(data) ? data.map(removeHidden) : removeHidden(data);
};

const normalizeText = (value) => String(value ?? "").toLowerCase();

const matchesFilters = (row, filters) => {
  return Object.entries(filters).every(([field, value]) => {
    if (!hasValue(value)) return true;
    if (!Object.prototype.hasOwnProperty.call(row, field)) return true;

    return normalizeText(row[field]).includes(normalizeText(value));
  });
};

const indexById = (rows) => {
  return rows.reduce((acc, row) => {
    acc[row.id] = row;
    return acc;
  }, {});
};

const decorateRows = async (resourceName, rows) => {
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

export const listResource = async (req, res) => {
  try {
    const resourceName = req.params.resource;
    const resource = resources[resourceName];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const rows = await resource.model.findAll();
    const filteredRows = rows.filter((row) => matchesFilters(row, req.query));
    const decoratedRows = await decorateRows(resourceName, filteredRows);

    success(res, sanitize(resource, decoratedRows));
  } catch (error) {
    failure(res, error);
  }
};

export const getResource = async (req, res) => {
  try {
    const resource = resources[req.params.resource];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const row = await resource.model.findById(req.params.id);
    if (!row) return res.status(404).json({ message: "Registo não encontrado." });

    success(res, sanitize(resource, row));
  } catch (error) {
    failure(res, error);
  }
};

export const createResource = async (req, res) => {
  try {
    const resourceName = req.params.resource;
    const resource = resources[resourceName];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const missing = missingFields(req.body, resource.required);
    if (missing.length > 0) {
      return validationError(res, `Campos obrigatórios em falta: ${missing.join(", ")}.`);
    }

    const validationErrors = await validateResourceData(resourceName, req.body);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const row = await resource.model.store(req.body);
    success(res, sanitize(resource, row), 201);
  } catch (error) {
    failure(res, error);
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (req.fileValidationError) return validationError(res, req.fileValidationError);
    if (!req.file) return validationError(res, "Ficheiro obrigatório em falta.");

    const data = {
      id_tcc: req.body.id_tcc,
      nome: req.body.nome || req.file.originalname,
      tipo: req.body.tipo || req.file.mimetype,
      caminho_arquivo: `/uploads/${req.file.filename}`,
    };

    const missing = missingFields(data, resources.documentos.required);
    if (missing.length > 0) {
      return validationError(res, `Campos obrigatórios em falta: ${missing.join(", ")}.`);
    }

    const validationErrors = await validateResourceData("documentos", data);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const row = await DocumentoModel.store(data);
    success(res, row, 201);
  } catch (error) {
    failure(res, error);
  }
};

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

export const updateResource = async (req, res) => {
  try {
    const resourceName = req.params.resource;
    const resource = resources[resourceName];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const validationErrors = await validateResourceData(resourceName, req.body);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const result = await resource.model.update(req.params.id, req.body);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Registo não encontrado ou sem alterações." });
    }

    success(res, sanitize(resource, { id: req.params.id, ...req.body }));
  } catch (error) {
    failure(res, error);
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = resources[req.params.resource];
    if (!resource) return res.status(404).json({ message: "Recurso não encontrado." });

    const result = await resource.model.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Registo não encontrado." });
    }

    success(res, { id: req.params.id });
  } catch (error) {
    failure(res, error);
  }
};

export const listApprovals = async (req, res) => {
  try {
    const [tccs, bancas, defesas, allTccs, allBancas] = await Promise.all([
      AprovacaoTccModel.findAll(),
      AprovacaoBancaModel.findAll(),
      AprovacaoDefesaModel.findAll(),
      TccModel.findAll(),
      BancaModel.findAll(),
    ]);
    const tccsById = indexById(allTccs);
    const bancasById = indexById(allBancas);

    success(res, [
      ...tccs.map((item) => ({ ...item, tcc_tema: tccsById[item.id_tcc]?.tema || "", tipo: "tcc" })),
      ...bancas.map((item) => ({ ...item, banca_sala: bancasById[item.id_banca]?.sala || "", tipo: "banca" })),
      ...defesas.map((item) => ({ ...item, tcc_tema: tccsById[item.id_tcc]?.tema || "", tipo: "defesa" })),
    ].filter((row) => matchesFilters(row, req.query)));
  } catch (error) {
    failure(res, error);
  }
};

export const createApproval = async (req, res) => {
  try {
    const { tipo = "tcc", ...data } = req.body;
    const model = approvalModels[tipo];
    if (!model) return res.status(400).json({ message: "Tipo de aprovação inválido." });

    const missing = missingFields(data, approvalRequiredFields[tipo]);
    if (missing.length > 0) {
      return validationError(res, `Campos obrigatórios em falta: ${missing.join(", ")}.`);
    }

    const validationErrors = await validateApprovalData(tipo, data);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const row = await model.store(data);
    success(res, { ...row, tipo }, 201);
  } catch (error) {
    failure(res, error);
  }
};

export const updateApproval = async (req, res) => {
  try {
    const { tipo = "tcc", ...data } = req.body;
    const model = approvalModels[tipo];
    if (!model) return res.status(400).json({ message: "Tipo de aprovação inválido." });

    const validationErrors = await validateApprovalData(tipo, data);
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors.join("; "));
    }

    const result = await model.update(req.params.id, data);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Registo não encontrado ou sem alterações." });
    }

    success(res, { id: req.params.id, tipo, ...data });
  } catch (error) {
    failure(res, error);
  }
};

export const deleteApproval = async (req, res) => {
  try {
    const { tipo = "tcc" } = req.query;
    const model = approvalModels[tipo];
    if (!model) return res.status(400).json({ message: "Tipo de aprovação inválido." });

    const result = await model.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Registo não encontrado." });
    }

    success(res, { id: req.params.id, tipo });
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
