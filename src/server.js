import app from "./config/app/express/server.js";
import dotenv from "dotenv";
import { criarTodasTabelas } from "./config/database/index.js";

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await criarTodasTabelas();
    app.listen(port, () => {
      console.log(`Servidor ativo em: http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Não foi possível iniciar o servidor.");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
