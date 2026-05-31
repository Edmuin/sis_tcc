import express from "express";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

import { PATHS } from "../../paths.js";
import authRoutes from "./routes/auth-routes.js";
import systemRoutes from "./routes/system-routes.js";
import userRoutes from "./routes/user-routes.js";
import { criarTodasTabelas } from "../../database/index.js";
import { configSession } from "./session/index.js";

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

configSession(app);

const port = process.env.PORT || 3000;

app.use("/", systemRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

const startServer = async () => {
  await criarTodasTabelas();
  app.listen(port, () => {
    console.log(`Server On Fire on port: http://localhost:${port}`);
  });
};

export default { app, startServer };