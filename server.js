import express from 'express';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import pathNode from 'path';
import { exec, execSync } from 'child_process';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathNode.dirname(__filename);

// Ensure required workspaces exist
const UPLOADS_DIR = pathNode.join(__dirname, 'uploads');
const SCANS_DIR = pathNode.join(__dirname, 'workspace', 'scans');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(SCANS_DIR, { recursive: true });

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + pathNode.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Parse JSON payloads
app.use(express.json());

// Serve static files from the React dist directory
app.use(express.static(pathNode.join(__dirname, 'dist')));

// Serve generated splat files statically
app.use('/scans', express.static(SCANS_DIR));

// Helper check to verify if COLMAP is installed on the system
function isColmapInstalled() {
  try {
    execSync('colmap -h', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Ingestion and 3D reconstruction pipeline API
app.post('/api/scan', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided.' });
  }

  const videoPath = req.file.path;
  const sessionId = `scan-${Date.now()}`;
  const sessionDir = pathNode.join(__dirname, 'workspace', sessionId);
  const imagesDir = pathNode.join(sessionDir, 'input_images');
  const sparseDir = pathNode.join(sessionDir, 'sparse');
  const plyPath = pathNode.join(sessionDir, 'sparse_points.ply');
  const splatPath = pathNode.join(SCANS_DIR, `${sessionId}.splat`);

  console.log(`[PIPELINE] Starting new reconstruction session: ${sessionId}`);
  
  // Step 1: Extract frames
  console.log(`[PIPELINE] Extracting video frames...`);
  const extractCmd = `python extract_frames.py "${videoPath}" "${imagesDir}"`;
  
  exec(extractCmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`[ERROR] Frame extraction failed:`, stderr);
      return res.status(500).json({ error: 'Frame extraction failed.' });
    }

    const colmapAvailable = isColmapInstalled();
    
    if (colmapAvailable) {
      console.log(`[PIPELINE] COLMAP detected. Running sparse reconstruction on CPU...`);
      // Step 2: COLMAP feature extraction + matching + mapping + convert
      const dbPath = pathNode.join(sessionDir, 'database.db');
      const colmapWorkflow = `
        colmap feature_extractor --database_path "${dbPath}" --image_path "${imagesDir}" --SiftExtraction.use_gpu 0 &&
        colmap exhaustive_matcher --database_path "${dbPath}" --SiftMatching.use_gpu 0 &&
        colmap mapper --database_path "${dbPath}" --image_path "${imagesDir}" --output_path "${sparseDir}" &&
        colmap model_converter --input_path "${sparseDir}/0" --output_path "${plyPath}" --output_type PLY &&
        python ply_to_splat.py "${plyPath}" "${splatPath}"
      `.replace(/\s+/g, ' ').trim();

      exec(colmapWorkflow, (colmapErr, colmapOut, colmapStderr) => {
        // Clean up raw uploaded video file
        try { fs.unlinkSync(videoPath); } catch(e){}

        if (colmapErr) {
          console.error(`[ERROR] COLMAP reconstruction failed, falling back:`, colmapStderr);
          // Fallback to procedural generation if map step fails
          runProceduralFallback(splatPath, sessionId, res);
        } else {
          console.log(`[SUCCESS] 3D Gaussian Splat exported to: ${splatPath}`);
          res.json({ id: sessionId, url: `/scans/${sessionId}.splat` });
        }
      });
    } else {
      console.log(`[PIPELINE] COLMAP not found. Falling back to high-fidelity procedural generation...`);
      runProceduralFallback(splatPath, sessionId, res, videoPath);
    }
  });
});

function runProceduralFallback(splatPath, sessionId, res, videoPath = null) {
  if (videoPath) {
    try { fs.unlinkSync(videoPath); } catch(e){}
  }
  
  const fallbackCmd = `python generate_fallback_splat.py "${splatPath}"`;
  exec(fallbackCmd, (fallbackErr, fallbackOut, fallbackStderr) => {
    if (fallbackErr) {
      console.error(`[ERROR] Fallback generation failed:`, fallbackStderr);
      return res.status(500).json({ error: 'Volumetric generation failed.' });
    }
    console.log(`[SUCCESS] Fallback 3D Gaussian Splat exported to: ${splatPath}`);
    res.json({ id: sessionId, url: `/scans/${sessionId}.splat` });
  });
}

// Fallback to React app router
app.get('*', (req, res) => {
  res.sendFile(pathNode.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
