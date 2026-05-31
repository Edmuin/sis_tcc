import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "aprovacao_tcc",
  colunas: {
    id_tcc: "id_tcc",
    id_subdireccao: "id_subdireccao",
    status: "status",
    data_aprovacao: "data_aprovacao",
    observacao: "observacao"
  },
};

const apro_tccRepo = Repository(tabela);

export const AprovacaoTccModel = {
  async findAll() {
    return await apro_tccRepo.findAll();
  },

  async findById(id) {
    return await apro_tccRepo.findById(id);
  },

  async store(data) {
    return await apro_tccRepo.store(data);
  },

  async update(id, data) {
    return await apro_tccRepo.update(id, data);
  },

  async deleteById(id) {
    return await apro_tccRepo.deleteById(id);
  },
};
