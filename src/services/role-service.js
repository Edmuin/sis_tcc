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
  }
}