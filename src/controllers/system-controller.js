
import path from "path";

import { CursoModel } from "../models/curso.model.js";
import { EstudanteModel } from "../models/estudante.model.js";
import { ProfessorModel } from "../models/professor.model.js";
import { TccModel } from "../models/tcc.model.js";
import { UserModel } from "../models/user.model.js";
import { RoleService } from "../services/role-service.js";
import { SystemService } from "../services/system-service.js";
import { normalizeRole } from "../utils/validation.js";

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const currentUser = (req) => {
    if (!req.user && req.session?.user) req.user = req.session.user;
    return req.user || null;
};

const findCurrentEstudante = async (user) => {
    if (!user) return null;

    const estudantes = await EstudanteModel.findAll();
    return estudantes.find((estudante) => (
        String(estudante.id_user) === String(user.id) ||
        (hasValue(user.n_processo) && String(estudante.numero_processo) === String(user.n_processo)) ||
        (hasValue(user.n_processo) && String(estudante.numero_estudante) === String(user.n_processo))
    )) || null;
};

const findCurrentProfessor = async (user) => {
    if (!user) return null;

    const professores = await ProfessorModel.findAll();
    return professores.find((professor) => String(professor.id_user) === String(user.id)) || null;
};

const resolveCursoNome = async (user, estudante) => {
    const cursoId = estudante?.id_curso || user?.curso;
    if (!hasValue(cursoId)) return user?.curso || "";

    const curso = await CursoModel.findById(cursoId);
    return curso?.nome || user?.curso || "";
};

const resolveOrientadorNome = async (estudante) => {
    if (!estudante?.id) return "";

    const tccs = await TccModel.findAll();
    const tcc = tccs.find((row) => (
        String(row.id_estudante) === String(estudante.id) ||
        (row.estudantes || []).some((item) => String(item.id_estudante) === String(estudante.id))
    ));

    return tcc?.professor_nome || "";
};

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

export const MeusDadosApi = async (req, res) => {
    try {
        const sessionUser = currentUser(req);
        if (!sessionUser) return res.status(401).json({ message: "Utilizador não autenticado." });

        const user = await UserModel.findById(sessionUser.id) || sessionUser;
        const role = user.role_id ? await RoleService.getRoleById(user.role_id) : null;
        const roleName = role?.nome || sessionUser.role || "";
        const normalizedRole = normalizeRole(roleName);
        const estudante = normalizedRole === "aluno" ? await findCurrentEstudante(user) : null;
        const professor = ["professor", "tutor"].includes(normalizedRole) ? await findCurrentProfessor(user) : null;
        const cursoNome = await resolveCursoNome(user, estudante);
        const orientadorNome = await resolveOrientadorNome(estudante);

        res.json({
            data: {
                id: user.id,
                fullname: user.fullname || "",
                email: user.email || "",
                telefone: user.telefone || "",
                idade: user.idade || "",
                genero: user.genero || "",
                role: roleName,
                n_processo: user.n_processo || estudante?.numero_processo || "",
                n_mecanografico: user.n_mecanografico || "",
                area_formacao: user.area_formacao || "",
                curso: cursoNome,
                orientador: orientadorNome,
                numero_estudante: estudante?.numero_estudante || "",
                turma: estudante?.turma || "",
                ano_lectivo: estudante?.ano_lectivo || "",
                especializacao: professor?.especializacao || "",
                categoria: professor?.categoria || "",
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Não foi possível carregar os dados do utilizador." });
    }
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
