import { pool } from "../config/database/mysql/db.js";
import { TccModel } from "../models/tcc.model.js";
import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";
import { isValidPdfUpload, removeUpload } from "../middlewares/upload-middleware.js";

const rolesWithFullAccess = new Set(["coordenador", "administrador"]);
const proposalStates = new Set(["pendente", "aprovada", "rejeitada", "necessita_alteracoes"]);
const submissionStates = new Set(["aguardando_revisao", "necessita_correcao", "aprovada", "rejeitada"]);

const actorProfile = async (user) => {
  const student = (await EstudanteModel.findAll()).find((row) => String(row.id_user) === String(user.id));
  const professor = (await ProfessorModel.findAll()).find((row) => String(row.id_user) === String(user.id));
  return { student, professor };
};

const canAccessTcc = async (req, tcc) => {
  if (rolesWithFullAccess.has(req.user.role) || req.user.role === "juri") return true;
  const { student, professor } = await actorProfile(req.user);
  return Boolean(
    (student && String(student.id) === String(tcc.id_estudante))
    || (professor && String(professor.id) === String(tcc.id_professor))
  );
};

const canEditProposal = async (req, tcc) => {
  if (rolesWithFullAccess.has(req.user.role)) return true;
  const { student } = await actorProfile(req.user);
  return Boolean(student && String(student.id) === String(tcc.id_estudante));
};

const canReview = async (req, tcc) => {
  if (rolesWithFullAccess.has(req.user.role)) return true;
  const { professor } = await actorProfile(req.user);
  return Boolean(professor && String(professor.id) === String(tcc.id_professor));
};

const getTcc = async (req, res) => {
  const tcc = await TccModel.findById(req.params.id);
  if (!tcc) {
    res.status(404).json({ message: "TCC não encontrado." });
    return null;
  }
  if (!(await canAccessTcc(req, tcc))) {
    res.status(403).json({ message: "Não tem permissão para este TCC." });
    return null;
  }
  return tcc;
};

const notify = async (userId, title, message) => {
  if (!userId) return;
  await pool.query("INSERT INTO tcc_notificacao (id_user, titulo, mensagem) VALUES (?, ?, ?)", [userId, title, message]);
};

export const overview = async (req, res) => {
  try {
    const tcc = await getTcc(req, res);
    if (!tcc) return;
    const [[proposals], [stages], [submissions], [comments], [notifications], [evaluations], [orientations]] = await Promise.all([
      pool.query("SELECT * FROM tcc_proposta WHERE id_tcc = ? ORDER BY created_at DESC", [tcc.id]),
      pool.query("SELECT * FROM tcc_etapa WHERE id_tcc = ? ORDER BY ordem, prazo, id", [tcc.id]),
      pool.query("SELECT * FROM tcc_submissao WHERE id_tcc = ? ORDER BY created_at DESC", [tcc.id]),
      pool.query("SELECT c.* FROM tcc_comentario c JOIN tcc_submissao s ON s.id = c.id_submissao WHERE s.id_tcc = ? ORDER BY c.created_at", [tcc.id]),
      pool.query("SELECT * FROM tcc_notificacao WHERE id_user = ? AND lida = FALSE ORDER BY created_at DESC", [req.user.id]),
      pool.query("SELECT * FROM tcc_avaliacao_juri WHERE id_tcc = ? ORDER BY created_at DESC", [tcc.id]),
      pool.query("SELECT * FROM tcc_orientacao WHERE id_tcc = ? ORDER BY data_sessao DESC", [tcc.id]),
    ]);
    res.json({ data: { tcc, proposals, stages, submissions, comments, notifications, evaluations, orientations } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível carregar o workflow do TCC." });
  }
};

export const evaluateTcc = async (req, res) => {
  try {
    const tcc = await getTcc(req, res);
    if (!tcc || req.user.role !== "juri") return res.status(403).json({ message: "Apenas o júri pode registar esta avaliação." });
    const values = ["nota_trabalho", "nota_apresentacao", "nota_defesa"].map((field) => Number(req.body[field]));
    if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 20)) return res.status(400).json({ message: "As notas devem estar entre 0 e 20." });
    const finalGrade = values.reduce((total, value) => total + value, 0) / values.length;
    const result = req.body.resultado || (finalGrade >= 10 ? "aprovado" : "reprovado");
    const [inserted] = await pool.query(
      "INSERT INTO tcc_avaliacao_juri (id_tcc, id_juri, nota_trabalho, nota_apresentacao, nota_defesa, nota_final, resultado, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [tcc.id, req.user.id, values[0], values[1], values[2], finalGrade.toFixed(2), result, req.body.observacoes || null]
    );
    const [[student]] = await pool.query("SELECT id_user FROM estudante WHERE id = ?", [tcc.id_estudante]);
    await notify(student?.id_user, "Resultado da defesa", `O TCC foi avaliado com resultado: ${result}.`);
    res.status(201).json({ data: { id: inserted.insertId, nota_final: finalGrade.toFixed(2), resultado: result } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível registar a avaliação." });
  }
};

export const createProposal = async (req, res) => {
  try {
    const tcc = await TccModel.findById(req.params.id);
    if (!tcc || !(await canEditProposal(req, tcc))) return res.status(403).json({ message: "Apenas o aluno responsável pode propor este tema." });
    const { titulo, area_investigacao, descricao } = req.body;
    if (!titulo) return res.status(400).json({ message: "O título da proposta é obrigatório." });
    const [result] = await pool.query(
      "INSERT INTO tcc_proposta (id_tcc, titulo, area_investigacao, descricao, id_autor) VALUES (?, ?, ?, ?, ?)",
      [tcc.id, titulo, area_investigacao || null, descricao || null, req.user.id]
    );
    const [[professor]] = await pool.query("SELECT id_user FROM professor WHERE id = ?", [tcc.id_professor]);
    await notify(professor?.id_user, "Nova proposta de TCC", `Existe uma nova proposta para o TCC ${titulo}.`);
    res.status(201).json({ data: { id: result.insertId, titulo, estado: "pendente" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível criar a proposta." });
  }
};

export const reviewProposal = async (req, res) => {
  try {
    const tcc = await getTcc(req, res);
    if (!tcc || !rolesWithFullAccess.has(req.user.role)) return;
    const state = req.body.estado;
    if (!proposalStates.has(state)) return res.status(400).json({ message: "Estado de proposta inválido." });
    const [result] = await pool.query(
      "UPDATE tcc_proposta SET estado = ?, parecer = ?, id_revisor = ? WHERE id = ? AND id_tcc = ?",
      [state, req.body.parecer || null, req.user.id, req.body.proposta_id, tcc.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Proposta não encontrada." });
    const [[proposal]] = await pool.query("SELECT id_autor, titulo FROM tcc_proposta WHERE id = ?", [req.body.proposta_id]);
    await notify(proposal?.id_autor, "Atualização da proposta", `A proposta ${proposal?.titulo || "do seu TCC"} foi atualizada.`);
    res.json({ message: "Proposta atualizada." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível rever a proposta." });
  }
};

export const createStage = async (req, res) => {
  try {
    const tcc = await getTcc(req, res);
    if (!tcc || !(await canReview(req, tcc))) return;
    if (!req.body.nome) return res.status(400).json({ message: "O nome da etapa é obrigatório." });
    const [result] = await pool.query(
      "INSERT INTO tcc_etapa (id_tcc, nome, prazo, ordem) VALUES (?, ?, ?, ?)",
      [tcc.id, req.body.nome, req.body.prazo || null, Number(req.body.ordem) || 0]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body, id_tcc: tcc.id, estado: "pendente" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível criar a etapa." });
  }
};

export const createSubmission = async (req, res) => {
  try {
    if (req.fileValidationError) return res.status(400).json({ message: req.fileValidationError });
    if (!(await isValidPdfUpload(req.file))) {
      await removeUpload(req.file);
      return res.status(400).json({ message: "O ficheiro enviado não é um PDF válido." });
    }
    const tcc = await getTcc(req, res);
    if (!tcc || !(await canEditProposal(req, tcc))) return res.status(403).json({ message: "Apenas o aluno responsável pode submeter documentos." });
    if (!req.body.titulo) return res.status(400).json({ message: "O título da submissão é obrigatório." });
    const documentPath = req.file ? `/uploads/${req.file.filename}` : req.body.documento || null;
    const [result] = await pool.query(
      "INSERT INTO tcc_submissao (id_tcc, id_etapa, titulo, documento, id_autor) VALUES (?, ?, ?, ?, ?)",
      [tcc.id, req.body.id_etapa || null, req.body.titulo, documentPath, req.user.id]
    );
    const [[professor]] = await pool.query("SELECT id_user FROM professor WHERE id = ?", [tcc.id_professor]);
    await notify(professor?.id_user, "Novo documento submetido", `${req.body.titulo} aguarda revisão.`);
    res.status(201).json({ data: { id: result.insertId, titulo: req.body.titulo, estado: "aguardando_revisao" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível submeter o documento." });
  }
};

export const reviewSubmission = async (req, res) => {
  try {
    const tcc = await getTcc(req, res);
    if (!tcc || !(await canReview(req, tcc))) return;
    if (!submissionStates.has(req.body.estado)) return res.status(400).json({ message: "Estado de submissão inválido." });
    const [result] = await pool.query(
      "UPDATE tcc_submissao SET estado = ?, comentario = ?, id_revisor = ? WHERE id = ? AND id_tcc = ?",
      [req.body.estado, req.body.comentario || null, req.user.id, req.body.submissao_id, tcc.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Submissão não encontrada." });
    const [[submission]] = await pool.query("SELECT id_autor, titulo FROM tcc_submissao WHERE id = ?", [req.body.submissao_id]);
    await notify(submission?.id_autor, "Revisão de documento", `A submissão ${submission?.titulo || "do seu TCC"} foi revista.`);
    res.json({ message: "Submissão revista." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível rever a submissão." });
  }
};

export const notifications = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM tcc_notificacao WHERE id_user = ? ORDER BY created_at DESC LIMIT 50", [req.user.id]);
  res.json({ data: rows });
};

export const createOrientation = async (req, res) => {
  try {
    const tcc = await getTcc(req, res);
    if (!tcc) return;
    const { student } = await actorProfile(req.user);
    if (!student || String(student.id) !== String(tcc.id_estudante)) return res.status(403).json({ message: "Apenas o aluno responsável pode solicitar orientação." });
    if (!req.body.data_sessao || !req.body.assunto) return res.status(400).json({ message: "Data e assunto são obrigatórios." });
    const [result] = await pool.query("INSERT INTO tcc_orientacao (id_tcc, data_sessao, assunto, id_autor) VALUES (?, ?, ?, ?)", [tcc.id, req.body.data_sessao, req.body.assunto, req.user.id]);
    const [[professor]] = await pool.query("SELECT id_user FROM professor WHERE id = ?", [tcc.id_professor]);
    await notify(professor?.id_user, "Pedido de orientação", `Foi solicitada uma sessão: ${req.body.assunto}.`);
    res.status(201).json({ data: { id: result.insertId, ...req.body, estado: "solicitada" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível solicitar a orientação." });
  }
};

export const updateOrientation = async (req, res) => {
  try {
    const tcc = await getTcc(req, res);
    if (!tcc || !(await canReview(req, tcc))) return;
    const allowedStates = new Set(["solicitada", "agendada", "concluida", "cancelada"]);
    if (!allowedStates.has(req.body.estado)) return res.status(400).json({ message: "Estado da orientação inválido." });
    const [result] = await pool.query("UPDATE tcc_orientacao SET estado = ?, presenca = ?, observacoes = ?, id_revisor = ? WHERE id = ? AND id_tcc = ?", [req.body.estado, req.body.presenca ?? null, req.body.observacoes || null, req.user.id, req.body.orientacao_id, tcc.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Sessão não encontrada." });
    const [[session]] = await pool.query("SELECT id_autor, assunto FROM tcc_orientacao WHERE id = ?", [req.body.orientacao_id]);
    await notify(session?.id_autor, "Atualização da orientação", `A sessão ${session?.assunto || "de orientação"} foi atualizada.`);
    res.json({ message: "Sessão atualizada." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Não foi possível atualizar a orientação." });
  }
};
