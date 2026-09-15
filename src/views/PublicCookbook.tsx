import { useMemo, useState } from "react";
import { Search, ChefHat, BookOpen } from "lucide-react";
import type { CookbookData, Recipe } from "../types";
import { C, CATS, catColor } from "../theme";
import { RecipeCard } from "../components/RecipeCard";
import { RecipeDetail } from "../components/RecipeDetail";
import cookbookData from "../data/recipes.json";

const data = cookbookData as CookbookData;

export function PublicCookbook() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const { recipes, familyName } = data;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes
      .filter((r) => activeCat === "All" || r.category === activeCat)
      .filter((r) => {
        if (!q) return true;
        return (
          r.title.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.item.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [recipes, query, activeCat]);

  // Only show tabs for categories that actually have recipes.
  const usedCats = useMemo(
    () => ["All", ...CATS.filter((c) => recipes.some((r) => r.category === c))],
    [recipes]
  );

  const openRecipe: Recipe | null = openId
    ? recipes.find((r) => r.id === openId) ?? null
    : null;

  return (
    <div
      style={{ background: C.paper, color: C.ink, fontFamily: "var(--body)" }}
      className="min-h-screen w-full"
    >
      <header className="px-5 pt-10 pb-6 text-center">
        <div
          className="flex items-center justify-center gap-2 mb-2"
          style={{ color: C.pine }}
        >
          <span style={{ height: 1, width: 34, background: C.line }} />
          <ChefHat size={18} />
          <span style={{ height: 1, width: 34, background: C.line }} />
        </div>
        <h1
          style={{ fontFamily: "var(--display)", color: C.pineDk, lineHeight: 1 }}
          className="text-5xl sm:text-6xl"
        >
          {familyName}
        </h1>
        <p
          style={{ fontFamily: "var(--display)", color: C.inkSoft }}
          className="text-2xl mt-1"
        >
          Cookbook
        </p>
        <p style={{ color: C.inkSoft }} className="text-sm tracking-wide mt-2">
          Recipes worth keeping · {recipes.length} in the box
        </p>
      </header>

      {openRecipe ? (
        <RecipeDetail recipe={openRecipe} onBack={() => setOpenId(null)} />
      ) : (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="relative mb-5 max-w-md mx-auto">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: C.inkSoft }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes, cooks or ingredients…"
              className="w-full pl-10 pr-3 py-2.5 rounded-full text-sm outline-none"
              style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink }}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {usedCats.map((c) => {
              const active = c === activeCat;
              const col = c === "All" ? C.pine : catColor(c);
              return (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className="px-3.5 py-1.5 rounded-t-lg text-sm font-medium"
                  style={{
                    background: active ? col : C.card,
                    color: active ? "#fff" : C.inkSoft,
                    border: `1px solid ${active ? col : C.line}`,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div
                className="inline-grid place-items-center w-16 h-16 rounded-full mb-4"
                style={{ background: C.card, border: `1px solid ${C.line}`, color: C.pine }}
              >
                <BookOpen size={26} />
              </div>
              <p
                style={{ fontFamily: "var(--head)", color: C.pineDk }}
                className="text-2xl"
              >
                {recipes.length === 0
                  ? "This cookbook is being written"
                  : "Nothing matches that search"}
              </p>
              <p style={{ color: C.inkSoft }} className="text-sm mt-1">
                {recipes.length === 0
                  ? "Check back soon for the first recipes."
                  : "Try a different word, or clear the filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <RecipeCard key={r.id} r={r} onOpen={() => setOpenId(r.id)} />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
