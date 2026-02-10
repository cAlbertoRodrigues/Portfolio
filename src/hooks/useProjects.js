import { useEffect, useState } from "react";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3333";

export function useProjects() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);

  const reload = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/projects`);
      if (!res.ok) throw new Error("Falha ao carregar projetos");
      const data = await res.json();

      const normalized = (Array.isArray(data) ? data : []).map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        link: p.link,
        image: p.image,
      }));

      setProjects(normalized);
    } catch (e) {
      setError(e?.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return { loading, error, projects, reload };
}
