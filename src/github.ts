// Commits a file to a GitHub repo using the Contents API, straight from the
// browser. The token is supplied by the user at runtime and never stored in
// this code or in the committed data.

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
  message: string;
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function ghError(res: Response): Promise<Error> {
  let detail = `${res.status} ${res.statusText}`;
  try {
    const j = await res.json();
    if (j && j.message) detail = j.message;
  } catch {
    /* ignore */
  }
  if (res.status === 401)
    return new Error(
      "GitHub rejected the token (401). Check it hasn't expired and has Contents: write access to this repo."
    );
  if (res.status === 403)
    return new Error(
      "GitHub refused the request (403). The token may lack Contents: write permission for this repo."
    );
  if (res.status === 404)
    return new Error(
      "Not found (404). Check the owner, repo and branch, and that the token can access this repo."
    );
  return new Error(`GitHub error: ${detail}`);
}

async function getExistingSha(cfg: GitHubConfig): Promise<string | undefined> {
  const url =
    `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/` +
    `${encodeURI(cfg.path)}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, { headers: authHeaders(cfg.token) });
  if (res.status === 404) return undefined; // new file
  if (!res.ok) throw await ghError(res);
  const json = (await res.json()) as { sha?: string };
  return json.sha;
}

export async function publishToGitHub(
  cfg: GitHubConfig,
  content: string
): Promise<{ commitUrl: string }> {
  const sha = await getExistingSha(cfg);
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(
    cfg.path
  )}`;
  const body: Record<string, unknown> = {
    message: cfg.message || "Update cookbook recipes",
    content: utf8ToBase64(content),
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(cfg.token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await ghError(res);
  const json = (await res.json()) as { commit?: { html_url?: string } };
  return {
    commitUrl:
      json.commit?.html_url ?? `https://github.com/${cfg.owner}/${cfg.repo}`,
  };
}
