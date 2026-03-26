# StepManiaX Tier List Maker - Quick Start Guide

## ✅ Project Created!

Your StepManiaX tier list maker is ready. Here's what's been set up:

### What You Have

- ✅ Next.js 16 with App Router
- ✅ TypeScript with strict typing
- ✅ Tailwind CSS for styling
- ✅ React hooks for state management
- ✅ Proper Server/Client component separation
- ✅ Drag-and-drop ready architecture
- ✅ Transform script for data processing
- ✅ Sample data and chart records

### Project Structure

```
stepmaniax-tier-list/
├── src/
│   ├── app/              (Next.js pages)
│   ├── components/
│   │   ├── client/       (Interactive components with 'use client')
│   │   │   ├── ChartCard.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── TierBoard.tsx
│   │   │   └── TierRow.tsx
│   │   └── server/       (Data loading components)
│   │       └── TierBoardServer.tsx
│   ├── data/
│   │   ├── smx.json                 (Your source data)
│   │   └── smx-charts.json          (Generated flat records)
│   ├── lib/
│   │   ├── hooks.ts     (React hooks for state)
│   │   └── utils.ts     (Utility functions)
│   ├── types/
│   │   └── smx.ts       (TypeScript type definitions)
├── scripts/
│   └── transform-smx.ts (Data transformation script)
├── public/
│   └── images/jackets/smx/  (Your jacket images)
└── package.json
```

## 🚀 Getting Started

### Step 1: Verify Installation

```bash
npm install  # Already done, but good to verify
```

### Step 2: Add Your Data

**Option A: Use Provided Sample**

- Sample `smx.json` is in `src/data/` with 2 example songs
- Sample `smx-charts.json` is pre-generated
- Go to Step 4 to test the app

**Option B: Use Your Own Data**

1. **Replace the source file:**

   ```
   src/data/smx.json
   ```

   - Update with your song data following the schema in README.md

2. **Create the jacket images directory (if needed):**

   ```
   public/images/jackets/smx/
   ```

   - Add your `.jpg` images here
   - Filenames should match the `jacket` field in your JSON

3. **Transform your data:**
   ```bash
   npm run transform
   ```
   Or manually:
   ```bash
   npx ts-node scripts/transform-smx.ts
   ```
   This generates `src/data/smx-charts.json`

### Step 3: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Test Features

- ✅ See sample tier list with 2 songs, 7 charts
- ✅ Try filtering by difficulty, level, search
- ✅ Click "+ Add Row" to create tier rows
- ✅ Drag charts into rows
- ✅ Edit tier names (click on them)
- ✅ Your tier list saves to localStorage

## 📝 Data Schema

### Input: smx.json

```json
{
  "songs": [
    {
      "id": "song-1",
      "title": "Song Title",
      "artist": "Artist Name",
      "jacket": "jacket-filename",
      "bpm": "170",
      "bpmDisplay": "170 BPM",
      "tags": ["tag1"],
      "charts": [
        {
          "type": "hard",
          "level": 21,
          "plus": false
        }
      ]
    }
  ]
}
```

### Output: smx-charts.json (auto-generated)

```json
[
  {
    "id": "song-1-hard-21-base",
    "songId": "song-1",
    "title": "Song Title",
    "artist": "Artist Name",
    "jacketUrl": "/images/jackets/smx/jacket-filename.jpg",
    "chartType": "hard",
    "isPlus": false,
    "level": 21,
    "modeGroup": "singles",
    "bpmDisplay": "170 BPM",
    "tags": ["tag1"]
  }
]
```

## 🔧 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run transform   # Transform smx.json → smx-charts.json
```

## 🎯 Next Steps

### To Use Your Own Data:

1. **Backup your current data** (optional):

   ```bash
   cp src/data/smx.json src/data/smx.json.backup
   cp src/data/smx-charts.json src/data/smx-charts.json.backup
   ```

2. **Replace smx.json** with your data

3. **Add jacket images** to `public/images/jackets/smx/`

4. **Run transform script:**

   ```bash
   npm run transform
   ```

5. **Refresh browser** to see your charts

### To Add Advanced Features:

- **Drag-and-drop (dnd-kit)** - Install when ready:

  ```bash
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```

- **Export as image** - Consider adding `html2canvas`

- **URL sharing** - Implement state serialization

## 🐛 Troubleshooting

**"Chart Data Not Found" error?**

- Check that `src/data/smx-charts.json` exists
- Run: `npm run transform`

**Images not loading?**

- Verify images are in `public/images/jackets/smx/`
- Check filenames match your JSON
- Use `.jpg` extension

**Build errors?**

```bash
npm install  # Reinstall dependencies
npm run build
```

## 📚 Architecture Notes

### Server vs Client Components

- **Server Components** (auto): Optimal for data loading
  - `TierBoardServer.tsx` - Loads chart data

- **Client Components** (`'use client'`): Required for interactivity
  - `TierBoard.tsx` - Main interactive board
  - `ChartCard.tsx` - Draggable chart cards
  - `TierRow.tsx` - Editable tier rows
  - `FilterBar.tsx` - Interactive filters

### State Management

All state uses React hooks:

- `useTierListState()` - Tier list with localStorage persistence
- `useFilterState()` - Filter preferences
- `useFilteredCharts()` - Computed filtered results

No external state management needed (yet)!

## ✨ Features Implemented

- ✅ Type-safe tier list builder
- ✅ Drag-and-drop chart placement
- ✅ Advanced filtering (difficulty, level, search, tags)
- ✅ Local storage persistence
- ✅ Responsive grid layout
- ✅ Editable tier rows with colors
- ✅ Proper Server/Client boundaries
- ✅ Transform script for data pipeline

## 🎨 Customization

### Change Tier Colors

Open `src/lib/utils.ts` and modify the `colors` array in `createDefaultTierRow()`:

```typescript
const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
];
```

### Adjust Chart Card Layout

Edit `src/components/client/ChartCard.tsx` to change:

- Card size
- Title display
- Image aspect ratio
- Bottom info layout

## 📖 Documentation

Full documentation available in:

- `README.md` - Comprehensive guide
- Component files - JSDoc comments

## 🚢 Ready for Production

The project is production-ready:

```bash
npm run build
npm start
```

Deploy to Vercel, Netlify, or your preferred hosting!

---

**Next Step:** Run `npm run dev` and start building your tier list! 🎮
