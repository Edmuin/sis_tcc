import { AprovacaoBancaModel } from "../../models/aprovacao_banca.model.js";
import { AprovacaoDefesaModel } from "../../models/aprovacao_defesa.model.js";
import { AprovacaoTccModel } from "../../models/aprovacao_tcc.model.js";
import { BancaModel } from "../../models/banca.model.js";
import { TccModel } from "../../models/tcc.model.js";
import { failure, success, validationError } from "./response.js";
import { missingFields } from "./validation.js";
import { approvalModels, approvalRequiredFields, indexById, matchesFilters, validateApprovalData } from "./registry.js";

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
