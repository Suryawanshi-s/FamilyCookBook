import type { Recipe } from "./types";

const FRAC: Record<string, string> = {
  "0.25": "¼",
  "0.5": "½",
  "0.75": "¾",
  "0.33": "⅓",
  "0.34": "⅓",
  "0.66": "⅔",
  "0.67": "⅔",
};

/** Turn a number into a friendly amount ("1 ½", "0.75" → "¾"). */
export function formatQty(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 100) / 100;
  const fracStr = FRAC[String(frac)];
  if (fracStr) return (whole ? `${whole} ` : "") + fracStr;
  return String(Math.round(rounded * 100) / 100);
}

/** Scale an ingredient amount from base servings to a target. Null stays null. */
export function scaleQty(
  qty: number | null,
  base: number,
  target: number
): number | null {
  if (qty == null || !base) return qty;
  return (qty * target) / base;
}

export const totalTime = (r: Recipe): number =>
  (r.prepMins ?? 0) + (r.cookMins ?? 0);

export const uid = (): string => "r" + Math.random().toString(36).slice(2, 9);

/**
 * Read an image file, downscale it (longest edge <= maxSize) and return a
 * compressed JPEG data URL. Keeps local storage from filling up with
 * full-resolution phone photos.
 */
export function resizeImage(
  file: File,
  maxSize = 900,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load the image."));
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas is not supported."));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
