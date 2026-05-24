import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "aprovacao_tcc",
  colunas: {
    id_tcc: "id_tcc",
    id_subdireccao: "id_subdireccao",
    status: "status",
    data: "data",
    observacao: "observacao"
  },
};

const apro_tccRepo = Repository(tabela);

export const AprovacaoTccModel = {
  async findAll() {
    return await apro_defesaRepo.findAll();
  },

  async findById(id) {
    return await apro_defesaRepo.findById(id);
  },

  async store(data) {
    return await apro_defesaRepo.store(data);
  },

  async deleteById(id) {
    return await apro_defesaRepo.deleteById(id);
  },
};