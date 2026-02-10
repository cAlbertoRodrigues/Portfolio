const API = "http://localhost:3333";

(async () => {
  const res = await fetch(`${API}/projects`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error(`Falha ao listar (${res.status}) ${txt}`);
    process.exitCode = 1;
    return;
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    console.log("Nenhum projeto encontrado");
    return;
  }

  data.forEach((p) => {
    console.log(`${p.id} | ${p.category} | ${p.title}`);
  });
})();
