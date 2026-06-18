<div align="center">
<img width="1200" height="475" alt="Veda 3D Scanner - Convert Video to 3D Gaussian Splats" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ✨ Veda: Preserve Reality in 3D

Transform any video into an interactive, shareable 3D world using Gaussian Splatting. Upload a video. Get a photorealistic 3D model. Explore it instantly in your browser.

**No app installation. No complicated software. Pure web magic.**

---

## What is Veda?

Veda is a cutting-edge web application that harnesses the power of **Gaussian Splatting** and **AI** to convert video footage into stunning 3D representations. Whether you're capturing a room, a sculpture, a landscape, or any scene—Veda transforms it into a lightweight, explorable 3D model that anyone can view in a web browser.

### The Three Pillars

🧠 **Neural Fidelity** — Powered by Gaussian Splatting for photorealistic 3D that captures the essence of your scene.

🪶 **Light as Air** — Optimized 3D models (typically 10MB or less) that load instantly even on mobile data.

🌐 **Web Native** — No installations. No plugins. Runs in any modern browser on any device.

---

## Features

✅ **One-Click Scanning** — Upload a video, watch as Veda processes it through multiple AI stages  
✅ **Interactive 3D Viewer** — Orbit, zoom, and explore your scanned world from any angle  
✅ **Gallery Management** — Store and access all your scanned 3D models  
✅ **Shareable Results** — Export and share your 3D worlds with anyone  
✅ **Glassmorphic Design** — A modern, elegant UI that feels premium and responsive  
✅ **Real-Time Processing** — Watch the conversion process with live stage updates and progress tracking

---

## Processing Pipeline

When you upload a video, Veda orchestrates a sophisticated multi-stage pipeline:

1. 🎬 **Ingest Video Frames** — Extract individual frames from your video
2. 📊 **Extract Depth Maps** — Understand the 3D structure at each frame
3. 🔄 **Structure from Motion** — Reconstruct 3D camera trajectories and geometry
4. ☁️ **Generate Point Cloud** — Create a dense 3D point representation
5. 🌟 **Optimize Gaussian Splats** — Convert to highly efficient Gaussian primitives
6. 🎯 **Finalize Mesh** — Produce a viewer-ready 3D model

All powered by Google's Gemini API and the latest AI research.

---

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Three.js & React Three Fiber for 3D rendering
- Vite for blazingly fast development & builds
- Tailwind CSS + Motion for modern glassmorphic UI
- Lucide React for beautiful icons

**Backend:**
- Express.js for lightweight server
- Node.js runtime

---

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env.local` file in the project root with any required API keys for your deployment.

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
veda/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx       # Hero page with feature showcase
│   │   ├── UploadFlow.tsx        # Video upload & processing UI
│   │   ├── Viewer.tsx            # 3D model viewer with interactions
│   │   └── Gallery.tsx           # Collection of scanned models
│   ├── components/
│   │   └── Header.tsx            # Navigation header
│   ├── lib/
│   │   └── utils.ts              # Utility functions
│   ├── App.tsx                   # Main app component & routing
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles
├── server.js                     # Express backend
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm start` | Run production server |
| `npm run lint` | Type-check TypeScript |
| `npm run clean` | Remove build artifacts |

---

## How It Works

### The User Journey

1. **Land** → Visitors see a stunning hero page explaining what Veda does
2. **Upload** → Drag & drop (or click to select) a video file
3. **Process** → Watch real-time logs as AI transforms the video into a 3D model
4. **Explore** → Interact with the 3D model—orbit, zoom, rotate
5. **Share** → Export and share the model, or browse your gallery

### Under the Hood

- **Frame Extraction:** Video is analyzed frame-by-frame to understand motion and geometry
- **Depth Estimation:** AI models predict depth at each pixel
- **Structure from Motion:** Camera trajectory and 3D structure are reconstructed
- **Point Cloud Generation:** Millions of 3D points represent the scene
- **Gaussian Optimization:** Points are converted to efficient Gaussian primitives (10-50x smaller)
- **WebGL Rendering:** Models are rendered in the browser using Three.js with smooth interactions

---

## Performance & Optimization

- **Efficient Encoding:** Gaussian Splats use a fraction of the memory of traditional 3D formats
- **Lazy Loading:** Only loaded 3D data is transmitted to the user
- **Mobile Friendly:** Optimized for low-bandwidth and mobile devices
- **Progressive Enhancement:** Works gracefully across all modern browsers

---

## Browser Support

Veda works on all modern browsers that support:
- WebGL 2.0
- ES2020+
- CSS Grid & Flexbox

| Browser | Status |
|---------|--------|
| Chrome/Chromium | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |
| Mobile Safari | ✅ Full support |
| Mobile Chrome | ✅ Full support |

---

## Use Cases

📸 **Real Estate** — Immersive property tours  
🏢 **Architecture** — Present designs interactively  
🎮 **Game Development** — Quick 3D asset capture  
📚 **Heritage** — Preserve historical sites and artifacts  
🔬 **Research** — Document and analyze 3D structures  
🎨 **Creative** — Stunning visuals for portfolios and social media  

---

## Contributing

Contributions and feedback are welcome! Feel free to:
- Report issues
- Suggest features
- Submit pull requests
- Share your scanned models

---

## License

Apache License 2.0 — See LICENSE file for details

---

---

<div align="center">

**Built with React • Three.js • Gaussian Splatting**

*Transform video into 3D. Share reality. Explore infinitely.*

</div>
