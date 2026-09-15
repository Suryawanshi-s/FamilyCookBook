import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, X, Plus, BookOpen } from "lucide-react";
import { C } from "../theme";

export function Label({ children }: { children: ReactNode }) {
  return (
    <label
      className="block text-xs font-semibold mb-1.5 uppercase"
      style={{ color: C.inkSoft, letterSpacing: "0.04em" }}
    >
      {children}
    </label>
  );
}

export function NameEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <div className="inline-flex items-center gap-2">
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(v);
          if (e.key === "Escape") onCancel();
        }}
        className="text-4xl sm:text-5xl text-center outline-none px-2 rounded"
        style={{
          fontFamily: "var(--display)",
          color: C.pineDk,
          background: "#fff",
          border: `1px solid ${C.line}`,
          maxWidth: "80vw",
        }}
      />
      <button
        onClick={() => onSave(v)}
        className="p-2 rounded-full text-white"
        style={{ background: C.pine }}
        aria-label="Save name"
      >
        <Check size={16} />
      </button>
      <button
        onClick={onCancel}
        className="p-2 rounded-full"
        style={{ color: C.inkSoft }}
        aria-label="Cancel"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function EmptyState({
  onAdd,
  hasAny,
}: {
  onAdd: () => void;
  hasAny: boolean;
}) {
  return (
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
        {hasAny ? "Nothing matches that search" : "The recipe box is empty"}
      </p>
      <p style={{ color: C.inkSoft }} className="text-sm mt-1 mb-5">
        {hasAny
          ? "Try a different word, or clear the filters."
          : "Add the first family recipe to get started."}
      </p>
      {!hasAny && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: C.pine }}
        >
          <Plus size={17} /> Add a recipe
        </button>
      )}
    </div>
  );
}
