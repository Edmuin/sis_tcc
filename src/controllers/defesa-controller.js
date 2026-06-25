import path from "path";

import { BancaModel } from "../models/banca.model.js";
import { DefesaModel } from "../models/defesa.model.js";
import { TccModel } from "../models/tcc.model.js";

const defesaViewsPath = (...segments) => path.join(process.cwd(), "src/views/defesas", ...segments);

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const validationError = (res, message) => res.status(400).json({ message });

const normalizeDefesaPayload = (body) => ({
  id_tcc: body.id_tcc,
  id_banca: body.id_banca,
  data_defesa: body.data_defesa,
  resultado: body.resultado,
});

const validateDefesaPayload = async (data, { partial = false } = {}) => {
  const required = ["id_tcc", "id_banca", "data_defesa", "resultado"];
  const missing = partial ? [] : required.filter((field) => !hasValue(data[field]));
  const errors = missing.map((field) => `${field} é obrigatório`);

  if (hasValue(data.id_tcc)) {
    const tcc = await TccModel.findById(data.id_tcc);
    if (!tcc) errors.push("TCC não encontrado");
  }

  if (hasValue(data.id_banca)) {
    const banca = await BancaModel.findById(data.id_banca);
    if (!banca) errors.push("banca não encontrada");
  }

  if (hasValue(data.data_defesa) && Number.isNaN(Date.parse(data.data_defesa))) {
    errors.push("data_defesa inválida");
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
  res.sendFile(defesaViewsPath("index.html"));
};

export const create = async (req, res) => {
  res.sendFile(defesaViewsPath("create.html"));
};

export const show = async (req, res) => {
  res.sendFile(defesaViewsPath("show.html"));
};

export const edit = async (req, res) => {
  res.sendFile(defesaViewsPath("edit.html"));
};

export const list = async (req, res) => {
  try {
    const rows = await DefesaModel.findAllWithDetails();
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível listar as defesas." });
  }
};

export const detail = async (req, res) => {
  try {
    const defesa = await DefesaModel.findByIdWithDetails(req.params.id);
    if (!defesa) return res.status(404).json({ message: "Defesa não encontrada." });

    res.json({ data: defesa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível carregar a defesa." });
  }
};

export const store = async (req, res) => {
  try {
    const data = normalizeDefesaPayload(req.body);
    const errors = await validateDefesaPayload(data);

    if (errors.length > 0) return validationError(res, errors.join("; "));

    const defesa = await DefesaModel.store(data);
    return redirectOrJson(req, res, `/Defesas/${defesa.id}`, { data: defesa }, 201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível criar a defesa." });
  }
};

export const update = async (req, res) => {
  try {
    const current = await DefesaModel.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Defesa não encontrada." });

    const data = normalizeDefesaPayload(req.body);
    Object.keys(data).forEach((key) => {
      if (!hasValue(data[key])) delete data[key];
    });

    const errors = await validateDefesaPayload(data, { partial: true });
    if (errors.length > 0) return validationError(res, errors.join("; "));

    const result = await DefesaModel.update(req.params.id, data);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Defesa não encontrada ou sem alterações." });
    }

    return redirectOrJson(req, res, `/Defesas/${req.params.id}`, { data: { id: req.params.id, ...data } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar a defesa." });
  }
};

export const destroy = async (req, res) => {
  try {
    const result = await DefesaModel.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Defesa não encontrada." });
    }

    return redirectOrJson(req, res, "/Defesas", { data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível eliminar a defesa." });
  }
};
