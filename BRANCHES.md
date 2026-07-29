# Branch Merge Strategy

All branches have been pushed to GitHub. Merge them in this order to avoid conflicts:

## Merge Order

### 1. **chore/gitignore** → main
- `.gitignore` file
- Prevents tracking of generated files

```bash
git checkout main
git merge chore/gitignore
git push origin main
```

### 2. **feat/project-structure** → main
- README.md with project documentation
- Folder structure (data/, notebooks/, backend/models/)
- Raw CSV dataset

```bash
git merge feat/project-structure
git push origin main
```

### 3. **feat/backend-pipeline** → main
- Data pipeline scripts (ingest, clean, features, eda)
- Python requirements.txt
- Pipeline runner script

```bash
git merge feat/backend-pipeline
git push origin main
```

### 4. **feat/backend-api** → main
- FastAPI server setup
- API routes for serving EDA data
- CORS configuration

```bash
git merge feat/backend-api
git push origin main
```

### 5. **feat/frontend-setup** → main
- Vite + React + TypeScript configuration
- Tailwind CSS setup
- Package.json dependencies
- Build configs (tsconfig, vite, postcss)

```bash
git merge feat/frontend-setup
git push origin main
```

### 6. **feat/frontend-ui** → main
- React components (KpiCard, Sidebar)
- Pages (Dashboard, VanityAnalysis, Keywords, Customers)
- API client service
- TypeScript types
- Custom hooks

```bash
git merge feat/frontend-ui
git push origin main
```

---

## Or Use GitHub UI

You can also create Pull Requests for each branch on GitHub and merge them through the web interface in the order above.

### PR Links (if using GitHub UI):
1. https://github.com/kalviumcommunity/S72-0726-Lilac-Data-Product-Campaign-Performance/pull/new/chore/gitignore
2. https://github.com/kalviumcommunity/S72-0726-Lilac-Data-Product-Campaign-Performance/pull/new/feat/project-structure
3. https://github.com/kalviumcommunity/S72-0726-Lilac-Data-Product-Campaign-Performance/pull/new/feat/backend-pipeline
4. https://github.com/kalviumcommunity/S72-0726-Lilac-Data-Product-Campaign-Performance/pull/new/feat/backend-api
5. https://github.com/kalviumcommunity/S72-0726-Lilac-Data-Product-Campaign-Performance/pull/new/feat/frontend-setup
6. https://github.com/kalviumcommunity/S72-0726-Lilac-Data-Product-Campaign-Performance/pull/new/feat/frontend-ui

---

## Branch Summary

| Branch | Description | Files |
|--------|-------------|-------|
| `chore/gitignore` | Ignore rules for generated files | `.gitignore` |
| `feat/project-structure` | Documentation & folder layout | `README.md`, data folders, CSV |
| `feat/backend-pipeline` | Week 1 data processing pipeline | `ingest.py`, `clean.py`, `features.py`, `eda.py` |
| `feat/backend-api` | FastAPI REST server | `main.py`, `data_routes.py`, app structure |
| `feat/frontend-setup` | Frontend build configuration | `package.json`, Vite/Tailwind configs |
| `feat/frontend-ui` | React dashboard UI | Components, pages, hooks, types |

---

## After Merging All Branches

### Run the Backend:
```bash
cd backend
pip install -r requirements.txt
python ../scripts/run_pipeline.py
uvicorn main:app --reload
```

### Run the Frontend:
```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`
