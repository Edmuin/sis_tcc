import path from "path";

import { AreaFormacaoModel } from "../models/area_formacao.model.js";
import { normalizeOptionalText, normalizeText } from "../utils/validation.js";

const areaViewsPath = (...segments) => path.join(process.cwd(), "src/views/Area_de_Formacao", ...segments);

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const validationError = (res, message) => res.status(400).json({ message });

const normalizeAreaPayload = (body) => ({
  nome: normalizeText(body.nome),
  descricao: normalizeOptionalText(body.descricao),
});

const validateAreaPayload = (data, { partial = false } = {}) => {
  const missing = partial ? [] : ["nome"].filter((field) => !hasValue(data[field]));
  const errors = missing.map((field) => `${field} é obrigatório`);

  if (hasValue(data.nome) && String(data.nome).trim().length < 2) {
    errors.push("nome deve ter pelo menos 2 caracteres");
  }
  if (hasValue(data.nome) && String(data.nome).length > 50) {
    errors.push("nome deve ter no máximo 50 caracteres");
  }
  if (hasValue(data.descricao) && String(data.descricao).length > 255) {
    errors.push("descrição deve ter no máximo 255 caracteres");
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
  res.sendFile(areaViewsPath("index.html"));
};

export const create = async (req, res) => {
  res.sendFile(areaViewsPath("create.html"));
};

export const show = async (req, res) => {
  res.sendFile(areaViewsPath("show.html"));
};

export const edit = async (req, res) => {
  res.sendFile(areaViewsPath("edit.html"));
};

export const list = async (req, res) => {
  try {
    const rows = await AreaFormacaoModel.findAll();
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível listar as áreas de formação." });
  }
};

export const detail = async (req, res) => {
  try {
    const area = await AreaFormacaoModel.findById(req.params.id);
    if (!area) return res.status(404).json({ message: "Área de formação não encontrada." });

    res.json({ data: area });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível carregar a área de formação." });
  }
};

export const store = async (req, res) => {
  try {
    const data = normalizeAreaPayload(req.body);
    const errors = validateAreaPayload(data);

    if (errors.length > 0) return validationError(res, errors.join("; "));

    const area = await AreaFormacaoModel.store(data);
    return redirectOrJson(req, res, `/AreadeFormacao/${area.id}`, { data: area }, 201);
  } catch (error) {
    console.error(error);
    if (error?.code === "ER_DUP_ENTRY") return validationError(res, "Já existe uma área de formação com este nome.");
    res.status(500).json({ message: "Não foi possível criar a área de formação." });
  }
};

export const update = async (req, res) => {
  try {
    const current = await AreaFormacaoModel.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Área de formação não encontrada." });

    const data = normalizeAreaPayload(req.body);
    Object.keys(data).forEach((key) => {
      if (!hasValue(data[key])) delete data[key];
    });

    const errors = validateAreaPayload(data, { partial: true });
    if (errors.length > 0) return validationError(res, errors.join("; "));

    const result = await AreaFormacaoModel.update(req.params.id, data);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Área de formação não encontrada ou sem alterações." });
    }

    return redirectOrJson(req, res, `/AreadeFormacao/${req.params.id}`, { data: { id: req.params.id, ...data } });
  } catch (error) {
    console.error(error);
    if (error?.code === "ER_DUP_ENTRY") return validationError(res, "Já existe uma área de formação com este nome.");
    res.status(500).json({ message: "Não foi possível atualizar a área de formação." });
  }
};

export const destroy = async (req, res) => {
  try {
    const result = await AreaFormacaoModel.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Área de formação não encontrada." });
    }

    return redirectOrJson(req, res, "/AreadeFormacao", { data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível eliminar a área de formação." });
  }
};
