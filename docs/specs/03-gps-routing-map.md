# Feature Spec: GPS Tracks & Interactive Travel Maps

This specification details the GPS tracking system and travel map route (`/unsere-reise`) used to display the travel timeline and coordinates across Asia.

---

## 💾 Database Schema Mapping

The database models are defined in [schema.prisma](file:///Users/stefan.kendlbacher/skendlba/quer-durch-asien-next/apps/api/prisma/schema.prisma):

```prisma
model gpstrack {
  id            BigInt @unique(map: "idx_16425_PRIMARY") @default(autoincrement())
  utc           Int    @default(0)
  lat           Float  @default(0) // Latitude
  lon           Float  @default(0) // Longitude
  altitude      Float  @default(0)
  countrycode   String @default("") @db.VarChar(30)
  // ... extra tracking diagnostics fields
}

// In model 'images', the coordinates are stored as EXIF text fields:
model images {
  id               Int     @id @default(autoincrement())
  filename         String  @db.VarChar(255)
  EXIFGPSLatitude  String? @db.VarChar(52) // Example: "55.7558"
  EXIFGPSLongitude String? @db.VarChar(52) // Example: "37.6173"
  EXIFGPSAltitude  String? @db.VarChar(52)
}
```

---

## 🔀 Legacy Routing & Logic

### Reiseroute Timeline & Map
- **Legacy Route**: `/unsere-reise` (routed to `main/reiseroute` controller action).
- **Behavior**:
  - Serves an interactive map using JavaScript.
  - Queries `gpstrack` to draw a path (polyline) of the travel itinerary.
  - Places image markers along the path using geotagged photos.
  - Provides a sidebar of days (Timeline navigation) linked to galleries.

---

## 🚀 Target Architecture

### 1. API Endpoints (`apps/api`)
Introduce a new route group `apps/api/src/routes/gps.routes.ts`:

- **`GET /gps/tracks`**:
  * **Action**: Queries the `gpstrack` table for coordinate coordinates (`lat`, `lon`, `utc`).
  * **Response**: Simplified array of coordinates (GeoJSON LineString format or simple points arrays) to draw the polyline.
  * **Optimization**: Since GPS logs can contain thousands of data points, downsample/simplify the path coordinates (using the Douglas-Peucker algorithm or SQL steps, e.g. every N-th coordinate) for fast network transmission.

- **`GET /gps/photos`**:
  * **Action**: Queries `images` where `EXIFGPSLatitude != '0'` and `EXIFGPSLongitude != '0'`.
  * **Response**: Array of photo markers including latitude, longitude, and thumbnail paths.

### 2. Next.js Routing (`apps/web`)
* **Map Route**: `app/unsere-reise/page.tsx`
  * Embeds an interactive map component using a modern library like **React Map GL (Mapbox)**, **MapLibre GL**, or **Leaflet**.
  * Renders a polyline tracing the coordinates fetched from `GET /gps/tracks`.
  * Renders custom markers along the line. Clicking a marker displays a popup with the geotagged photo, description, and link to the photo details page (`/bild/[title]`).
  * Integrates a travel diary sidebar that scrolls parallel to map positions.
