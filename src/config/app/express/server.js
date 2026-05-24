import express from "express";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

import { PATHS } from "../../paths.js";
import authRoutes from "./routes/auth-routes.js";
import systemRoutes from "./routes/system-routes.js";
import userRoutes from "./routes/user-routes.js";

dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

//caminho absoluto para as views
// const publicPath = path.join(process.cwd(), process.env.PUBLIC_PATH);
// const uploadsPath = path.join(process.cwd(), process.env.UPLOADS_PATH);

const app = express();

// app.use(express.static(PATHS.views));
app.use(express.static(PATHS.public));

// Middlewares para ler formulários
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", systemRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(PATHS.views, "index_new.html"));
});

export default app;