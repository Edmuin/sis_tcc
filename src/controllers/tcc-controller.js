import path from "path";

import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";
import { TccModel } from "../models/tcc.model.js";
import { UserModel } from "../models/user.model.js";

const tccViewsPath = (...segments) => path.join(process.cwd(), "src/views/TCC", ...segments);

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const validationError = (res, message) => res.status(400).json({ message });

const TCC_ESTADOS = ["rascunho", "submetido", "em_analise", "aprovado", "rejeitado", "agendado_defesa", "defendido"];

const TCC_ACOES = {
  submeter: {
    estado: "submetido",
    allowedFrom: ["rascunho", "rejeitado"],
  },
  analisar: {
    estado: "em_analise",
    allowedFrom: ["submetido"],
  },
  aprovar: {
    estado: "aprovado",
    allowedFrom: ["submetido", "em_analise", "rejeitado"],
  },
  rejeitar: {
    estado: "rejeitado",
    allowedFrom: ["submetido", "em_analise"],
  },
  marcar_defesa: {
    estado: "agendado_defesa",
    allowedFrom: ["aprovado"],
  },
  concluir_defesa: {
    estado: "defendido",
    allowedFrom: ["agendado_defesa"],
  },
};

const TCC_ACAO_LABELS = {
  criar: "TCC criado",
  atualizar: "TCC atualizado",
  submeter: "TCC submetido",
  analisar: "Em análise",
  aprovar: "TCC aprovado",
  rejeitar: "TCC rejeitado",
  marcar_defesa: "Defesa marcada",
  concluir_defesa: "Defesa concluída",
};

const normalizeTccPayload = (body) => {
  return {
    tema: body.tema,
    objectivo: body.objectivo,
    tipo: body.tipo || "individual",
    estado: body.estado,
    observacao: body.observacao,
    data_submissao: body.data_submissao || null,
    id_estudante: body.id_estudante,
    id_professor: body.id_professor,
    relatorio_pdf: body.relatorio_pdf,
  };
};

const uploadedTccFiles = (files = {}) => {
  const data = {};

  if (files.relatorio_pdf?.[0]) {
    data.relatorio_pdf = `/uploads/${files.relatorio_pdf[0].filename}`;
  }

  return data;
};

const asArray = (value) => {
  if (!hasValue(value)) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",");
};

const normalizeEstudantesIds = (body, tipo) => {
  const ids = [body.id_estudante, ...asArray(body.estudantes_ids)]
    .filter(hasValue)
    .map((id) => Number(id))
    .filter((id, index, list) => Number.isInteger(id) && id > 0 && list.indexOf(id) === index);

  return tipo === "colectivo" ? ids : ids.slice(0, 1);
};

const validateTccPayload = async (data, estudantesIds, { partial = false } = {}) => {
  const required = ["id_estudante", "id_professor"];
  const missing = partial ? [] : required.filter((field) => !hasValue(data[field]));
  const errors = missing.map((field) => `${field} é obrigatório`);

  if (hasValue(data.tipo) && !["individual", "colectivo"].includes(data.tipo)) {
    errors.push("tipo deve ser individual ou colectivo");
  }

  if (hasValue(data.id_estudante) && Number(data.id_estudante) <= 0) {
    errors.push("id_estudante deve ser positivo");
  }

  if (hasValue(data.id_professor) && Number(data.id_professor) <= 0) {
    errors.push("id_professor deve ser positivo");
  }

  if (hasValue(data.estado) && !TCC_ESTADOS.includes(data.estado)) {
    errors.push("estado inválido");
  }

  if (hasValue(data.data_submissao) && Number.isNaN(Date.parse(data.data_submissao))) {
    errors.push("data_submissao inválida");
  }

  if (hasValue(data.id_estudante) && !(await EstudanteModel.findById(data.id_estudante))) {
    errors.push("id_estudante não encontrado");
  }

  if (hasValue(data.id_professor) && !(await ProfessorModel.findById(data.id_professor))) {
    errors.push("id_professor não encontrado");
  }

  for (const idEstudante of estudantesIds) {
    if (!(await EstudanteModel.findById(idEstudante))) {
      errors.push(`estudante ${idEstudante} não encontrado`);
    }
  }

  if (data.tipo === "individual" && estudantesIds.length !== 1) {
    errors.push("TCC individual deve ter um estudante");
  }

  if (data.tipo === "colectivo" && estudantesIds.length < 2) {
    errors.push("TCC colectivo deve ter pelo menos dois estudantes");
  }

  return errors;
};

const wantsHtml = (req) => {
  return req.headers.accept?.includes("text/html") && !req.headers.accept?.includes("application/json");
};

const redirectOrJson = (req, res, redirectPath, payload, status = 200) => {
  if (wantsHtml(req)) return res.redirect(redirectPath);
  return res.status(status).json(payload);
};

const requestUserLabel = (req) => {
  return req.user?.fullname || req.user?.email || req.headers["x-user-email"] || "Sistema";
};

export const index = async (req, res) => {
  res.sendFile(tccViewsPath("index.html"));
};

export const create = async (req, res) => {
  res.sendFile(tccViewsPath("create.html"));
};

export const show = async (req, res) => {
  res.sendFile(tccViewsPath("show.html"));
};

export const edit = async (req, res) => {
  res.sendFile(tccViewsPath("edit.html"));
};

export const list = async (req, res) => {
  try {
    const rows = await TccModel.findAll();
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível listar os TCCs." });
  }
};

export const options = async (req, res) => {
  try {
    const [estudantes, professores, users] = await Promise.all([
      EstudanteModel.findAll(),
      ProfessorModel.findAll(),
      UserModel.findAll(),
    ]);
    const usersById = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    res.json({
      data: {
        estudantes: estudantes.map((estudante) => ({
          id: estudante.id,
          nome: usersById[estudante.id_user]?.fullname || `Estudante ${estudante.id}`,
          numero_estudante: estudante.numero_estudante,
          turma: estudante.turma,
        })),
        professores: professores.map((professor) => ({
          id: professor.id,
          nome: usersById[professor.id_user]?.fullname || `Professor ${professor.id}`,
          especializacao: professor.especializacao,
        })),
        estados: TCC_ESTADOS,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível carregar as opções do TCC." });
  }
};

export const detail = async (req, res) => {
  try {
    const tcc = await TccModel.findById(req.params.id);
    if (!tcc) return res.status(404).json({ message: "TCC não encontrado." });

    res.json({ data: tcc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível carregar o TCC." });
  }
};

export const store = async (req, res) => {
  try {
    if (req.fileValidationError) return validationError(res, req.fileValidationError);

    const data = {
      ...normalizeTccPayload(req.body),
      ...uploadedTccFiles(req.files),
    };
    data.estado = data.estado || "rascunho";
    const estudantesIds = normalizeEstudantesIds(req.body, data.tipo);
    const errors = await validateTccPayload(data, estudantesIds);

    if (errors.length > 0) return validationError(res, errors.join("; "));

    const tcc = await TccModel.store(data);
    await TccModel.replaceEstudantes(tcc.id, estudantesIds);
    await TccModel.addHistorico(tcc.id, {
      estado_novo: data.estado,
      acao: TCC_ACAO_LABELS.criar,
      responsavel: requestUserLabel(req),
      observacao: data.observacao || "Registo inicial do TCC.",
    });
    return redirectOrJson(req, res, `/tcc/${tcc.id}`, { data: tcc }, 201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível criar o TCC." });
  }
};

export const update = async (req, res) => {
  try {
    if (req.fileValidationError) return validationError(res, req.fileValidationError);

    const current = await TccModel.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "TCC não encontrado." });

    const data = {
      ...normalizeTccPayload(req.body),
      ...uploadedTccFiles(req.files),
    };
    Object.keys(data).forEach((key) => {
      if (!hasValue(data[key])) delete data[key];
    });

    const tipo = data.tipo || current.tipo || "individual";
    const estudantesIds = normalizeEstudantesIds(
      { ...req.body, id_estudante: data.id_estudante || current.id_estudante },
      tipo
    );
    data.tipo = tipo;
    data.id_estudante = estudantesIds[0] || data.id_estudante || current.id_estudante;

    const errors = await validateTccPayload(data, estudantesIds, { partial: true });
    if (errors.length > 0) return validationError(res, errors.join("; "));

    const result = await TccModel.update(req.params.id, data);
    if (!result) {
      return res.status(404).json({ message: "TCC sem alterações." });
    }

    await TccModel.replaceEstudantes(req.params.id, estudantesIds);
    await TccModel.addHistorico(req.params.id, {
      estado_anterior: current.estado,
      estado_novo: data.estado || current.estado || "rascunho",
      acao: TCC_ACAO_LABELS.atualizar,
      responsavel: requestUserLabel(req),
      observacao: data.observacao || "Dados do TCC atualizados.",
    });
    return redirectOrJson(req, res, `/tcc/${req.params.id}`, { data: { id: req.params.id, ...data } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar o TCC." });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const current = await TccModel.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "TCC não encontrado." });

    const action = TCC_ACOES[req.body.acao];
    if (!action) return validationError(res, "Ação de estado inválida.");

    const currentState = current.estado || "rascunho";
    if (!action.allowedFrom.includes(currentState)) {
      return validationError(res, `Não é possível executar esta ação a partir do estado ${currentState}.`);
    }

    const data = {
      estado: action.estado,
      observacao: hasValue(req.body.observacao) ? req.body.observacao : current.observacao,
    };

    if (req.body.acao === "submeter" && !current.data_submissao) {
      data.data_submissao = new Date();
    }

    await TccModel.update(req.params.id, data);
    await TccModel.addHistorico(req.params.id, {
      estado_anterior: currentState,
      estado_novo: action.estado,
      acao: TCC_ACAO_LABELS[req.body.acao] || req.body.acao,
      responsavel: requestUserLabel(req),
      observacao: data.observacao || null,
    });
    const tcc = await TccModel.findById(req.params.id);
    return res.json({ data: tcc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar o estado do TCC." });
  }
};

export const destroy = async (req, res) => {
  try {
    const result = await TccModel.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "TCC não encontrado." });
    }

    return redirectOrJson(req, res, "/tcc", { data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível eliminar o TCC." });
  }
};
