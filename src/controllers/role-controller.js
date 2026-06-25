import path from "path";

import { RoleService } from "../services/role-service.js";
import { UserService } from "../services/user-service.js";

export const roles = async (req, res) => {
    const roles = await RoleService.roles();
    res.json(roles);
}
