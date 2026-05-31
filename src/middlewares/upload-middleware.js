import multer from "multer";
import path from "path";
import fs from "fs";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);

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
    const safeName = path.basename(file.originalname).replace(/[^\w.-]/g, "-");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isAllowed = allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension);

  if (!isAllowed) {
    req.fileValidationError = "Formato inválido. Envie apenas PDF, DOC ou DOCX.";
    return cb(null, false);
  }

  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
