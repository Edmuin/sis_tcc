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
import { criarTodasTabelas } from "../../database/index.js";
import { configSession } from "./session/index.js";
import operationalRoutes from "./routes/operational-routes.js";

dotenv.config();

const app = express();

app.use(express.static(PATHS.public));
app.use("/uploads", express.static(path.resolve("uploads")));

// Middlewares para ler formulários

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

configSession(app);

const port = process.env.PORT || 3000;

app.use("/tcc", tccRoutes);
app.use("/AreadeFormacao", areaFormacaoRoutes);
app.use("/Curso", cursoRoutes);
app.use("/Bancas", bancaRoutes);
app.use("/Defesas", defesaRoutes);
app.use("/", systemRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api", operationalRoutes);

const startServer = async () => {
  await criarTodasTabelas();
  app.listen(port, () => {
    console.log(`Server On Fire on port: http://localhost:${port}`);
  });
};
app.get("/", (req, res) => {
    res.sendFile(path.join(PATHS.views, "index_new.html"));
});

app.use((error, req, res, next) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "O ficheiro deve ter no máximo 10MB." });
    }

    if (error) {
        console.error(error);
        return res.status(500).json({ message: "Não foi possível processar o pedido." });
    }

    return next();
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

export default { app, startServer };
