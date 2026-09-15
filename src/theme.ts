// An "herb-garden + recipe box" identity — deliberately not the default
// cream/terracotta food-blog look.
export const C = {
  paper: "#F3EFE3",
  card: "#FFFDF6",
  ink: "#2A2924",
  inkSoft: "#6F6A5E",
  pine: "#2F5D50",
  pineDk: "#234A40",
  mustard: "#D3A03A",
  tomato: "#BE5849",
  margin: "#D79089",
  line: "#E4DECF",
} as const;

// Cookbook-style order.
export const CATS = [
  "Breakfast",
  "Quick Meals",
  "Salads",
  "Mains",
  "Accompaniments",
  "Desserts",
  "Baking",
  "Drinks",
  "Other",
] as const;

const CAT_COLOR: Record<string, string> = {
  Breakfast: "#C98A3C",
  "Quick Meals": "#3E7C8C",
  Salads: "#6E8B3D",
  Mains: "#2F5D50",
  Accompaniments: "#A9772E",
  Desserts: "#B25E7E",
  Baking: "#B06A3B",
  Drinks: "#5B7C99",
  Other: "#7A756A",
};

export const catColor = (c: string): string => CAT_COLOR[c] ?? C.pine;
