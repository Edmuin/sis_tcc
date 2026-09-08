import fs from "fs";
import path from "path";
import { TccModel } from "../models/tcc.model.js";
import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";

export const downloadUpload = async (req, res) => {
  const filename = path.basename(req.params.filename);
  const tcc = (await TccModel.findAll()).find((row) => path.basename(row.relatorio_pdf || "") === filename);
  if (!tcc) return res.status(404).send("Ficheiro não encontrado.");

  if (!["coordenador", "administrador"].includes(req.user.role)) {
    const student = (await EstudanteModel.findAll()).find((row) => String(row.id_user) === String(req.user.id));
    const professor = (await ProfessorModel.findAll()).find((row) => String(row.id_user) === String(req.user.id));
    const permitted = (student && String(student.id) === String(tcc.id_estudante))
      || (professor && String(professor.id) === String(tcc.id_professor));
    if (!permitted) return res.status(403).send("Não tem permissão para aceder a este ficheiro.");
  }

  const filePath = path.resolve("uploads", filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("Ficheiro não encontrado.");
  return res.sendFile(filePath);
};
