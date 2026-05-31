import multer from "multer";
import path from "path";
import fs from "fs";

// Define o diretório onde os ficheiros serão armazenados
const uploadPath = path.resolve("uploads");

// Garante que a pasta existe
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const uploadMiddleware = multer({ storage });
