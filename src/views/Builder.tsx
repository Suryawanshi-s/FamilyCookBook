import { useEffect, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Download, Upload, RotateCcw, ExternalLink, Check, X, Github,
} from "lucide-react";
import type { CookbookData, Recipe } from "../types";
import { C, catColor } from "../theme";
import { RecipeForm } from "../components/RecipeForm";
import { GitHubPublish } from "../components/GitHubPublish";
import siteData from "../data/recipes.json";

const DRAFT_KEY = "suryawanshis-cookbook:draft";

function clone(d: CookbookData): CookbookData {
  return JSON.parse(JSON.stringify(d)) as CookbookData;
}

function loadDraft(): CookbookData {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw) as CookbookData;
  } catch {
    /* ignore */
  }
  return clone(siteData as CookbookData);
}

export function Builder() {
  const [data, setData] = useState<CookbookData>(loadDraft);
  const [formFor, setFormFor] = useState<"new" | Recipe | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Autosave the working copy so nothing is lost before exporting.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota errors here; export is the real save */
    }
  }, [data]);

  const setName = (familyName: string) => setData((d) => ({ ...d, familyName }));

  const saveRecipe = (rec: Recipe) => {
    setData((d) => {
      const exists = d.recipes.some((r) => r.id === rec.id);
      return {
        ...d,
        recipes: exists
          ? d.recipes.map((r) => (r.id === rec.id ? rec : r))
          : [...d.recipes, rec],
      };
    });
    setFormFor(null);
  };

  const deleteRecipe = (id: string) => {
    setData((d) => ({ ...d, recipes: d.recipes.filter((r) => r.id !== id) }));
    setConfirmDel(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2500);
  };

  const importJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as CookbookData;
      if (!parsed || !Array.isArray(parsed.recipes)) {
        throw new Error("Not a cookbook file");
      }
      setData({
        familyName: parsed.familyName || "Suryawanshi's",
        recipes: parsed.recipes,
      });
    } catch {
      alert("That doesn't look like a valid recipes.json file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const resetToSite = () => {
    if (
      confirm(
        "Replace your working list with the recipes currently published on the site? Anything not exported will be lost."
      )
    ) {
      setData(clone(siteData as CookbookData));
    }
  };

  const btn =
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium";

  return (
    <div
      style={{ background: C.paper, color: C.ink, fontFamily: "var(--body)" }}
      className="min-h-screen w-full"
    >
      {/* top bar */}
      <div
        className="sticky top-0 z-20 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2"
        style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}
      >
        <div className="mr-auto flex items-center gap-2">
          <span
            style={{ fontFamily: "var(--head)", color: C.pineDk }}
            className="text-xl"
          >
            Cookbook Builder
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: C.paper, color: C.inkSoft, border: `1px solid ${C.line}` }}
          >
            private
          </span>
        </div>

        <a href="#" className={btn} style={{ color: C.pine }}>
          <ExternalLink size={15} /> View site
        </a>
        <button onClick={() => fileRef.current?.click()} className={btn}
                style={{ background: C.paper, border: `1px solid ${C.line}`, color: C.ink }}>
          <Upload size={15} /> Import
        </button>
        <button onClick={exportJson} className={btn}
                style={{ background: C.paper, border: `1px solid ${C.line}`, color: C.ink }}>
          {justSaved ? <Check size={15} /> : <Download size={15} />}
          {justSaved ? "Downloaded" : "Export"}
        </button>
        <button onClick={() => setShowPublish(true)} className={btn}
                style={{ background: C.pine, color: "#fff" }}>
          <Github size={15} /> Publish to GitHub
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={importJson}
        />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* how-to note */}
        <div
          className="p-4 rounded-lg mb-6 text-sm leading-relaxed"
          style={{ background: "#FBF6E6", border: `1px solid ${C.line}`, color: C.ink }}
        >
          <b>How this works:</b> add and edit recipes here, then hit{" "}
          <b>Publish to GitHub</b> to commit them straight to your repo — the live
          site rebuilds automatically. First time, you'll paste a GitHub token
          (it stays in this browser only). Prefer to do it by hand? <b>Export</b>{" "}
          downloads the file to commit yourself. Your work is auto-saved here
          until you publish or export.
        </div>

        {/* cookbook name */}
        <label
          className="block text-xs font-semibold mb-1.5 uppercase"
          style={{ color: C.inkSoft, letterSpacing: "0.04em" }}
        >
          Cookbook name
        </label>
        <input
          value={data.familyName}
          onChange={(e) => setName(e.target.value)}
          className="w-full sm:w-80 px-3 py-2.5 rounded-lg text-sm outline-none mb-7"
          style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.ink }}
        />

        {/* recipe list */}
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: "var(--head)", color: C.pineDk }} className="text-2xl">
            Recipes <span style={{ color: C.inkSoft }}>({data.recipes.length})</span>
          </h2>
          <button
            onClick={() => setFormFor("new")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: C.pine }}
          >
            <Plus size={16} /> Add recipe
          </button>
        </div>

        {data.recipes.length === 0 ? (
          <p style={{ color: C.inkSoft }} className="py-12 text-center text-sm">
            No recipes yet — add your first one.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.recipes.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: C.card, border: `1px solid ${C.line}` }}
              >
                {r.photo ? (
                  <img
                    src={r.photo}
                    alt=""
                    className="w-12 h-12 rounded object-cover shrink-0"
                  />
                ) : (
                  <span
                    className="w-12 h-12 rounded shrink-0 grid place-items-center text-[10px] font-semibold text-white text-center leading-tight px-1"
                    style={{ background: catColor(r.category) }}
                  >
                    {r.category}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    style={{ fontFamily: "var(--head)", color: C.pineDk }}
                    className="text-lg leading-tight truncate"
                  >
                    {r.title || "Untitled"}
                  </p>
                  <p style={{ color: C.inkSoft }} className="text-xs truncate">
                    {r.category}
                    {r.author ? ` · ${r.author}` : ""}
                  </p>
                </div>

                {confirmDel === r.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deleteRecipe(r.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-white"
                      style={{ background: C.tomato }}
                    >
                      <Check size={13} /> Delete
                    </button>
                    <button
                      onClick={() => setConfirmDel(null)}
                      className="p-1.5"
                      style={{ color: C.inkSoft }}
                      aria-label="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setFormFor(r)}
                      className="p-2 rounded-full"
                      style={{ color: C.pine }}
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDel(r.id)}
                      className="p-2 rounded-full"
                      style={{ color: C.tomato }}
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* danger / reset */}
        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
          <button
            onClick={resetToSite}
            className="inline-flex items-center gap-1.5 text-sm"
            style={{ color: C.inkSoft }}
          >
            <RotateCcw size={14} /> Reset working list to the published site data
          </button>
        </div>
      </main>

      {formFor && (
        <RecipeForm
          initial={formFor === "new" ? null : formFor}
          onClose={() => setFormFor(null)}
          onSave={saveRecipe}
        />
      )}

      {showPublish && (
        <GitHubPublish data={data} onClose={() => setShowPublish(false)} />
      )}
    </div>
  );
}
