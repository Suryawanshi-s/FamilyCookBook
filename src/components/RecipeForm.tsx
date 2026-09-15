import { useRef, useState } from "react";
import { X, Plus, ImagePlus, Loader2 } from "lucide-react";
import type { Recipe } from "../types";
import { C, CATS } from "../theme";
import { uid, resizeImage } from "../utils";
import { Label } from "./bits";

interface DraftIngredient {
  qty: string;
  unit: string;
  item: string;
}

interface Draft {
  id: string;
  title: string;
  category: string;
  author: string;
  prepMins: string;
  cookMins: string;
  servings: string;
  ingredients: DraftIngredient[];
  steps: string[];
  notes: string;
  photo?: string;
  createdAt: number;
}

function toDraft(initial: Recipe | null): Draft {
  if (!initial) {
    return {
      id: uid(),
      title: "",
      category: "Mains",
      author: "",
      prepMins: "",
      cookMins: "",
      servings: "4",
      ingredients: [{ qty: "", unit: "", item: "" }],
      steps: [""],
      notes: "",
      photo: undefined,
      createdAt: Date.now(),
    };
  }
  return {
    id: initial.id,
    title: initial.title,
    category: initial.category,
    author: initial.author,
    prepMins: initial.prepMins == null ? "" : String(initial.prepMins),
    cookMins: initial.cookMins == null ? "" : String(initial.cookMins),
    servings: String(initial.servings),
    ingredients: initial.ingredients.map((i) => ({
      qty: i.qty == null ? "" : String(i.qty),
      unit: i.unit,
      item: i.item,
    })),
    steps: initial.steps.length ? initial.steps : [""],
    notes: initial.notes,
    photo: initial.photo,
    createdAt: initial.createdAt,
  };
}

export function RecipeForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Recipe | null;
  onClose: () => void;
  onSave: (r: Recipe) => void;
}) {
  const [f, setF] = useState<Draft>(() => toDraft(initial));
  const [touched, setTouched] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const setIng = (i: number, k: keyof DraftIngredient, v: string) =>
    setF((p) => ({
      ...p,
      ingredients: p.ingredients.map((x, j) => (j === i ? { ...x, [k]: v } : x)),
    }));
  const addIng = () =>
    setF((p) => ({ ...p, ingredients: [...p.ingredients, { qty: "", unit: "", item: "" }] }));
  const rmIng = (i: number) =>
    setF((p) => ({ ...p, ingredients: p.ingredients.filter((_, j) => j !== i) }));

  const setStep = (i: number, v: string) =>
    setF((p) => ({ ...p, steps: p.steps.map((x, j) => (j === i ? v : x)) }));
  const addStep = () => setF((p) => ({ ...p, steps: [...p.steps, ""] }));
  const rmStep = (i: number) =>
    setF((p) => ({ ...p, steps: p.steps.filter((_, j) => j !== i) }));

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setPhotoBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      set("photo", dataUrl);
    } catch {
      setPhotoError("Sorry, that image couldn't be added. Try another one.");
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = () => {
    setTouched(true);
    if (!f.title.trim()) return;
    const cleaned: Recipe = {
      id: f.id,
      title: f.title.trim(),
      category: f.category,
      author: f.author.trim(),
      prepMins: f.prepMins === "" ? null : Number(f.prepMins),
      cookMins: f.cookMins === "" ? null : Number(f.cookMins),
      servings: Number(f.servings) || 1,
      ingredients: f.ingredients
        .filter((i) => i.item.trim())
        .map((i) => ({
          qty: i.qty === "" ? null : Number(i.qty),
          unit: i.unit.trim(),
          item: i.item.trim(),
        })),
      steps: f.steps.map((s) => s.trim()).filter(Boolean),
      notes: f.notes.trim(),
      photo: f.photo,
      createdAt: f.createdAt || Date.now(),
    };
    onSave(cleaned);
  };

  const fieldStyle = {
    background: "#fff",
    border: `1px solid ${C.line}`,
    color: C.ink,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(42,41,36,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{ background: C.paper }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: C.paper, borderBottom: `1px solid ${C.line}` }}
        >
          <h2
            style={{ fontFamily: "var(--head)", color: C.pineDk }}
            className="text-2xl"
          >
            {initial ? "Edit recipe" : "Add a recipe"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full"
            aria-label="Close"
            style={{ color: C.inkSoft }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* photo */}
          <div>
            <Label>Photo (optional)</Label>
            {f.photo ? (
              <div className="relative">
                <img
                  src={f.photo}
                  alt="Recipe preview"
                  className="w-full h-44 object-cover rounded-lg"
                  style={{ border: `1px solid ${C.line}` }}
                />
                <button
                  onClick={() => set("photo", undefined)}
                  className="absolute top-2 right-2 p-1.5 rounded-full text-white"
                  style={{ background: "rgba(42,41,36,0.7)" }}
                  aria-label="Remove photo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
                className="w-full h-24 rounded-lg flex items-center justify-center gap-2 text-sm"
                style={{ background: "#fff", border: `1px dashed ${C.line}`, color: C.inkSoft }}
              >
                {photoBusy ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Adding photo…
                  </>
                ) : (
                  <>
                    <ImagePlus size={18} /> Add a photo
                  </>
                )}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
            {photoError && (
              <p className="text-xs mt-1" style={{ color: C.tomato }}>
                {photoError}
              </p>
            )}
          </div>

          {/* title */}
          <div>
            <Label>Recipe name</Label>
            <input
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Grandma's Apple Pie"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={fieldStyle}
            />
            {touched && !f.title.trim() && (
              <p className="text-xs mt-1" style={{ color: C.tomato }}>
                Give the recipe a name to save it.
              </p>
            )}
          </div>

          {/* category + author */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <select
                value={f.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={fieldStyle}
              >
                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>From the kitchen of</Label>
              <input
                value={f.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Mum, Nan, you…"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={fieldStyle}
              />
            </div>
          </div>

          {/* times + servings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Prep (min)</Label>
              <input
                type="number"
                min="0"
                value={f.prepMins}
                onChange={(e) => set("prepMins", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={fieldStyle}
              />
            </div>
            <div>
              <Label>Cook (min)</Label>
              <input
                type="number"
                min="0"
                value={f.cookMins}
                onChange={(e) => set("cookMins", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={fieldStyle}
              />
            </div>
            <div>
              <Label>Serves</Label>
              <input
                type="number"
                min="1"
                value={f.servings}
                onChange={(e) => set("servings", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={fieldStyle}
              />
            </div>
          </div>

          {/* ingredients */}
          <div>
            <Label>Ingredients</Label>
            <div className="space-y-2">
              {f.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={ing.qty}
                    onChange={(e) => setIng(i, "qty", e.target.value)}
                    placeholder="1"
                    className="w-14 px-2 py-2 rounded-lg text-sm outline-none text-center"
                    style={fieldStyle}
                  />
                  <input
                    value={ing.unit}
                    onChange={(e) => setIng(i, "unit", e.target.value)}
                    placeholder="cup"
                    className="w-20 px-2 py-2 rounded-lg text-sm outline-none"
                    style={fieldStyle}
                  />
                  <input
                    value={ing.item}
                    onChange={(e) => setIng(i, "item", e.target.value)}
                    placeholder="plain flour"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={fieldStyle}
                  />
                  <button
                    onClick={() => rmIng(i)}
                    className="p-1.5 shrink-0"
                    aria-label="Remove ingredient"
                    style={{ color: C.inkSoft }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addIng}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: C.pine }}
            >
              <Plus size={15} /> Add ingredient
            </button>
            <p className="text-xs mt-1" style={{ color: C.inkSoft }}>
              Leave the amount blank for “to taste”.
            </p>
          </div>

          {/* steps */}
          <div>
            <Label>Method</Label>
            <div className="space-y-2">
              {f.steps.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span
                    className="shrink-0 mt-2 w-6 h-6 rounded-full grid place-items-center text-xs font-bold text-white"
                    style={{ background: C.pine }}
                  >
                    {i + 1}
                  </span>
                  <textarea
                    value={s}
                    onChange={(e) => setStep(i, e.target.value)}
                    rows={2}
                    placeholder="Describe this step…"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none resize-y"
                    style={fieldStyle}
                  />
                  <button
                    onClick={() => rmStep(i)}
                    className="p-1.5 mt-1 shrink-0"
                    aria-label="Remove step"
                    style={{ color: C.inkSoft }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addStep}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: C.pine }}
            >
              <Plus size={15} /> Add step
            </button>
          </div>

          {/* notes */}
          <div>
            <Label>
              Family notes <span style={{ color: C.inkSoft }}>(optional)</span>
            </Label>
            <textarea
              value={f.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="A tip, a memory, who it came from…"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
              style={fieldStyle}
            />
          </div>
        </div>

        <div
          className="sticky bottom-0 flex gap-3 px-5 py-4"
          style={{ background: C.paper, borderTop: `1px solid ${C.line}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: C.pine }}
          >
            {initial ? "Save changes" : "Add to the box"}
          </button>
        </div>
      </div>
    </div>
  );
}
