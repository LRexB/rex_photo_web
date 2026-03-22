# Rex Photo Web - Photography Portfolio Website

A modern, responsive web application for displaying photography portfolios. Built with React, Vite, and designed for deployment on Cloudflare Pages.

## Features

- **Landing Page** with promotional banner and navigation menu
- **Gallery Rows** with horizontally scrollable gallery previews:
  - Latest galleries
  - Recommended galleries
  - Most Popular galleries
- **Gallery Detail Pages** with photo grid display
- **Photo Lightbox** viewer with full-size images and EXIF metadata
- **Responsive Design** optimized for desktop, tablet, and mobile
- **Fast Performance** with Vite and React
- **Cloudflare Pages Ready** for easy deployment

## Project Structure

```
.
├── index.html                 # Main HTML entry point
├── package.json              # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── wrangler.toml            # Cloudflare deployment config
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Main app component with routing
│   ├── App.css              # App-level styles
│   ├── index.css            # Global styles
│   ├── pages/
│   │   ├── LandingPage.jsx   # Home page
│   │   ├── LandingPage.css
│   │   ├── GalleryDetail.jsx # Individual gallery page
│   │   └── GalleryDetail.css
│   ├── components/
│   │   ├── Header.jsx        # Navigation header
│   │   ├── Header.css
│   │   ├── Banner.jsx        # Page banner with image
│   │   ├── Banner.css
│   │   ├── GalleryRow.jsx    # Horizontally scrollable row
│   │   ├── GalleryRow.css
│   │   ├── GalleryCard.jsx   # Gallery preview card
│   │   ├── GalleryCard.css
│   │   ├── PhotoGrid.jsx     # Photo grid display
│   │   ├── PhotoGrid.css
│   │   ├── PhotoLightbox.jsx # Full-size photo viewer
│   │   ├── PhotoLightbox.css
│   │   ├── Footer.jsx        # Page footer
│   │   └── Footer.css
│   └── utils/
│       └── galleryUtils.js   # Utility functions
├── public/                   # Static images folder
│   └── images/              # Banner and default images
└── specs.txt                # Project specifications
```

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   ```
   Build output is in the `dist/` directory

## Gallery Structure

### Directory Naming Convention

Photo galleries must follow this naming format:
```
YYYY_MM_DD_JobName
```

Example:
```
2024_03_15_SpringPortrait
2024_02_28_WinterLandscape
```

### Gallery Contents

Each gallery directory should contain:

1. **Description File** - A text file describing the gallery contents:
   ```
   description.txt
   ```

2. **Photo Files** - Images with naming convention:
   - Basic: `AAAANNNN.ext` (e.g., `ABC0001.jpg`)
   - With Title: `AAAANNNNTTTT.ext` (e.g., `ABC0001Morning.jpg`)

   Supported extensions: `.jpg`, `.jpeg`, `.png`, `.tif`, `.tiff`, `.cr2`, `.raf`, `.gif`, etc.

### Photo Metadata

The system displays the following metadata for each photo:
- **Date**: Photo capture date from filename or EXIF
- **Camera**: Camera model from EXIF data
- **Aperture (f-stop)**: Lens aperture setting
- **Shutter Speed**: Exposure duration
- **ISO**: Film/sensor sensitivity

## Data Fetching

Currently, the application uses mock data. To integrate with real photo galleries:

1. **API Integration**: Modify `src/App.jsx` to fetch galleries from your API
2. **File System Scanning**: Set up a backend service to scan the photo directories
3. **Metadata Extraction**: Implement EXIF reading to automatically extract camera settings

### Mock Data Structure

```javascript
{
  latest: [
    {
      id: '2024_03_15_SpringPortrait',
      date: '2024-03-15',
      name: 'Spring Portrait',
      thumbnail: '/images/thumb.jpg',
      description: 'Gallery description...'
    }
  ]
}
```

## Deployment

### Deploy to Cloudflare Pages

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/rex_photo_web
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Pages Dashboard](https://pages.cloudflare.com)
   - Click "Create a project"
   - Select your GitHub repository
   - Set build command to: `npm run build`
   - Set build output directory to: `dist`
   - Leave deploy command empty (not required for normal Pages Git deployments)

3. **Configure Custom Domains**
   - Add `rexbenning.com` as a custom domain
   - Add `rexbenning.ca` as an additional domain
   - Update DNS records at Namecheap if needed

### Notes

- This project is intended to deploy through Cloudflare Pages Git integration.
- `wrangler.toml` is kept minimal for Pages compatibility.
- Avoid adding Workers-style sections such as `[build]` or `[env.production]` for this site.

## Styling & Theme

The project uses a dark, professional theme with:
- **Primary Color**: `#1a1a1a` (Dark background)
- **Accent Color**: `#d4af37` (Gold highlight)
- **Text**: `#f0f0f0` (Light gray)

Customize these colors in `src/index.css` under the `:root` pseudo-class.

## Browser Support

- Chrome/Edge 90+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

### Adding New Components

1. Create component file in `src/components/`
2. Create corresponding CSS file
3. Import and use in parent component
4. Keep components focused and reusable

### Environment Variables

Create a `.env` file for configuration:
```
VITE_API_URL=https://api.example.com
VITE_IMAGE_PATH=/photos
```

## Photo Upload Procedure

A secure upload mechanism needs to be implemented separately:

1. Create a backend service to handle file uploads
2. Validate gallery directory names
3. Scan for photos and extract metadata
4. Generate thumbnails
5. Store in appropriate directory structure
6. Trigger deployment to update the website

(This is mentioned in specs as a separate update procedure)

## Performance Tips

- Optimize images using tools like ImageMagick before uploading
- Generate thumbnails (recommended: 280x200px for gallery cards)
- Use WebP format for faster loading when possible
- Leverage Cloudflare's CDN for global distribution

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process using the port
lsof -ti:3000 | xargs kill -9
# Or specify a different port
npm run dev -- --port 3001
```

### Build Errors
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Images Not Loading
- Check that image paths in components are correct
- Ensure images exist in `public/images/` directory
- Verify file extensions match the code

## Future Enhancements

- [ ] Backend API for dynamic gallery management
- [ ] User authentication and admin panel
- [ ] Automated thumbnail generation
- [ ] Advanced EXIF data extraction and display
- [ ] Image search and filtering capabilities
- [ ] Social media sharing features
- [ ] Download/print options
- [ ] Comments and feedback system

## License

© 2024 Rex Benning Photography. All rights reserved.
Images and content are the intellectual property of Rex Benning.

## Contact

For questions or support, contact Rex Benning directly.

---

**Built with:**
- React 18
- Vite 5
- React Router 6
- Cloudflare Pages
