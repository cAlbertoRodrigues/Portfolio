const fs = require("fs");
const path = require("path");
const readline = require("readline");

const API = "http://localhost:3333";
const ALLOWED = new Set(["projeto", "criativo", "software"]);

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
}

function mimeFromExt(p) {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

async function uploadImage(filePath) {
  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(abs)) throw new Error("Arquivo de imagem não encontrado");

  const buf = fs.readFileSync(abs);
  const blob = new Blob([buf], { type: mimeFromExt(abs) });

  const fd = new FormData();
  fd.append("image", blob, path.basename(abs));

  const res = await fetch(`${API}/upload`, { method: "POST", body: fd });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Falha no upload (${res.status}) ${txt}`);
  }
  const data = await res.json();
  if (!data?.thumbUrl) throw new Error("Upload não retornou thumbUrl");
  return { originalUrl: data.originalUrl, thumbUrl: data.thumbUrl };
}

async function createProject({ title, category, link, image }) {
  const res = await fetch(`${API}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, link, image }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Falha ao criar projeto (${res.status}) ${txt}`);
  }

  return res.json();
}

(async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const title = await ask(rl, "Título: ");
    const category = (await ask(rl, "Categoria (projeto/criativo/software): ")).toLowerCase();
    const link = await ask(rl, "Link: ");
    const imageInput = await ask(rl, "Imagem (caminho do arquivo OU URL/Drive): ");

    if (!title) throw new Error("Título obrigatório");
    if (!ALLOWED.has(category)) throw new Error("Categoria inválida");
    if (!link) throw new Error("Link obrigatório");
    if (!imageInput) throw new Error("Imagem obrigatória");

    let imageValue = imageInput;

    if (!/^https?:\/\//i.test(imageInput)) {
      const up = await uploadImage(imageInput);
      imageValue = up.thumbUrl;
    }

    const created = await createProject({ title, category, link, image: imageValue });
    console.log("Criado:", created);
  } catch (e) {
    console.error(String(e?.message || e));
    process.exitCode = 1;
  } finally {
    rl.close();
  }
})();
