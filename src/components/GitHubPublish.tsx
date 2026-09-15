import { useState } from "react";
import { X, Github, Loader2, Check, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react";
import type { CookbookData } from "../types";
import { C } from "../theme";
import { publishToGitHub, type GitHubConfig } from "../github";

const CFG_KEY = "suryawanshis-cookbook:ghcfg";
const TOKEN_KEY = "suryawanshis-cookbook:ghtoken";

type Meta = Omit<GitHubConfig, "token">;

const DEFAULT_META: Meta = {
  owner: "",
  repo: "",
  branch: "main",
  path: "src/data/recipes.json",
  message: "Update cookbook recipes",
};

function loadMeta(): Meta {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (raw) return { ...DEFAULT_META, ...(JSON.parse(raw) as Partial<Meta>) };
  } catch {
    /* ignore */
  }
  return DEFAULT_META;
}

export function GitHubPublish({
  data,
  onClose,
}: {
  data: CookbookData;
  onClose: () => void;
}) {
  const [meta, setMeta] = useState<Meta>(loadMeta);
  const [token, setToken] = useState<string>(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );
  const [remember, setRemember] = useState<boolean>(
    () => !!localStorage.getItem(TOKEN_KEY)
  );
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [commitUrl, setCommitUrl] = useState("");

  const setField = (k: keyof Meta, v: string) =>
    setMeta((m) => ({ ...m, [k]: v }));

  const canPublish =
    meta.owner.trim() && meta.repo.trim() && meta.branch.trim() && token.trim();

  const publish = async () => {
    setStatus("busy");
    setMessage("");
    try {
      localStorage.setItem(CFG_KEY, JSON.stringify(meta));
      if (remember) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);

      const json = JSON.stringify(data, null, 2);
      const { commitUrl } = await publishToGitHub({ ...meta, token }, json);
      setCommitUrl(commitUrl);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setRemember(false);
  };

  const field = { background: "#fff", border: `1px solid ${C.line}`, color: C.ink };
  const label = {
    color: C.inkSoft,
    letterSpacing: "0.04em",
  } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(42,41,36,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{ background: C.paper }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4"
          style={{ background: C.paper, borderBottom: `1px solid ${C.line}` }}
        >
          <h2
            style={{ fontFamily: "var(--head)", color: C.pineDk }}
            className="text-2xl inline-flex items-center gap-2"
          >
            <Github size={20} /> Publish to GitHub
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full"
            style={{ color: C.inkSoft }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {status === "done" ? (
          <div className="px-5 py-8 text-center">
            <div
              className="inline-grid place-items-center w-14 h-14 rounded-full mb-3"
              style={{ background: "#E9F1EC", color: C.pine }}
            >
              <Check size={26} />
            </div>
            <p
              style={{ fontFamily: "var(--head)", color: C.pineDk }}
              className="text-xl"
            >
              Published!
            </p>
            <p style={{ color: C.inkSoft }} className="text-sm mt-1 mb-4">
              Your site will rebuild in a minute or two.
            </p>
            <a
              href={commitUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: C.pine }}
            >
              View the commit <ExternalLink size={14} />
            </a>
            <div className="mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: C.pine }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold mb-1.5 uppercase" style={label}>
                  GitHub username
                </p>
                <input
                  value={meta.owner}
                  onChange={(e) => setField("owner", e.target.value)}
                  placeholder="your-username"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={field}
                />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1.5 uppercase" style={label}>
                  Repository
                </p>
                <input
                  value={meta.repo}
                  onChange={(e) => setField("repo", e.target.value)}
                  placeholder="suryawanshis-cookbook"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={field}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold mb-1.5 uppercase" style={label}>
                  Branch
                </p>
                <input
                  value={meta.branch}
                  onChange={(e) => setField("branch", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={field}
                />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1.5 uppercase" style={label}>
                  File path
                </p>
                <input
                  value={meta.path}
                  onChange={(e) => setField("path", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={field}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-1.5 uppercase" style={label}>
                Commit message
              </p>
              <input
                value={meta.message}
                onChange={(e) => setField("message", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={field}
              />
            </div>

            <div>
              <p className="text-xs font-semibold mb-1.5 uppercase" style={label}>
                Fine-grained token (Contents: read &amp; write)
              </p>
              <div className="relative">
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  type={showToken ? "text" : "password"}
                  placeholder="github_pat_…"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                  style={field}
                />
                <button
                  onClick={() => setShowToken((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5"
                  style={{ color: C.inkSoft }}
                  aria-label={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <label
                  className="inline-flex items-center gap-2 text-xs"
                  style={{ color: C.inkSoft }}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember token in this browser
                </label>
                {token && (
                  <button
                    onClick={clearToken}
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: C.tomato }}
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                )}
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: C.inkSoft }}>
                Your token stays in this browser only — it is never committed or
                shared. Use a fine-grained token limited to this one repository.
              </p>
            </div>

            {status === "error" && (
              <div
                className="px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "#FBEDEA", border: `1px solid ${C.tomato}`, color: C.tomato }}
              >
                {message}
              </div>
            )}

            <button
              onClick={publish}
              disabled={!canPublish || status === "busy"}
              className="w-full py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center justify-center gap-2"
              style={{ background: canPublish ? C.pine : "#A7B3AD" }}
            >
              {status === "busy" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Publishing…
                </>
              ) : (
                <>
                  <Github size={16} /> Publish now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
