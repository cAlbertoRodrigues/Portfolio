import { useEffect, useMemo, useState } from "react";

const USERNAME = "cAlbertoRodrigues";
const IGNORE_LANGS = new Set(["HTML"]);

const headers = process.env.REACT_APP_GITHUB_TOKEN
  ? { Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}` }
  : {};

const CACHE_KEY = `github_stats_cache_v1_${USERNAME}`;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {}
}

async function fetchAllRepos(username) {
  let page = 1;
  let all = [];

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
      { headers }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Falha ao buscar repositórios (${res.status}) ${txt}`);
    }

    const data = await res.json();
    all = all.concat(data);

    if (data.length < 100) break;
    page += 1;
  }

  return all;
}

async function fetchRepoLanguages(languagesUrl) {
  const res = await fetch(languagesUrl, { headers });
  if (!res.ok) return {};
  return res.json();
}

export function useGithubStats() {
  const cached = useMemo(() => readCache(), []);
  const cachedStats = cached?.stats || null;
  const cachedAt = cached?.at || 0;
  const isFresh = cachedStats && Date.now() - cachedAt < CACHE_TTL_MS;

  const [loading, setLoading] = useState(!cachedStats);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(
    cachedStats || { projectsCompleted: 0, topLanguages: [] }
  );

  useEffect(() => {
    let cancelled = false;

    if (isFresh) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(!cachedStats);
        setError("");

        const repos = await fetchAllRepos(USERNAME);
        const projectsCompleted = repos.filter((r) => !r.archived).length;

        const totals = {};
        const chunkSize = 8;

        for (let i = 0; i < repos.length; i += chunkSize) {
          const chunk = repos.slice(i, i + chunkSize);

          const langsList = await Promise.all(
            chunk.map((r) => fetchRepoLanguages(r.languages_url))
          );

          langsList.forEach((langs) => {
            Object.entries(langs).forEach(([lang, bytes]) => {
              if (IGNORE_LANGS.has(lang)) return;
              totals[lang] = (totals[lang] || 0) + bytes;
            });
          });
        }

        const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
        const top3 = sorted.slice(0, 3).map(([name, bytes]) => ({ name, bytes }));

        const totalAll = Object.values(totals).reduce((acc, v) => acc + v, 0) || 1;

        const topLanguages = top3.map((l) => ({
          name: l.name,
          bytes: l.bytes,
          percent: Math.round((l.bytes / totalAll) * 100),
        }));

        const nextStats = { projectsCompleted, topLanguages };

        if (!cancelled) {
          setStats(nextStats);
          writeCache({ at: Date.now(), stats: nextStats });
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Erro desconhecido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, error, stats };
}
