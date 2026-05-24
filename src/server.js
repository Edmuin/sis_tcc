import app from "./config/app/express/server.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = 
  () => 
    app.listen(port, () => {
      console.log(`Server On Fire on port: http://localhost:${port}`);
    });

startServer();