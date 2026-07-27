# Feature Specifications Index

This directory contains detailed migration specifications for the travel photo blog **"Quer durch Asien"** from PHP/WordPress/CodeIgniter to a Turborepo-based Fastify + Next.js stack.

## 📋 Feature Specifications

1. **[01-blog-and-comments.md](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/docs/specs/01-blog-and-comments.md)**
   * Manages the travel journal (blog posts) from `wp_posts` and approved reader comments from `wp_comments`.
   * Maps legacy year/month/day blog routes to Next.js Dynamic Segment routers.

2. **[02-gallery-and-albums.md](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/docs/specs/02-gallery-and-albums.md)**
   * Outlines the photo gallery system, grouping pictures into country albums (`russland`, `china`, `mongolei`, etc.) and matching tags using `keywords` table relations.

3. **[03-gps-routing-map.md](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/docs/specs/03-gps-routing-map.md)**
   * Tracks GPS coordinates from the `gpstrack` table to plot travel polylines across Asia.
   * Maps photos using geotagged EXIF coordinates to show markers dynamically along the route.

4. **[04-color-search.md](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/docs/specs/04-color-search.md)**
   * Specifies the HSV and RGB proximity search logic. Uses Euclidean distance equations to order photos by closest color match.
   * Documents the existing endpoints `/colors` and `/images` that are already partially operational.

5. **[05-contact-static-pages.md](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/docs/specs/05-contact-static-pages.md)**
   * Guides the migration of static views like the imprint (`/impressum`) and print-friendly packing checklist (`/packliste`).
   * Provides blueprints for migration of the database Captcha verification engine or modern serverless alternatives.

---

## 🛠️ Monorepo Quick Reference
* **Prisma Schema**: `apps/api/prisma/schema.prisma`
* **Fastify Routes**: `apps/api/src/routes/`
* **Next.js Frontend**: `apps/web/src/app/`
