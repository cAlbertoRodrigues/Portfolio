const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ALLOWED = new Set(["projeto", "criativo", "software"]);

const uploadsDir = path.join(__dirname, "uploads");
const thumbsDir = path.join(uploadsDir, "thumbs");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const CARD_W = 900;
const CARD_H = 600;

function toPublicUrl(filePathAbs) {
  const rel = path.relative(uploadsDir, filePathAbs).replace(/\\/g, "/");
  return `http://localhost:3333/uploads/${rel}`;
}

function normalizeDriveUrl(input) {
  if (!input || typeof input !== "string") return input;
  const s = input.trim();

  const m1 = s.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m1?.[1]) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;

  const m2 = s.match(/[?&]id=([^&]+)/i);
  if (s.includes("drive.google.com") && m2?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  }

  return s;
}

async function isProbablyImageUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.toLowerCase().startsWith("image/")) return true;
  } catch {}

  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    const ct = res.headers.get("content-type") || "";
    if (!res.ok) return false;
    if (ct.toLowerCase().startsWith("image/")) return true;
    return false;
  } catch {
    return false;
  }
}

async function downloadToTemp(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Falha ao baixar imagem (${res.status}) ${txt}`);
  }

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.startsWith("image/")) throw new Error("URL não é imagem");

  const ext =
    ct.includes("png") ? ".png" :
    ct.includes("jpeg") || ct.includes("jpg") ? ".jpg" :
    ct.includes("webp") ? ".webp" :
    ".png";

  const buf = Buffer.from(await res.arrayBuffer());
  const tmpPath = path.join(uploadsDir, `${crypto.randomUUID()}${ext}`);
  fs.writeFileSync(tmpPath, buf);
  return tmpPath;
}

async function makeThumbFromFile(fileAbsPath) {
  const thumbName = `${crypto.randomUUID()}.jpg`;
  const thumbAbsPath = path.join(thumbsDir, thumbName);

  await sharp(fileAbsPath)
    .resize(CARD_W, CARD_H, { fit: "cover", position: "center" })
    .jpeg({ quality: 82 })
    .toFile(thumbAbsPath);

  return thumbAbsPath;
}

let projects = [];

app.get("/", (req, res) => {
  res.send("API OK. Use /projects, /upload e /uploads/...");
});

app.get("/projects", (req, res) => {
  res.json(projects);
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image obrigatória" });

    const originalAbs = path.join(uploadsDir, req.file.filename);
    const thumbAbs = await makeThumbFromFile(originalAbs);

    res.status(201).json({
      originalUrl: toPublicUrl(originalAbs),
      thumbUrl: toPublicUrl(thumbAbs),
    });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.post("/projects", async (req, res) => {
  try {
    const { title, category, link, image } = req.body || {};

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title inválido" });
    }

    if (!ALLOWED.has(category)) {
      return res
        .status(400)
        .json({ error: "category inválida (projeto|criativo|software)" });
    }

    if (!link || typeof link !== "string") {
      return res.status(400).json({ error: "link inválido" });
    }

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "image inválida" });
    }

    const normalizedImage = normalizeDriveUrl(image);

    let finalThumbUrl = "";
    let originalUrl = normalizedImage;

    const isUrl = /^https?:\/\//i.test(normalizedImage);

    if (isUrl) {
      const ok = await isProbablyImageUrl(normalizedImage);
      if (!ok) return res.status(400).json({ error: "image precisa ser uma URL de imagem" });

      const tmp = await downloadToTemp(normalizedImage);
      const thumbAbs = await makeThumbFromFile(tmp);

      try { fs.unlinkSync(tmp); } catch {}

      finalThumbUrl = toPublicUrl(thumbAbs);
    } else {
      return res.status(400).json({ error: "image precisa ser URL (ou use /upload)" });
    }

    const item = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      link: link.trim(),
      image: finalThumbUrl,
      originalImage: originalUrl,
    };

    projects = [item, ...projects];
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.delete("/projects/:id", (req, res) => {
  const { id } = req.params;

  const before = projects.length;
  projects = projects.filter((p) => p.id !== id);

  if (projects.length === before) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }

  res.status(204).end();
});

app.listen(3333, () => console.log("API on http://localhost:3333"));
