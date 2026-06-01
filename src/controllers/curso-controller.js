import path from "path";

import { AreaFormacaoModel } from "../models/area_formacao.model.js";
import { CursoModel } from "../models/curso.model.js";

const cursoViewsPath = (...segments) => path.join(process.cwd(), "src/views/curso", ...segments);

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const validationError = (res, message) => res.status(400).json({ message });

const normalizeCursoPayload = (body) => ({
  nome: body.nome,
  descricao: body.descricao,
  area_formacao_id: body.area_formacao_id,
});

const validateCursoPayload = async (data, { partial = false } = {}) => {
  const required = ["nome", "area_formacao_id"];
  const missing = partial ? [] : required.filter((field) => !hasValue(data[field]));
  const errors = missing.map((field) => `${field} é obrigatório`);

  if (hasValue(data.nome) && String(data.nome).trim().length < 2) {
    errors.push("nome deve ter pelo menos 2 caracteres");
  }

  if (hasValue(data.area_formacao_id)) {
    const areaId = Number(data.area_formacao_id);
    if (!Number.isInteger(areaId) || areaId <= 0) {
      errors.push("area_formacao_id deve ser positivo");
    } else {
      const area = await AreaFormacaoModel.findById(areaId);
      if (!area) errors.push("área de formação não encontrada");
    }
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
  res.sendFile(cursoViewsPath("index.html"));
};

export const create = async (req, res) => {
  res.sendFile(cursoViewsPath("create.html"));
};

export const show = async (req, res) => {
  res.sendFile(cursoViewsPath("show.html"));
};

export const edit = async (req, res) => {
  res.sendFile(cursoViewsPath("edit.html"));
};

export const list = async (req, res) => {
  try {
    const rows = await CursoModel.findAllWithArea();
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível listar os cursos." });
  }
};

export const detail = async (req, res) => {
  try {
    const curso = await CursoModel.findByIdWithArea(req.params.id);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });

    res.json({ data: curso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível carregar o curso." });
  }
};

export const store = async (req, res) => {
  try {
    const data = normalizeCursoPayload(req.body);
    const errors = await validateCursoPayload(data);

    if (errors.length > 0) return validationError(res, errors.join("; "));

    const curso = await CursoModel.store(data);
    return redirectOrJson(req, res, `/Curso/${curso.id}`, { data: curso }, 201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível criar o curso." });
  }
};

export const update = async (req, res) => {
  try {
    const current = await CursoModel.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Curso não encontrado." });

    const data = normalizeCursoPayload(req.body);
    Object.keys(data).forEach((key) => {
      if (!hasValue(data[key])) delete data[key];
    });

    const errors = await validateCursoPayload(data, { partial: true });
    if (errors.length > 0) return validationError(res, errors.join("; "));

    const result = await CursoModel.update(req.params.id, data);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Curso não encontrado ou sem alterações." });
    }

    return redirectOrJson(req, res, `/Curso/${req.params.id}`, { data: { id: req.params.id, ...data } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar o curso." });
  }
};

export const destroy = async (req, res) => {
  try {
    const result = await CursoModel.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Curso não encontrado." });
    }

    return redirectOrJson(req, res, "/Curso", { data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível eliminar o curso." });
  }
};
