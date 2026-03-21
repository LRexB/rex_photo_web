/**
 * Data Loading Strategy
 * 
 * This file contains example code for loading gallery data from the photo directory structure.
 * There are several approaches:
 * 
 * 1. STATIC DATA (Current - for development)
 *    - Hardcoded gallery information
 *    - Good for testing UI before photos are available
 * 
 * 2. API ENDPOINT (Recommended for production)
 *    - Backend server scans photo directories
 *    - Extracts metadata and generates thumbnails
 *    - Returns JSON to frontend
 *    - Example: GET /api/galleries
 * 
 * 3. BUILD-TIME GENERATION (Static site generation)
 *    - Scan directories during build process
 *    - Generate gallery metadata during npm run build
 *    - Include in dist/ as JSON files
 *    - Import galleries.json in App component
 * 
 * 4. CLOUDFLARE WORKER (Edge computing)
 *    - Use Cloudflare Workers to serve directory listings
 *    - Scan public/photos on-demand
 *    - Cache results
 */

// Example API endpoint implementation (implement on your backend):
/*
import { express } from 'express';
import fs from 'fs-extra';
import path from 'path';

const photosDir = path.join(__dirname, 'public', 'photos');

app.get('/api/galleries', async (req, res) => {
  const categories = { latest: [], recommended: [], popular: [] };
  
  const galleries = await fs.readdir(photosDir);
  
  for (const dir of galleries) {
    const match = dir.match(/^(\d{4})_(\d{2})_(\d{2})_(.+)$/);
    if (!match) continue;
    
    const [, year, month, day, name] = match;
    const galleryPath = path.join(photosDir, dir);
    const descPath = path.join(galleryPath, 'description.txt');
    
    if (!fs.existsSync(descPath)) continue;
    
    const description = await fs.readFile(descPath, 'utf8');
    
    const gallery = {
      id: dir,
      date: ${year}-${month}-${day},
      name: name.replace(/_/g, ' '),
      description: description.trim(),
      thumbnail: `/photos/${dir}/0001.jpg` // first image
    };
    
    categories.latest.push(gallery);
  }
  
  // Sort by date
  categories.latest.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(categories);
});
*/

// Example Build-time generation (add to vite.config.js):
/*
import fs from 'fs-extra';
import path from 'path';

export default {
  plugins: [{
    name: 'gallery-scanner',
    resolveId: 'virtual-galleries',
    load: async () => {
      const photosDir = path.join('public', 'photos');
      const galleries = { latest: [], recommended: [], popular: [] };
      
      const dirs = await fs.readdir(photosDir);
      for (const dir of dirs) {
        // Parse directory name and generate metadata
        // Return as JSON string
      }
      
      return `export default ${JSON.stringify(galleries)}`;
    }
  }]
}
*/

export default {
  // To implement real data loading, replace the mock data in App.jsx
  // with one of the strategies above
}
