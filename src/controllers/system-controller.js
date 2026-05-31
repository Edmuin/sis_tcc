
import path from "path";

import { SystemService } from "../services/system-service.js";

export const dashboard = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/index_new.html"));
}

export const roles = async (req, res) => {
    const roles = await SystemService.roles();
    res.json(roles);
}

export const MeusDados = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Meus-dados.html"));
}

export const ConfigSobre = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Config-sobre.html"));
}

export const PainelPrincipal = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Painel-principal.html"));
}

export const Configuracoes = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Configurações.html"));
}

export const AreadeFormacao = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Area-de-Formacao.html"));
}

export const modulePage = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Tela-operacional.html"));
}
