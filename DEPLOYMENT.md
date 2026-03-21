# Deployment Guide

This guide walks you through deploying the Rex Photo Web to Cloudflare Pages with automatic GitHub integration.

## Prerequisites

- GitHub account (free or paid)
- Cloudflare account with your domains (rexbenning.com, rexbenning.ca)
- Domains registered on Namecheap
- Node.js installed locally
- Git installed

## Step 1: Create GitHub Repository

### 1a. Initialize Local Git Repository

```bash
cd /Users/rexb/dev/rex_photo_web

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Photo portfolio website"
```

### 1b. Create New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in top right → **New repository**
3. Repository name: `rex_photo_web`
4. Description: `Photography portfolio website built with React and Vite`
5. Choose **Public** (recommended for portfolio) or **Private**
6. DO NOT initialize with README, .gitignore, or license (we have these)
7. Click **Create repository**

### 1c. Push Code to GitHub

```bash
# Add the remote repository
git remote add origin https://github.com/yourusername/rex_photo_web.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Connect to Cloudflare Pages

### 2a. Access Cloudflare Pages

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. In the sidebar, go to **Pages**

### 2b. Connect GitHub Repository

1. Click **Create a project** → **Connect to Git**
2. Select **GitHub** as the host
3. Click **Connect GitHub account** (if needed)
4. Authorize Cloudflare to access your repositories
5. Find and select `rex_photo_web` repository
6. Click **Begin setup**

### 2c. Configure Build Settings

On the build configuration page, set:

**Project name:** `rex-photo-web`

**Production branch:** `main`

**Build command:** 
```
npm run build
```

**Build output directory:**
```
dist
```

**Root directory:** (leave blank)

**Environment variables:** (optional)
```
NODE_VERSION=18
```

Click **Save and Deploy**

### 2d. Monitor First Deployment

- Cloudflare will build and deploy your site automatically
- Check deployment status on the Pages dashboard
- First deployment usually takes 2-5 minutes

## Step 3: Configure Custom Domains

### 3a. Add rexbenning.com

1. In Cloudflare Pages project dashboard, go to **Custom domain**
2. Click **Set up a custom domain**
3. Enter: `rexbenning.com`
4. Select your Cloudflare zone for this domain
5. Click **Activate domain**

### 3b. Add rexbenning.ca

1. Click **+ Custom domain** again
2. Enter: `rexbenning.ca`
3. Configure similarly
4. Click **Activate domain**

### 3c. DNS Configuration (if needed)

If your domains are not on Cloudflare but on Namecheap:

#### For rexbenning.com:

1. Go to Namecheap account
2. Find your domain
3. Click **Manage**
4. Go to **Advanced DNS**
5. Update **Nameservers** to point to Cloudflare:
   - First nameserver: `ns1.cloudflare.com`
   - Second nameserver: `ns2.cloudflare.com`
6. Save changes (may take 24-48 hours to propagate)

Alternatively, create CNAME records:

| Type  | Name | Value                                    | TTL  |
|-------|------|------------------------------------------|------|
| CNAME | www  | rex_photo_web.pages.dev                  | Auto |
| A     | @    | [Cloudflare IP - from dashboard]        | Auto |

## Step 4: Set Up Automatic Deployments

### 4a. Configure GitHub Webhooks (typically automatic)

Once connected, Cloudflare automatically:
- Watches your `main` branch
- Triggers build on every push
- Deploys successful builds automatically

### 4b. Workflow for Updates

```bash
# Make changes locally
# Edit files as needed

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Cloudflare Pages automatically:
# 1. Detects the push
# 2. Builds the project
# 3. Deploys to your website
```

## Step 5: Add Photo Galleries

### 5a. Create Photos Directory

```bash
# Create photos directory
mkdir -p public/photos

# Create first gallery
mkdir "public/photos/2024_03_15_SpringPortrait"
echo "Spring portrait collection" > "public/photos/2024_03_15_SpringPortrait/description.txt"

# Add sample images (you'll add real ones)
# cp your-image.jpg "public/photos/2024_03_15_SpringPortrait/IMG0001.jpg"
```

### 5b. Add Photo Files

1. Follow the directory structure from GALLERY_STRUCTURE.md
2. Add image files locally
3. Ensure filenames follow naming conventions
4. Add description.txt to each gallery

### 5c. Update and Deploy

```bash
# After adding photos
git add public/photos/
git commit -m "Add spring portrait gallery"
git push origin main

# Visit your sites to see updates!
```

## Step 6: SSL/HTTPS Setup

Cloudflare Pages automatically provides HTTPS for:
- `*.pages.dev` domain
- Custom domains configured in their system

### Verify SSL

- Visit both `https://rexbenning.com` and `https://rexbenning.ca`
- Should load with no warnings
- Check for lock icon in browser address bar

## Step 7: Performance & Caching

### Enable Caching Rules in Cloudflare

1. Go to **Rules** → **Cache Rules**
2. Create rule for static assets:
   ```
   URI path contains: (/dist/ OR .js OR .css)
   ```
   Set cache duration to 30 days

3. Create rule for images:
   ```
   URI path contains: /photos/
   ```
   Set cache duration to 90 days

## Step 8: Monitoring & Analytics

### View Deployment Status

- **Dashboard** → **Pages** → Select project
- **Deployments** tab shows history
- Click on deployment for logs

### Monitor Site Performance

1. **Analytics** tab in Cloudflare Pages
2. View:
   - Total requests
   - Status codes
   - Performance metrics
3. Set up alerts for failures

## Troubleshooting

### Build Fails

1. Check build logs:
   - Go to failed deployment
   - Click **View build logs**
   - Look for error messages

2. Common issues:
   ```bash
   # Missing dependencies
   npm install
   npm run build
   
   # Node version mismatch
   # Add to wrangler.toml or set in Cloudflare dashboard
   ```

### Site Not Updating

1. Verify GitHub push succeeded:
   ```bash
   git log --oneline  # See recent commits
   git remote -v      # Verify remote URL
   ```

2. Check Cloudflare deployment:
   - Dashboard → Pages → Deployments
   - Verify recent deployment shows "Success"

3. Clear browser cache:
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Domain Not Resolving

1. Wait for DNS propagation (24-48 hours)
2. Verify nameserver update at registrar
3. Use DNS propagation checker: [whatsmydns.net](https://www.whatsmydns.net)

## GitHub Actions (Optional)

You can add automated testing to your GitHub workflow:

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: rex-photo-web
          directory: dist
          branch: main
```

## Maintenance

### Regular Tasks

- **Weekly**: Check analytics and error logs
- **Monthly**: Update dependencies: `npm update`
- **Quarterly**: Review and update documentation
- **On-demand**: Add new photo galleries

### Backup

1. Regular Git commits preserve history
2. GitHub automatically backs up your code
3. Cloudflare stores deployment history

## Security Best Practices

1. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   npm audit fix
   ```

2. **Use environment variables** for sensitive data
3. **Enable Cloudflare DDoS protection**
4. **Set up access restrictions** if needed
5. **Monitor build logs** for errors

## Performance Optimization

1. **Image optimization**:
   - Use tools like ImageOptim or TinyPNG
   - Target: <2MB per image

2. **Enable gzip compression** (default in Cloudflare)
3. **Monitor Core Web Vitals** in Cloudflare Analytics
4. **Use CDN cache headers** effectively

## Support & Resources

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- GitHub Pages to Cloudflare: https://developers.cloudflare.com/pages/migrations/github-pages/
- Namecheap DNS Management: https://www.namecheap.com/support/

---

**Happy deploying!** 🚀
