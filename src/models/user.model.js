import Repository from "../config/database/repository.js";

export const tabela = {
  nome: "user",
  colunas: {
    fullname: "fullname",
    email: "email",
    telefone: "telefone",
    idade: "idade",
    genero: "genero",
    role_id: "role_id",
    n_processo: "n_processo",
    curso: "curso",
    area_formacao: "area_formacao",
    n_mecanografico: "n_mecanografico",
    password: "password",
  },
};

console.log("Tabela User:", tabela);
const userRepo = Repository(tabela);

export const UserModel = {
  async findAll() {
    return await userRepo.findAll();
  },

  async findById(id) {
    return await userRepo.findById(id);
  },

  async findByEmail(email) {
    return await userRepo.findByEmail(email);
  },

  async store(data) {
    console.log(data)
    return await userRepo.store(data);
  },

  async update(id, data) {
    return await userRepo.update(id, data);
  },

  async deleteById(id) {
    return await userRepo.deleteById(id);
  },
};
