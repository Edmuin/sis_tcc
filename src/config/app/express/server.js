import express from "express";
import dotenv from "dotenv";

import path from "path";

import { PATHS } from "../../paths.js";
import authRoutes from "./routes/auth-routes.js";
import systemRoutes from "./routes/system-routes.js";
import userRoutes from "./routes/user-routes.js";
import tccRoutes from "./routes/tcc-routes.js";
import areaFormacaoRoutes from "./routes/area-formacao-routes.js";
import cursoRoutes from "./routes/curso-routes.js";
import bancaRoutes from "./routes/banca-routes.js";
import defesaRoutes from "./routes/defesa-routes.js";
import { runMigrations } from "../../../database/migrate.js";
import { configSession } from "./session/index.js";
import operationalRoutes from "./routes/operational-routes.js";
import { allowRoles, populateUser, requireAuth } from "../../../middlewares/auth-middleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { downloadUpload } from "../../../controllers/upload-controller.js";
import { sameOrigin } from "../../../middlewares/same-origin-middleware.js";
import workflowRoutes from "./routes/workflow-routes.js";

dotenv.config();

const app = express();

app.use(express.static(PATHS.public));
app.use(helmet({ contentSecurityPolicy: false }));
app.use("/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));

// Middlewares para ler formulários

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

configSession(app);
app.use(populateUser);
app.use(sameOrigin);
app.get("/uploads/:filename", requireAuth, downloadUpload);

const port = process.env.PORT || 3000;
const coordinatorOrTeacherRead = (req, res, next) => {
    if (["coordenador", "administrador"].includes(req.user?.role)) return next();
    if (["tutor", "juri"].includes(req.user?.role) && req.method === "GET") return next();
    return res.status(403).send("Não tem permissão para aceder a este recurso.");
};

app.use("/tcc", requireAuth, (req, res, next) => {
    if (req.user?.role === "juri" && req.method !== "GET") return res.status(403).send("O júri tem acesso apenas para consulta.");
    return allowRoles("aluno", "tutor", "coordenador", "juri", "administrador")(req, res, next);
}, tccRoutes);
app.use("/AreadeFormacao", requireAuth, coordinatorOrTeacherRead, areaFormacaoRoutes);
app.use("/Curso", requireAuth, coordinatorOrTeacherRead, cursoRoutes);
app.use("/Bancas", requireAuth, coordinatorOrTeacherRead, bancaRoutes);
app.use("/Defesas", requireAuth, coordinatorOrTeacherRead, defesaRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api", operationalRoutes);
app.use("/workflow", workflowRoutes);
app.get("/health", async (req, res) => {
    try {
        const { pool } = await import("../../database/mysql/db.js");
        await pool.query("SELECT 1");
        return res.json({ status: "ok", service: "sis-tcc", database: "ok" });
    } catch (error) {
        return res.status(503).json({ status: "degraded", service: "sis-tcc", database: "unavailable" });
    }
});
app.use("/", systemRoutes);

const startServer = async () => {
  await runMigrations();
  app.listen(port, () => {
    console.log(`Server On Fire on port: http://localhost:${port}`);
  });
};
app.get("/", (req, res) => {
    res.sendFile(path.join(PATHS.views, "index_new.html"));
});

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pagina nao encontrada - Gestor TCC</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f7fb; color: #172033; display: grid; min-height: 100vh; place-items: center; margin: 0; }
                main { text-align: center; max-width: 460px; padding: 32px; }
                h1 { font-size: 56px; margin: 0 0 12px; }
                p { line-height: 1.5; }
                a { color: #0f766e; font-weight: 700; }
            </style>
        </head>
        <body>
            <main>
                <h1>404</h1>
                <p>A pagina que procuras nao foi encontrada.</p>
                <a href="/PainelPrincipal">Voltar ao painel</a>
            </main>
        </body>
        </html>
    `);
});

app.use((error, req, res, next) => {
    console.error("Erro não tratado:", error);
    if (res.headersSent) return next(error);
    return res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
});

export default { app, startServer };
