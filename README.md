# SmartSense

SmartSense is a full-stack web application for intelligent campus and building sensing, safety, occupant insights, rewards, and dashboard experiences.

## Tech stack

- React and Vite
- TypeScript
- Express
- Tailwind CSS and Radix UI
- Recharts and Framer Motion

## Requirements

- Node.js 18 or newer
- npm

## Run locally

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Start the development server:

```bash
npm run dev
```

The development server runs on the port reported by Vite.

## Production build

```bash
npm install --legacy-peer-deps
npm run build
npm start
```

The production server reads the `PORT` environment variable supplied by the hosting platform and falls back to port `3000` locally.

## Deploy on Render

Create a Render **Web Service** connected to this repository with:

- **Instance type:** Free
- **Build command:** `npm install --legacy-peer-deps && npm run build`
- **Start command:** `npm start`

Render supplies `PORT` automatically.

## Repository

This project is maintained in the public GitHub repository:

<https://github.com/25158074-alt/Smartsense>
