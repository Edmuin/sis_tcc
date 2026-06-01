import Repository from "../config/database/repository.js";
import { pool } from "../config/database/mysql/db.js";

export const tabela = {
  nome: "curso",
  colunas: {
    nome: "nome",
    descricao: "descricao",
    area_formacao_id: "area_formacao_id"
  },
};

const cursoRepo = Repository(tabela);

export const CursoModel = {
  async findAll() {
    return await cursoRepo.findAll();
  },

  async findAllWithArea() {
    const [rows] = await pool.query(`
      SELECT curso.*, area_formacao.nome AS area_formacao_nome
      FROM curso
      LEFT JOIN area_formacao ON area_formacao.id = curso.area_formacao_id
      ORDER BY curso.id DESC
    `);
    return rows;
  },

  async findById(id) {
    return await cursoRepo.findById(id);
  },

  async findByIdWithArea(id) {
    const [rows] = await pool.query(
      `
        SELECT curso.*, area_formacao.nome AS area_formacao_nome
        FROM curso
        LEFT JOIN area_formacao ON area_formacao.id = curso.area_formacao_id
        WHERE curso.id = ?
      `,
      [id]
    );
    return rows[0];
  },

  async store(data) {
    return await cursoRepo.store(data);
  },

  async update(id, data) {
    return await cursoRepo.update(id, data);
  },

  async deleteById(id) {
    return await cursoRepo.deleteById(id);
  },
};
