import path from "path";

import { RoleService } from "../services/role-service.js";
import { UserService } from "../services/user-service.js";

export const dashboard = async (req, res) => {
    const filePath = path.join(process.cwd(), "src/views/index.html");
    res.sendFile(filePath);
}

export const roles = async (req, res) => {
    const roles = await RoleService.roles();
    res.json(roles);
}
