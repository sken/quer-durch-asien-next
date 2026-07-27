# Feature Spec: Dominant Color Search

This specification documents the **color-matching & search functionality** which is already partially implemented in the new stack. It explains the search math, database tables, and routes.

---

## 💾 Database Schema Mapping

The database models are defined in [schema.prisma](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/prisma/schema.prisma):

```prisma
model colors {
  id         BigInt @unique(map: "idx_16399_PRIMARY") @default(autoincrement())
  hue        Int
  saturation Int
  value      Int
  red        Int
  green      Int
  blue       Int
  hex        String @db.VarChar(50)
  websafe    String @db.VarChar(50)
}

model color_to_image {
  image_id BigInt
  color_id BigInt

  @@unique([image_id, color_id], map: "idx_16403_PRIMARY")
}
```

---

## 🔀 Search Logic & Calculations

The server implements two color search methods in [images.routes.ts](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/src/routes/images.routes.ts):

### 1. HSV Proximity
* When `h`, `s`, and `v` query parameters are passed:
  - Bounding ranges are generated (default hue range of $\pm 10$, saturation/value range of $\pm 20$).
  - Results are queried from database tables and sorted by proximity in HSV space:
    $$\text{Order} = |(hue + saturation + value) - (h + s + v)|$$

### 2. RGB Euclidean Proximity
* When `r`, `g`, and `b` query parameters are passed:
  - An RGB bounding range is computed ($\pm 30$ by default).
  - Matches are sorted by Euclidean distance (using raw SQL operations for efficiency):
    $$\text{Distance} = \sqrt{(red - r)^2 + (green - g)^2 + (blue - b)^2}$$
  - The SQL order is executed via:
    ```sql
    ORDER BY ABS((red::numeric + green::numeric + blue::numeric) - (targetR + targetG + targetB)) ASC
    ```

---

## 🚀 Existing Codebase Wiring

### 1. Fastify API
- **File**: [apps/api/src/routes/images.routes.ts](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/src/routes/images.routes.ts)
- **Endpoint**: `GET /images?r=[r]&g=[g]&b=[b]&page=[page]`
  * Performs the SQL join and orders by RGB proximity.
- **Endpoint**: `GET /colors/random`
  * Returns 90 random colors to populate color wheel presets.

### 2. Next.js App
- **File**: [apps/web/src/app/page.tsx](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/web/src/app/page.tsx)
- **UI Elements**:
  * Integrates `@sken/color-picker` to select hexadecimal colors.
  * Translates hex inputs to RGB values.
  * Queries `http://localhost:3000/images` dynamically on color selection.
  * Displays paginated outputs of matching image thumbnails.
