# Feature Spec: Image Gallery, Albums & Tags

This specification describes the gallery structure, country albums, keyword tags, and individual image pages that need to be migrated from the legacy project.

---

## 💾 Database Schema Mapping

The database models are defined in [schema.prisma](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/prisma/schema.prisma):

```prisma
model images {
  id           Int       @id @default(autoincrement())
  filename     String    @db.VarChar(255) // Local filename (e.g. _MG_1234.jpg)
  title        String?   // User-facing title
  title_number Int
  desc         String?
  country      String?   // Country name (e.g., "russland", "china")
  date         DateTime? @db.Timestamptz(6)
  height       Int?
  width        Int?
  hitcounter   Int?      @default(0)
  
  // EXIF tags parsed from file:
  EXIFValid             Int?
  EXIFMake              String? @db.VarChar(52)
  EXIFModel             String? @db.VarChar(52)
  EXIFDateTimeOriginal  String? @db.VarChar(52)
  EXIFGPSLatitude       String? @db.VarChar(52)
  EXIFGPSLongitude      String? @db.VarChar(52)
  EXIFGPSAltitude       String? @db.VarChar(52)
  
  // Color analysis summary:
  hue         Int
  saturation  Int
  value       Int
  rgb         String  @db.VarChar(100)
}

model keyword_to_image {
  image_id   BigInt
  keyword_id BigInt

  @@unique([image_id, keyword_id], map: "idx_165505_PRIMARY")
}

model keywords {
  id   BigInt @unique(map: "idx_16501_PRIMARY") @default(autoincrement())
  name String @db.VarChar(200)
  slug String @db.VarChar(200)
}

model galleries {
  id         BigInt  @unique(map: "idx_16415_PRIMARY") @default(autoincrement())
  name       String? @db.VarChar(255)
  title      String? @db.VarChar(255)
  galdesc    String? @db.VarChar(255)
  previewpic BigInt?
}
```

---

## 🔀 Legacy Routing & Logic

### 1. Country Album Pages
- **Legacy Route**: `/bilder/(russland|mongolei|china|tibet|indien|nepal)` (maps to `album/index/$1/`).
- **Behavior**: Lists all images from that country.

### 2. Tag-Based Photo Filtering
- **Legacy Route**: `/album/tag/(:any)` (maps to `album/index//$1/`).
- **Behavior**: Finds the keyword matching the tag slug, retrieves related image IDs via `keyword_to_image`, and renders them.

### 3. Individual Photo Page
- **Legacy Route**: `/bild/(:any)` (maps to `bild/index/$1/`).
- **Behavior**: Retrieves a specific photo's data, its keywords, HSL colors, GPS altitude/lat/lng, and queries the database for the adjacent pictures (`date > $current_date` and `date < $current_date`) to support Previous / Next navigation controls.

---

## 🚀 Target Architecture

### 1. API Endpoints (`apps/api`)
Extend [apps/api/src/routes/images.routes.ts](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/src/routes/images.routes.ts):

- **`GET /images` (Updated)**:
  * **Query Params**: `country`, `tag`, `limit`, `page`.
  * **Action**:
    * If `country` is specified, query `images` where `country = country`.
    * If `tag` is specified, query `keyword_to_image` to get `image_id`s matching the `tag` slug, then fetch matching `images`.
  * **Response**: Paginated list of images.

- **`GET /images/:title`**:
  * **Action**: Find single image by filename or title. Retrieve EXIF, keywords, and colors.
  * **Previous/Next Queries**:
    ```prisma
    const nextImage = await prisma.images.findFirst({
      where: { date: { gt: currentImage.date } },
      orderBy: { date: 'asc' }
    });
    const prevImage = await prisma.images.findFirst({
      where: { date: { lt: currentImage.date } },
      orderBy: { date: 'desc' }
    });
    ```
  * **Response**: Combined image details with prev/next references.

- **`GET /tags`**:
  * **Action**: Retrieve all keywords along with a count of related images (to build tag clouds).

### 2. Next.js Routing (`apps/web`)
* **Country Grid**: `app/bilder/[country]/page.tsx`
  * Renders a layout featuring maps, description text, and a high-performance grid of thumbnails.
* **Tag View**: `app/tag/[tag]/page.tsx`
  * Lists images mapped to specific tags.
* **Single Image Page**: `app/bild/[title]/page.tsx`
  * A theater-mode viewport for a single photo.
  * Displays full metadata, technical EXIF info (ISO, F-stop, shutter speed), tag badges, dominant color bubbles, and arrow keyboard navigation.
