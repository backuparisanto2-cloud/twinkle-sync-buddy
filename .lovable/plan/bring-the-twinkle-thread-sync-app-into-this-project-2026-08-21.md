# Bring the twinkle-thread-sync app into this project

The repo is accessible and contains a full kos/property management app (TanStack Start + Lovable Cloud): rooms, tenants, income, expenses, journal, reports, floor plans, plus 5 database migrations.

## What gets copied

- All pages: home, denah (floor plans), fasilitas, kamar list + detail, tenant, pendapatan, pengeluaran, jurnal, laporan, kelola
- All components (including the full shadcn UI set), hooks, and library code (PDF export, Excel export, image compression, journal formatting)
- Server functions for AI expense parsing and AI journal formatting
- Styling and design system
- Dependencies from the repo's package.json (jspdf, xlsx, pdfjs, recharts, etc.)

## Backend

- Enable Lovable Cloud in this project (fresh backend).
- Re-apply all 5 migrations from `supabase/migrations` in order, so tables, policies, grants, storage buckets and functions match the original.
- The Cloud connection files are regenerated for this project's own backend — the original project's keys are not reused.

## Images

Floor plan and splash images are stored as asset references pointing at the original project. They will be re-registered as assets here so they render; if any fail to transfer I'll note exactly which ones.

## What does not come across

- **Existing data** (rooms, tenants, payments, uploaded photos/proofs already in the old backend). The new backend starts empty. If you need the data, tell me and I'll cover exporting it from the original project and importing it here as a second step.
- Any secrets used by AI/server features must be re-added here.

## Verification

Build + typecheck, then walk the main routes in a browser to confirm they render and the database reads work against the new backend.
