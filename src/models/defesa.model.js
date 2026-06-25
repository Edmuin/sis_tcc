import Repository from "../config/database/repository.js";
import { pool } from "../config/database/mysql/db.js";

export const tabela = {
  nome: "defesa",
  colunas: {
    id_tcc: "id_tcc",
    id_banca: "id_banca",
    data_defesa: "data_defesa",
    resultado: "resultado"
  },
};

const defesaRepo = Repository(tabela);

export const DefesaModel = {
  async findAll() {
    return await defesaRepo.findAll();
  },

  async findAllWithDetails() {
    const [rows] = await pool.query(`
      SELECT defesa.*, tcc.tema AS tcc_tema, banca.sala AS banca_sala, banca.data AS banca_data
      FROM defesa
      LEFT JOIN tcc ON tcc.id = defesa.id_tcc
      LEFT JOIN banca ON banca.id = defesa.id_banca
      ORDER BY defesa.id DESC
    `);
    return rows;
  },

  async findById(id) {
    return await defesaRepo.findById(id);
  },

  async findByIdWithDetails(id) {
    const [rows] = await pool.query(
      `
        SELECT defesa.*, tcc.tema AS tcc_tema, banca.sala AS banca_sala, banca.data AS banca_data
        FROM defesa
        LEFT JOIN tcc ON tcc.id = defesa.id_tcc
        LEFT JOIN banca ON banca.id = defesa.id_banca
        WHERE defesa.id = ?
      `,
      [id]
    );
    return rows[0];
  },

  async store(data) {
    return await defesaRepo.store(data);
  },

  async update(id, data) {
    return await defesaRepo.update(id, data);
  },

  async deleteById(id) {
    return await defesaRepo.deleteById(id);
  },
};
