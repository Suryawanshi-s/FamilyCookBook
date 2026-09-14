# Suryawanshi's Cookbook

A warm, read-only family recipe website, built to be hosted for free on
**GitHub Pages**. Visitors can browse, search, filter by category, view photos
and scale ingredient amounts by servings — but they can't change anything.

You manage the recipes privately through a built-in **Builder** tool and publish
updates by committing a single data file. Your "admin rights" are simply your
GitHub push access, so there's nothing for a visitor to bypass.

Built with React + TypeScript + Vite.

---

## Two parts

| | Where | Who | Can do |
|---|---|---|---|
| **Public site** | `/` (the deployed site) | Everyone | Browse, search, view, scale servings |
| **Builder** | `/#jojobean` | Only you | Add / edit / delete recipes, export data |

The recipes themselves live in **`src/data/recipes.json`**, which ships with the
site. That file is the single source of truth for what visitors see.

---

## Everyday workflow: adding or changing a recipe

1. Run the site locally: `npm install` then `npm run dev`.
2. Open the Builder at the address it prints, adding `#jojobean` on the end
   (e.g. `http://localhost:5173/#jojobean`).
3. Add, edit, delete recipes and set the cookbook name. Add a photo per recipe if
   you like — photos are auto-resized so the file stays small. Your work is
   auto-saved in the browser as you go.
4. Click **Export recipes.json**. Move the downloaded file into the project,
   replacing `src/data/recipes.json`.
5. Commit and push:
   ```bash
   git add src/data/recipes.json
   git commit -m "Add nan's shortbread"
   git push
   ```
6. GitHub rebuilds and publishes automatically. Done.

> Tip: to keep editing later from the exported file, use **Import** in the
> Builder to load a `recipes.json` back in.

---

## Hosting it on GitHub Pages (one-time setup)

1. Create a new repository on GitHub and push this project to the `main` branch.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. That's it. The included workflow at `.github/workflows/deploy.yml` builds and
   deploys the site on every push to `main`. Your site appears at
   `https://<your-username>.github.io/<your-repo>/`.

The build uses a relative base path, so it works whatever your repo is named —
no configuration needed.

### Running / building manually

```bash
npm install      # once
npm run dev      # local preview with hot reload
npm run build    # type-check + production build into /dist
npm run preview  # preview the production build locally
```

---

## About photos

Photos are stored inside `recipes.json` (compressed to ~900px JPEG). This keeps
everything in one committable file with no separate image management. It's ideal
for a family-sized cookbook. If you ever grow to hundreds of photo recipes and
want to slim the data file, photos can be split into separate image files later.

---

## Make it yours

- **Colours & fonts** — `src/theme.ts` (palette) and `src/index.css` / `index.html` (fonts).
- **Categories** — edit `CATS` and the colour map in `src/theme.ts`.
- **Cookbook name** — set it in the Builder, or edit `familyName` in `recipes.json`.

## Project layout

```
src/
  App.tsx                     picks Public vs Builder from the URL hash
  data/recipes.json           <-- the published cookbook (commit this)
  views/PublicCookbook.tsx    read-only site visitors see
  views/Builder.tsx           your private editor + JSON export
  components/                 shared cards, detail, form
  theme.ts / utils.ts / types.ts
.github/workflows/deploy.yml  auto-deploy to GitHub Pages
```

---

## Publishing straight from the Builder (optional, no export needed)

The Builder has a **Publish to GitHub** button that commits `recipes.json`
directly to your repo — add a recipe, click publish, done.

One-time: create a **fine-grained personal access token** so the browser can
write to your repo:

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. **Repository access → Only select repositories →** pick just this cookbook repo.
3. **Permissions → Repository permissions → Contents → Read and write**. (Nothing
   else is needed.)
4. Generate, copy the token, and paste it into the Builder's Publish dialog.

Notes on keeping this safe:
- The token is stored **only in your browser** (optional "remember" tick), is
  **never committed**, and is **never part of the deployed public site**.
- Scope it to the **single repo, Contents only**, so even in the worst case it
  can't touch anything else.
- Safest is to run the Builder locally (`npm run dev` → `/#jojobean`) when
  publishing. The `#jojobean` page on the live site works too, but only you would
  have the token.
- If you ever want to revoke access, delete the token on GitHub and click
  **Clear** in the dialog.
