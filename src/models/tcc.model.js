import Repository from "../config/database/repository.js";
import { pool } from "../config/database/mysql/db.js";

export const tabela = {
  nome: "tcc",
  colunas: {
    tema: "tema",
    objectivo: "objectivo",
    tipo: "tipo",
    estado: "estado",
    observacao: "observacao",
    data_submissao: "data_submissao",
    id_estudante: "id_estudante",
    id_professor: "id_professor",
    relatorio_pdf: "relatorio_pdf"
  },
};

const tccRepo = Repository(tabela);

const attachHistorico = async (row) => {
  if (!row?.id) return row;

  const [historico] = await pool.query(
    `
      SELECT *
      FROM tcc_historico
      WHERE id_tcc = ?
      ORDER BY created_at DESC, id DESC
    `,
    [row.id]
  );

  row.historico = historico;
  return row;
};

const attachEstudantes = async (rows) => {
  const list = Array.isArray(rows) ? rows : [rows].filter(Boolean);
  if (list.length === 0) return rows;

  const ids = list.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");
  const [estudantes] = await pool.query(
    `
      SELECT
        tcc_estudante.id_tcc,
        tcc_estudante.id_estudante,
        tcc_estudante.papel,
        estudante.numero_estudante,
        estudante.numero_processo,
        estudante.turma,
        curso.nome AS curso_nome,
        user.fullname AS estudante_nome
      FROM tcc_estudante
      INNER JOIN estudante ON estudante.id = tcc_estudante.id_estudante
      LEFT JOIN user ON user.id = estudante.id_user
      LEFT JOIN curso ON curso.id = estudante.id_curso
      WHERE tcc_estudante.id_tcc IN (${placeholders})
      ORDER BY tcc_estudante.papel = 'principal' DESC, estudante.id ASC
    `,
    ids
  );

  const estudantesByTcc = estudantes.reduce((acc, estudante) => {
    if (!acc[estudante.id_tcc]) acc[estudante.id_tcc] = [];
    acc[estudante.id_tcc].push(estudante);
    return acc;
  }, {});

  list.forEach((row) => {
    row.estudantes = estudantesByTcc[row.id] || [];
    row.estudante_nome = row.estudante_nome || row.estudantes[0]?.estudante_nome || "";
    row.estudantes_nomes = row.estudantes.map((estudante) => estudante.estudante_nome || `Estudante ${estudante.id_estudante}`);
  });

  return rows;
};

export const TccModel = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT
        tcc.*,
        estudante_user.fullname AS estudante_nome,
        professor_user.fullname AS professor_nome
      FROM tcc
      LEFT JOIN estudante ON estudante.id = tcc.id_estudante
      LEFT JOIN user AS estudante_user ON estudante_user.id = estudante.id_user
      LEFT JOIN professor ON professor.id = tcc.id_professor
      LEFT JOIN user AS professor_user ON professor_user.id = professor.id_user
      ORDER BY tcc.id DESC
    `);
    return await attachEstudantes(rows);
  },

  async findById(id) {
    const [rows] = await pool.query(
      `
        SELECT
          tcc.*,
          estudante_user.fullname AS estudante_nome,
          professor_user.fullname AS professor_nome
        FROM tcc
        LEFT JOIN estudante ON estudante.id = tcc.id_estudante
        LEFT JOIN user AS estudante_user ON estudante_user.id = estudante.id_user
        LEFT JOIN professor ON professor.id = tcc.id_professor
        LEFT JOIN user AS professor_user ON professor_user.id = professor.id_user
        WHERE tcc.id = ?
      `,
      [id]
    );
    const row = rows[0];
    if (!row) return row;

    await attachEstudantes(row);
    await attachHistorico(row);
    return row;
  },

  async store(data) {
    return await tccRepo.store({
      ...data,
      tipo: data.tipo || "individual",
      estado: data.estado || "rascunho",
    });
  },

  async update(id, data) {
    return await tccRepo.update(id, data);
  },

  async deleteById(id) {
    return await tccRepo.deleteById(id);
  },

  async replaceEstudantes(id, estudantesIds = []) {
    await pool.query("DELETE FROM tcc_estudante WHERE id_tcc = ?", [id]);

    if (estudantesIds.length === 0) return;

    const values = estudantesIds.map((idEstudante, index) => [
      id,
      idEstudante,
      index === 0 ? "principal" : "autor",
    ]);

    await pool.query(
      "INSERT INTO tcc_estudante (id_tcc, id_estudante, papel) VALUES ?",
      [values]
    );
  },

  async addHistorico(id, data) {
    await pool.query(
      `
        INSERT INTO tcc_historico
          (id_tcc, estado_anterior, estado_novo, acao, responsavel, observacao)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        data.estado_anterior || null,
        data.estado_novo,
        data.acao,
        data.responsavel || "Sistema",
        data.observacao || null,
      ]
    );
  },
};
