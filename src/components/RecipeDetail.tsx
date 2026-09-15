import { useEffect, useState } from "react";
import {
  ArrowLeft, Pencil, Trash2, X, Check, Clock, ChefHat,
  Users, Minus, Plus, Utensils, BookOpen,
} from "lucide-react";
import type { Recipe } from "../types";
import { C, catColor } from "../theme";
import { formatQty, scaleQty } from "../utils";

export function RecipeDetail({
  recipe,
  onBack,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const canManage = Boolean(onEdit || onDelete);
  const [servings, setServings] = useState(recipe.servings);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    setServings(recipe.servings);
    setConfirmDel(false);
  }, [recipe.id, recipe.servings]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: C.pine }}
        >
          <ArrowLeft size={16} /> Back to the box
        </button>
        {canManage && (
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
            style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink }}
          >
            <Pencil size={14} /> Edit
          </button>
          {confirmDel ? (
            <div className="inline-flex items-center gap-1">
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white"
                style={{ background: C.tomato }}
              >
                <Check size={14} /> Delete for good
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="p-1.5 rounded-full"
                style={{ color: C.inkSoft }}
                aria-label="Cancel delete"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{ background: C.card, border: `1px solid ${C.line}`, color: C.tomato }}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
        )}
      </div>

      <article
        className="relative rounded-xl overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
      >
        {recipe.photo && (
          <div className="h-56 sm:h-72 w-full overflow-hidden" style={{ background: C.line }}>
            <img src={recipe.photo} alt={recipe.title} className="h-full w-full object-cover" />
          </div>
        )}

        <span
          className="absolute bottom-0"
          style={{ top: recipe.photo ? undefined : 0, left: 40, width: 1, background: C.margin, opacity: 0.45 }}
        />
        <div className="pl-14 pr-6 sm:pr-10 py-8">
          <span
            className="inline-block px-2.5 py-1 rounded text-[11px] font-semibold text-white mb-3"
            style={{ background: catColor(recipe.category) }}
          >
            {recipe.category}
          </span>
          <h2
            style={{ fontFamily: "var(--head)", color: C.pineDk }}
            className="text-4xl leading-tight"
          >
            {recipe.title}
          </h2>
          {recipe.author && (
            <p
              style={{ color: C.inkSoft, fontFamily: "var(--display)" }}
              className="text-2xl mt-1"
            >
              from the kitchen of {recipe.author}
            </p>
          )}

          <div
            className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm"
            style={{ color: C.inkSoft }}
          >
            {recipe.prepMins ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} /> Prep {recipe.prepMins} min
              </span>
            ) : null}
            {recipe.cookMins ? (
              <span className="inline-flex items-center gap-1.5">
                <ChefHat size={15} /> Cook {recipe.cookMins} min
              </span>
            ) : null}
          </div>

          {/* servings scaler */}
          <div
            className="flex items-center gap-3 mt-6 pt-5"
            style={{ borderTop: `1px dashed ${C.line}` }}
          >
            <span
              style={{ color: C.inkSoft }}
              className="text-sm inline-flex items-center gap-1.5"
            >
              <Users size={15} /> Serves
            </span>
            <div
              className="inline-flex items-center rounded-full"
              style={{ border: `1px solid ${C.line}` }}
            >
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="p-2"
                aria-label="Fewer servings"
                style={{ color: C.pine }}
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-semibold" style={{ color: C.ink }}>
                {servings}
              </span>
              <button
                onClick={() => setServings((s) => Math.min(50, s + 1))}
                className="p-2"
                aria-label="More servings"
                style={{ color: C.pine }}
              >
                <Plus size={15} />
              </button>
            </div>
            {servings !== recipe.servings && (
              <button
                onClick={() => setServings(recipe.servings)}
                className="text-xs underline"
                style={{ color: C.inkSoft }}
              >
                reset
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-7">
            <section>
              <h3
                style={{ fontFamily: "var(--head)", color: C.pine }}
                className="text-xl mb-3 inline-flex items-center gap-2"
              >
                <Utensils size={17} /> Ingredients
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => {
                  const q = formatQty(scaleQty(ing.qty, recipe.servings, servings));
                  return (
                    <li
                      key={i}
                      className="text-[15px] leading-snug flex gap-2"
                      style={{ color: C.ink }}
                    >
                      <span style={{ color: C.mustard }} className="select-none">
                        •
                      </span>
                      <span>
                        {q && (
                          <b style={{ color: C.pineDk }}>
                            {q}
                            {ing.unit ? " " + ing.unit : ""}{" "}
                          </b>
                        )}
                        {ing.item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h3
                style={{ fontFamily: "var(--head)", color: C.pine }}
                className="text-xl mb-3 inline-flex items-center gap-2"
              >
                <BookOpen size={17} /> Method
              </h3>
              <ol className="space-y-3">
                {recipe.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[15px] leading-relaxed"
                    style={{ color: C.ink }}
                  >
                    <span
                      className="shrink-0 w-6 h-6 rounded-full grid place-items-center text-xs font-bold text-white"
                      style={{ background: C.pine }}
                    >
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {recipe.notes && (
            <div
              className="mt-8 p-4 rounded-lg"
              style={{ background: "#FBF6E6", border: `1px solid ${C.line}` }}
            >
              <p
                style={{ fontFamily: "var(--display)", color: C.pineDk }}
                className="text-xl leading-snug"
              >
                “{recipe.notes}”
              </p>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
