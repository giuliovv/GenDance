# GenDance

GenDance is like Just Dance, but with whatever song you want: an interactive web app that turns a track into a realtime AI dance performance with a 3D mannequin.

Live demo: https://gen-dance.vercel.app/

## What It Does

- Upload a track (or run the built-in demo song)
- Analyze audio rhythm and structure in the browser
- Generate a choreography plan with Gemini
- Render animated dance poses in a realtime 3D stage

## Tech Stack

- React + TypeScript
- Vite
- Three.js + React Three Fiber (+ Drei)
- Recharts
- Gemini API (`@google/genai`)

## Run Locally

Prerequisites:
- Node.js 18+ (recommended: latest LTS)
- npm

1. Install dependencies:
```bash
npm install
```

2. Create/update `.env.local`:
```bash
GEMINI_API_KEY=your_api_key_here
```

3. Start the dev server:
```bash
npm run dev
```

4. Open the local URL shown in the terminal (typically `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start local development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally

## High-Level Flow

1. User provides an audio file.
2. The app extracts timing/energy cues from the track.
3. Gemini returns a dance sequence mapped to those cues.
4. The 3D stage plays the generated sequence in sync with audio playback.

## Project Structure

- `App.tsx` - app state and flow orchestration
- `components/` - UI, stage, audio upload/analyzer, and helper screens
- `services/geminiService.ts` - Gemini request/response handling
- `constants.tsx` - pose definitions and shared constants
- `types.ts` - TypeScript domain types

## Notes

- This project is a demo/prototype focused on interactive experience.
- API usage requires a valid Gemini key in local environment configuration.
