import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "user",
  colunas: {
    nome: "nome",
    email: "email",
    password: "password",
    telefone: "telefone",
    idade: "idade",
    genero: "genero",
    foto: "foto",
    role_id: "role_id"
  },
};

const userRepo = Repository(tabela);

export const UserModel = {
  async findAll() {
    return await userRepo.findAll();
  },

  async findById(id) {
    return await userRepo.findById(id);
  },

  async store(data) {
    return await userRepo.store(data);
  },

  async deleteById(id) {
    return await userRepo.deleteById(id);
  },
};