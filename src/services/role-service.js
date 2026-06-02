import { UserModel } from "../models/user.model.js";
import { RoleModel } from "../models/role.model.js";

export const RoleService = {
  async dashboard () {
    const dados = await UserModel.findAll();
    return dados;
  },

  async roles () {
    const roles = await RoleModel.findAll();
    return roles;
  },

  async getRoleByName (name) {
    const role = await RoleModel.findByName(name);
    return role;
  },

  async getRoleById (id) {
    const role = await RoleModel.findById(id);
    return role;
  }
}
