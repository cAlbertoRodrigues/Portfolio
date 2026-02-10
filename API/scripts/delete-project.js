const readline = require("readline");

const API = "http://localhost:3333";

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
}

(async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const id = await ask(rl, "ID do projeto para deletar: ");
    if (!id) throw new Error("ID obrigatório");

    const res = await fetch(`${API}/projects/${id}`, { method: "DELETE" });

    if (res.status === 204) {
      console.log("Deletado com sucesso");
      return;
    }

    const txt = await res.text().catch(() => "");
    throw new Error(`Falha ao deletar (${res.status}) ${txt}`);
  } catch (e) {
    console.error(String(e?.message || e));
    process.exitCode = 1;
  } finally {
    rl.close();
  }
})();
