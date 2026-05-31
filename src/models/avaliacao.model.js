import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "avaliacao",
  colunas: {
    id_tcc: "id_tcc",
    observacao: "observacao",
    data_avaliacao: "data_avaliacao"
  },
};


const avaliacaoRepo = Repository(tabela);

export const AvaliacaoModel = {
  async findAll() {
    return await avaliacaoRepo.findAll();
  },

  async findById(id) {
    return await avaliacaoRepo.findById(id);
  },

  async store(data) {
    return await avaliacaoRepo.store(data);
  },

  async deleteById(id) {
    return await avaliacaoRepo.deleteById(id);
  },
};