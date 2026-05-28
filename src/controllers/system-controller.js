
import path from "path";

import { SystemService } from "../services/system-service.js";
import { UserService } from "../services/user-service.js";
import { TccModel } from "../models/tcc.model.js";

export const dashboard = async (req, res) => {
    const dados = await SystemService.dashboard();

    res.render("index_new", {
        dados
    });
}

export const roles = async (req, res) => {
    const roles = await SystemService.roles();
    res.json(roles);
}

export const tcc = async (req, res) => {
    const tccs = await TccModel.findAll();

    res.render("TCC", {
        tccs
    });
}

export const MeusDados = async (req, res) => {

    const usuario = await UserModel.findById(req.session.user.id);

    res.render("Meus-dados", {
        usuario
    });
}

export const ConfigSobre = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Config-sobre.html"));
}

export const ConfigUtilizadores = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Config-utilizadores.html"));
}

export const agendar = async (req, res) => {

    const bancas = await BancaModel.findAll();

    res.render("agendar", {
        bancas
    });
}

export const PainelPrincipal = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Painel-principal.html"));
}

export const Configuracoes = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Configurações.html"));
}

export const cursos = async (req, res) => {

    const cursos = await CursoModel.findAll();

    res.render("Curso", {
        cursos
    });
}

export const AreadeFormacao = async (req, res) => {
    res.sendFile(path.join(process.cwd(), "src/views/Area-de-Formacao.html"));
}
