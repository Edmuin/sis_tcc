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

const resultadoFechaDefesa = (resultado) => {
  return ["aprovado", "aprovado_com_correcoes", "reprovado"].includes(String(resultado || "").toLowerCase());
};

const validateDefesaPayload = async (data, { partial = false, currentId = null } = {}) => {
  const required = ["id_tcc", "id_banca", "data_defesa", "resultado"];
  const missing = partial ? [] : required.filter((field) => !hasValue(data[field]));
  const errors = missing.map((field) => `${field} é obrigatório`);

  if (hasValue(data.id_tcc)) {
    const tcc = await TccModel.findById(data.id_tcc);
    if (!tcc) errors.push("TCC não encontrado");
    else if (!(currentId ? ["aprovado", "agendado_defesa", "defendido"] : ["aprovado"]).includes(tcc.estado)) {
      errors.push("Só é possível agendar defesa para TCC aprovado");
    }
  }

  if (hasValue(data.id_banca)) {
    const banca = await BancaModel.findById(data.id_banca);
    if (!banca) errors.push("banca não encontrada");
  }

  if (hasValue(data.data_defesa) && Number.isNaN(Date.parse(data.data_defesa))) {
    errors.push("data_defesa inválida");
  }

  const defesas = await DefesaModel.findAll();

  if (hasValue(data.id_tcc)) {
    const alreadyScheduled = defesas.find((defesa) => (
      String(defesa.id_tcc) === String(data.id_tcc) && String(defesa.id) !== String(currentId || "")
    ));
    if (alreadyScheduled) errors.push("Este TCC já tem uma defesa agendada");
  }

  if (hasValue(data.id_banca) && hasValue(data.data_defesa)) {
    const conflicting = defesas.find((defesa) => (
      String(defesa.id_banca) === String(data.id_banca) &&
      String(defesa.data_defesa).slice(0, 10) === String(data.data_defesa).slice(0, 10) &&
      String(defesa.id) !== String(currentId || "")
    ));
    if (conflicting) errors.push("Esta banca já tem uma defesa marcada para esta data");
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
    const tcc = await TccModel.findById(data.id_tcc);
    await TccModel.update(data.id_tcc, { estado: "agendado_defesa" });
    await TccModel.addHistorico(data.id_tcc, {
      estado_anterior: tcc?.estado || "aprovado",
      estado_novo: "agendado_defesa",
      acao: "Defesa agendada",
      responsavel: requestUserLabel(req),
      observacao: `Defesa marcada para ${data.data_defesa}.`,
    });
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

    const fullData = { ...current, ...data };
    const errors = await validateDefesaPayload(fullData, { partial: true, currentId: req.params.id });
    if (errors.length > 0) return validationError(res, errors.join("; "));

    const result = await DefesaModel.update(req.params.id, data);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Defesa não encontrada ou sem alterações." });
    }

    const tcc = await TccModel.findById(fullData.id_tcc);
    const nextEstado = resultadoFechaDefesa(fullData.resultado) ? "defendido" : "agendado_defesa";
    await TccModel.update(fullData.id_tcc, { estado: nextEstado });

    if ((tcc?.estado || "") !== nextEstado || hasValue(data.resultado)) {
      await TccModel.addHistorico(fullData.id_tcc, {
        estado_anterior: tcc?.estado || "agendado_defesa",
        estado_novo: nextEstado,
        acao: resultadoFechaDefesa(fullData.resultado) ? "Defesa concluída" : "Defesa atualizada",
        responsavel: requestUserLabel(req),
        observacao: `Resultado da defesa: ${fullData.resultado}.`,
      });
    }

    return redirectOrJson(req, res, `/Defesas/${req.params.id}`, { data: { id: req.params.id, ...data } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar a defesa." });
  }
};

export const destroy = async (req, res) => {
  try {
    const current = await DefesaModel.findById(req.params.id);
    const result = await DefesaModel.deleteById(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Defesa não encontrada." });
    }

    if (current?.id_tcc) {
      const tcc = await TccModel.findById(current.id_tcc);
      if (tcc?.estado === "agendado_defesa") {
        await TccModel.update(current.id_tcc, { estado: "aprovado" });
        await TccModel.addHistorico(current.id_tcc, {
          estado_anterior: "agendado_defesa",
          estado_novo: "aprovado",
          acao: "Defesa eliminada",
          responsavel: requestUserLabel(req),
          observacao: "A defesa agendada foi removida.",
        });
      }
    }

    return redirectOrJson(req, res, "/Defesas", { data: { id: req.params.id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível eliminar a defesa." });
  }
};
