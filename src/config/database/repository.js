import { pool } from "./mysql/db.js";

function Repository(table) {
  const nomes_colunas = Object.values(table.colunas);
  const colunas_sql = `(${nomes_colunas.join(", ")})`;
  const valores_sql = `(${nomes_colunas.map(() => "?").join(", ")})`;

  return {
    async findAll() {
      try {
        const [rows] = await pool.query(`SELECT * FROM ${table.nome}`);
        return rows;
      } catch (error) {
        console.error("Erro ao buscar todos:", error);
        throw error;
      }
    },

    async findById(id) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM ${table.nome} WHERE id = ?`,
          [id]
        );
        return rows[0];
      } catch (error) {
        console.error("Erro ao buscar por ID:", error);
        throw error;
      }
    },

    async store(entity) {
      try {
        const values = nomes_colunas.map((coluna) => entity[coluna]);

        const [result] = await pool.query(
          `INSERT INTO ${table.nome} ${colunas_sql} VALUES ${valores_sql}`,
          values
        );
        return { id: result.insertId, ...entity };
      } catch (error) {
        console.error("Erro ao inserir:", error);
        throw error;
      }
    },

    async update(id, entity) {
      try {
        // Build SET clause only for columns present in the entity
        const updates = [];
        const values = [];

        for (const coluna of nomes_colunas) {
          if (Object.prototype.hasOwnProperty.call(entity, coluna)) {
            updates.push(`${coluna} = ?`);
            values.push(entity[coluna]);
          }
        }

        if (updates.length === 0) {
          // Nothing to update
          return null;
        }

        const sql = `UPDATE ${table.nome} SET ${updates.join(", ")} WHERE id = ?`;
        const params = [...values, id];

        const [result] = await pool.query(sql, params);
        return result;
      } catch (error) {
        console.error("Erro ao atualizar:", error);
        throw error;
      }
    },

    async deleteById(id) {
      try {
        const [result] = await pool.query(
          `DELETE FROM ${table.nome} WHERE id = ?`,
          [id]
        );
        return result;
      } catch (error) {
        console.error("Erro ao excluir:", error);
        throw error;
      }
    },
  };
}

export default Repository;
