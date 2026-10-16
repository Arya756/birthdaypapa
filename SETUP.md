# Setup

```bash
npx create-next-app@latest papa-birthday --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
cd papa-birthday
npx shadcn@latest init
npm install lucide-react
```

Then copy these files from this folder into the project (overwrite when asked):

- components/ui/tilted-grid-hero.tsx
- lib/utils.ts            (shadcn already makes this; keep yours if it exists)
- app/layout.tsx
- app/page.tsx
- public/photos/*         (placeholders; replace with real photos)

Append globals-additions.css to the end of app/globals.css, then:

```bash
npm run dev
```
