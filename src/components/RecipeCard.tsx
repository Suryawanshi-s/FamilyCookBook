import { Clock, Users, Utensils } from "lucide-react";
import type { Recipe } from "../types";
import { C, catColor } from "../theme";
import { totalTime } from "../utils";

export function RecipeCard({
  r,
  onOpen,
}: {
  r: Recipe;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="card-lift group relative text-left w-full rounded-lg overflow-hidden"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      {r.photo && (
        <div className="h-36 w-full overflow-hidden" style={{ background: C.line }}>
          <img
            src={r.photo}
            alt={r.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* red margin rule */}
      <span
        className="absolute bottom-0"
        style={{
          top: r.photo ? 144 : 0,
          left: 34,
          width: 1,
          background: C.margin,
          opacity: 0.5,
        }}
      />
      {/* category tab */}
      <span
        className="absolute right-3 px-2.5 py-1 rounded-b-md text-[11px] font-semibold text-white"
        style={{ background: catColor(r.category), top: r.photo ? 144 : 0 }}
      >
        {r.category}
      </span>

      <div className="pl-11 pr-4 pt-6 pb-4">
        <h3
          style={{ fontFamily: "var(--head)", color: C.pineDk }}
          className="text-xl leading-snug pr-14"
        >
          {r.title}
        </h3>
        {r.author && (
          <p
            style={{ color: C.inkSoft, fontFamily: "var(--display)" }}
            className="text-lg -mt-0.5"
          >
            from the kitchen of {r.author}
          </p>
        )}
        <div
          className="flex items-center gap-4 mt-3 text-xs"
          style={{ color: C.inkSoft }}
        >
          {totalTime(r) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {totalTime(r)} min
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users size={13} /> serves {r.servings}
          </span>
          <span className="inline-flex items-center gap-1 ml-auto">
            <Utensils size={13} /> {r.ingredients.length}
          </span>
        </div>
      </div>
    </button>
  );
}
