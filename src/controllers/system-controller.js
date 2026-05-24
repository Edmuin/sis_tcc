
import path from "path";

import { SystemService } from "../services/system-service.js";
import { UserService } from "../services/user-service.js";

export const dashboard = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/index_new.html"));
}

export const roles = async (req, res) => {
    const roles = await SystemService.roles();
    res.json(roles);
}

export const tcc = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/TCC.html"));
}

export const MeusDados = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Meus-dados.html"));
}

export const ConfigSobre = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Config-sobre.html"));
}

export const ConfigUtilizadores = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Config-utilizadores.html"));
}

export const Agendar = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Agendar.html"));
}

export const PainelPrincipal = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Painel-principal.html"));
}