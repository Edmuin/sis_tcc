import multer from "multer";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedPdfMimeTypes = new Set(["application/pdf"]);
const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);
const allowedPdfExtensions = new Set([".pdf"]);

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

const pdfFileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isAllowed = allowedPdfMimeTypes.has(file.mimetype) && allowedPdfExtensions.has(extension);

  if (!isAllowed) {
    req.fileValidationError = "Formato inválido. Envie apenas ficheiros PDF.";
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

export const pdfUploadMiddleware = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const isValidPdfUpload = async (file) => {
  if (!file?.path) return true;
  try {
    const handle = await fsPromises.open(file.path, "r");
    const buffer = Buffer.alloc(5);
    await handle.read(buffer, 0, 5, 0);
    await handle.close();
    return buffer.toString("ascii") === "%PDF-";
  } catch {
    return false;
  }
};

export const removeUpload = async (file) => {
  if (file?.path) await fsPromises.unlink(file.path).catch(() => {});
};
