export interface Ingredient {
  qty: number | null;
  unit: string;
  item: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  author: string;
  prepMins: number | null;
  cookMins: number | null;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  notes: string;
  photo?: string; // data URL (resized JPEG)
  createdAt: number;
}

export interface CookbookData {
  familyName: string;
  recipes: Recipe[];
}
