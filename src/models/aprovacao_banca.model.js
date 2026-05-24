import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "aprovacao_banca",
  colunas: {
    id_banca: "id_banca",
    id_subdireccao: "id_subdireccao",
    status: "status",
    data: "data",
    observacao: "observacao"
  },
  // colunas: "(id_banda, id_subdireccao, status, data, observacao)",
  // querys: "(?, ?, ?, ?, ?)",

};

const apro_bancaRepo = Repository(tabela);

export const AprovacaoBancaModel = {
  async findAll() {
    return await apro_bancaRepo.findAll();
  },

  async findById(id) {
    return await apro_bancaRepo.findById(id);
  },

  async store(data) {
    return await apro_bancaRepo.store(data);
  },

  async deleteById(id) {
    return await apro_bancaRepo.deleteById(id);
  },
};