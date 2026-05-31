import Repository from "../config/database/repository.js";

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

  async findById(id) {
    return await defesaRepo.findById(id);
  },

  async store(data) {
    return await defesaRepo.store(data);
  },

  async deleteById(id) {
    return await defesaRepo.deleteById(id);
  },
};