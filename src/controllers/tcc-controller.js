import path from "path";

import { TccModel } from "../models/tcc.model.js";

const tccViewsPath = (...segments) => path.join(process.cwd(), "src/views/TCC", ...segments);

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const validationError = (res, message) => res.status(400).json({ message });

const normalizeTccPayload = (body) => {
  return {
    tema: body.tema,
    objectivo: body.objectivo,
    estado: body.estado,
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

const validateTccPayload = (data, { partial = false } = {}) => {
  const required = ["id_estudante", "id_professor"];
  const missing = partial ? [] : required.filter((field) => !hasValue(data[field]));
  const errors = missing.map((field) => `${field} é obrigatório`);

  if (hasValue(data.id_estudante) && Number(data.id_estudante) <= 0) {
    errors.push("id_estudante deve ser positivo");
  }

  if (hasValue(data.id_professor) && Number(data.id_professor) <= 0) {
    errors.push("id_professor deve ser positivo");
  }

  if (hasValue(data.estado) && Number(data.estado) < 0) {
    errors.push("estado deve ser positivo");
  }

  if (hasValue(data.data_submissao) && Number.isNaN(Date.parse(data.data_submissao))) {
    errors.push("data_submissao inválida");
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
    const errors = validateTccPayload(data);

    if (errors.length > 0) return validationError(res, errors.join("; "));

    const tcc = await TccModel.store(data);
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

    const errors = validateTccPayload(data, { partial: true });
    if (errors.length > 0) return validationError(res, errors.join("; "));

    const result = await TccModel.update(req.params.id, data);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "TCC não encontrado ou sem alterações." });
    }

    return redirectOrJson(req, res, `/tcc/${req.params.id}`, { data: { id: req.params.id, ...data } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar o TCC." });
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
