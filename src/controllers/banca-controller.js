import path from "path";

import { BancaModel } from "../models/banca.model.js";
import { isPositiveInteger } from "../utils/validation.js";

const bancaViewsPath = (...segments) => path.join(process.cwd(), "src/views/banca", ...segments);

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const validationError = (res, message) => res.status(400).json({ message });

const normalizeBancaPayload = (body) => ({
  data: body.data || null,
  sala: body.sala,
});

const validateBancaPayload = (data, { partial = false } = {}) => {
  const required = ["sala"];
  const missing = partial ? [] : required.filter((field) => !hasValue(data[field]));
  const errors = missing.map((field) => `${field} é obrigatório`);

  if (hasValue(data.sala) && !isPositiveInteger(data.sala)) {
    errors.push("sala deve ser um número inteiro positivo");
  }

  if (hasValue(data.data) && Number.isNaN(Date.parse(data.data))) {
    errors.push("data inválida");
  }

  if (hasValue(data.data)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dataBanca = new Date(data.data);
    if (!Number.isNaN(dataBanca.getTime()) && dataBanca < today) {
      errors.push("data da banca não pode estar no passado");
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
  res.sendFile(bancaViewsPath("index.html"));
};

export const create = async (req, res) => {
  res.sendFile(bancaViewsPath("create.html"));
};

export const show = async (req, res) => {
  res.sendFile(bancaViewsPath("show.html"));
};

export const edit = async (req, res) => {
  res.sendFile(bancaViewsPath("edit.html"));
};

export const list = async (req, res) => {
  try {
    const rows = await BancaModel.findAllOrdered();
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível listar as bancas." });
  }
};

export const detail = async (req, res) => {
  try {
    const banca = await BancaModel.findById(req.params.id);
    if (!banca) return res.status(404).json({ message: "Banca não encontrada." });

    res.json({ data: banca });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível carregar a banca." });
  }
};

export const store = async (req, res) => {
  try {
    const data = normalizeBancaPayload(req.body);
    const errors = validateBancaPayload(data);

    if (errors.length > 0) return validationError(res, errors.join("; "));

    const banca = await BancaModel.store(data);
    return redirectOrJson(req, res, `/Bancas/${banca.id}`, { data: banca }, 201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível criar a banca." });
  }
};

export const update = async (req, res) => {
  try {
    const current = await BancaModel.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Banca não encontrada." });

    const data = normalizeBancaPayload(req.body);
    Object.keys(data).forEach((key) => {
      if (!hasValue(data[key])) delete data[key];
    });

    const errors = validateBancaPayload(data, { partial: true });
    if (errors.length > 0) return validationError(res, errors.join("; "));

    const result = await BancaModel.update(req.params.id, data);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Banca não encontrada ou sem alterações." });
    }

    return redirectOrJson(req, res, `/Bancas/${req.params.id}`, { data: { id: req.params.id, ...data } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar a banca." });
  }
};

export const destroy = async (req, res) => {
  try {
    const result = await BancaModel.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Banca não encontrada." });
    }

    return redirectOrJson(req, res, "/Bancas", { data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível eliminar a banca." });
  }
};
