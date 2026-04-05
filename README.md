# StepManiaX Tier List Maker

A modern web application for creating and ranking StepManiaX charts. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Features

- **All charts available at every level** – Access the full chart library across all difficulty levels
- **Multiple tier list variants** – Organize by Difficulty (default tiers), Skillset (8 categories), or create custom tier lists
- **Drag-and-drop row reordering** – Rearrange rows with visual insertion indicators
- **Row management** – Add, delete, rename rows, and customize colors with a random color generator
- **Drag-and-drop chart ranking** – Easily rank charts across tier rows
- **High-resolution PNG export** – Export tier lists as 2× resolution images
- **Custom tier list naming** – Name and organize your tier lists
- **Recently visited tracking** – Quickly access your latest tier lists from the homepage
- **Local storage persistence** – Auto-save and restore tier lists on reload
- **Import/export support** – Share or back up your tier lists

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Data Files

Place the following in your project:

**Source data file:**

- Copy your `smx.json` to `src/data/smx.json`

**Jacket images:**

- Copy your jacket image files to `public/images/jackets/smx/`
- Filenames should match the `jacket` field in your JSON (or songId with .jpg extension)

### 3. Transform the Data

Run the transformation script to generate the flat chart records:

```bash
npx ts-node scripts/transform-smx.ts
```

This creates `src/data/smx-charts.json` with all chart records flattened and ready to use.

**Note:** You'll need `ts-node` installed globally or use:

```bash
npx -y ts-node scripts/transform-smx.ts
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Creating a Tier List

1. **Select Difficulty & Level** - Choose a difficulty (Beginner, Easy, Hard, etc.) and level (1-28) from the homepage
2. **Choose a Tier List Type** - Select from:
   - **Difficulty** - Default tier system (default rating tiers)
   - **Skillset** - 8 categories (Stamina, Footspeed, Low BPM, Technical, Brackets, Rhythms, Twists, Gimmicks)
   - **Custom** - Create your own tier list (limited to 1 per level)
3. **Manage Rows** - Each row has quick controls on the left:
   - ⬆️ **Move Up** - Move row up one position
   - ⬇️ **Move Down** - Move row down one position
   - ⚙️ **Menu** - Access more options:
     - ✏️ Rename the row
     - 🎨 Choose a custom color or random color
     - ➕ Add rows above/below
     - 🗑️ Delete rows
   - Note: Maximum 12 rows per tier list
4. **Reorder Rows** - Use the arrow buttons (⬆️ ⬇️) for quick movement, or drag rows to reposition. Visual indicators (↑ INSERT ABOVE / ↓ INSERT BELOW) show where they'll be placed
5. **Drag Charts** - Drag song charts from the "Available Charts" sidebar into tier rows to rank them
6. **Name Your Tier List** - Click "+ add name" to give your tier list a custom name
7. **Auto-Save** - Your tier list is automatically saved to local storage

### Exporting & Sharing

**Export as Image** - Click the download icon to export your tier list as a high-resolution PNG

### Homepage Features

1. **Recently Visited** - Access your last 10 tier lists from the homepage
2. **Data Last Updated** - Check the song database update date in the top right
3. **Quick Selection** - Choose difficulty and level to jump directly to a tier list

## Component Architecture

### Server Components

- **TierBoardServer** - Loads chart data and renders the main board

### Client Components

- **TierBoard** - Main interactive tier list manager
- **TierRow** - Individual tier row with edit/delete controls
- **ChartCard** - Chart display with drag/drop support
- **FilterBar** - Filter controls with statistics

## State Management

State is managed using React hooks:

- **useTierListState** - Manages tier list state with localStorage persistence
- **useFilterState** - Manages filter state
- **useFilteredCharts** - Computed filter results

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Technologies

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Image Optimization**: Next.js Image component

## Credits

This project uses chart data, song metadata, and jacket artwork from **[ddr.tools](https://ddr.tools/)**, which provides comprehensive StepManiaX game data and assets.

- **Data Source**: Chart listings, difficulty levels, BPM information from ddr.tools
- **Assets**: Song jacket artwork from ddr.tools

Special thanks to Cathadan for maintaining this valuable resource!

## License

MIT

## Support

For issues or questions, please check the project documentation or review the component files for implementation details.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
