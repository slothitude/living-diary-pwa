# Deployment Guide

This guide covers deploying Living Diary PWA to various platforms.

---

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Variables](#environment-variables)
- [Platform-Specific Guides](#platform-specific-guides)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Cloudflare Pages](#cloudflare-pages)
  - [Docker](#docker)
- [Production Optimizations](#production-optimizations)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### 1. Build Verification

```bash
# Install dependencies
npm install

# Run type check
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Environment Configuration

Create `.env.production`:

```env
VITE_AGENT_SERVICE_URL=https://your-agent-service.com
VITE_PIXAZO_API_KEY=your-production-key
VITE_SEARXNG_URL=https://your-searxng.com
```

### 3. Testing Checklist

- [ ] All features work in production build
- [ ] PWA installs correctly
- [ ] Offline mode works
- [ ] Push notifications work (if enabled)
- [ ] Images generate correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## Environment Variables

### Required Variables

```env
# Pixazo API (Required for images)
VITE_PIXAZO_API_KEY=sk-xxxxx
```

### Optional Variables

```env
# Agent Service (For advanced AI features)
VITE_AGENT_SERVICE_URL=https://your-agent-service.com

# SearXNG (For web search)
VITE_SEARXNG_URL=https://your-searxng.com
```

### Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files
- Use environment-specific configs
- Rotate API keys regularly
- Use different keys for dev/prod

---

## Platform-Specific Guides

### Vercel

**Recommended for:** Fast deployment, automatic previews, built-in CI/CD

#### Setup

1. **Install Vercel CLI:**

```bash
npm i -g vercel
```

2. **Login:**

```bash
vercel login
```

3. **Deploy:**

```bash
vercel
```

4. **Configure Environment Variables:**

```bash
vercel env add VITE_PIXAZO_API_KEY production
```

5. **Deploy to Production:**

```bash
vercel --prod
```

#### vercel.json Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Automatic Deployments

Every push to `main` triggers production deployment.
Every pull request triggers preview deployment.

---

### Netlify

**Recommended for:** Free hosting, form handling, serverless functions

#### Setup

1. **Install Netlify CLI:**

```bash
npm i -g netlify-cli
```

2. **Login:**

```bash
netlify login
```

3. **Initialize:**

```bash
netlify init
```

4. **Deploy:**

```bash
netlify deploy --prod
```

#### netlify.toml Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[context.production.environment]
  VITE_AGENT_SERVICE_URL = "https://your-agent-service.com"
```

---

### GitHub Pages

**Recommended for:** Free static hosting, GitHub integration

#### Setup

1. **Update vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/living-diary-pwa/', // Your repo name
  // ... rest of config
});
```

2. **Create Deploy Workflow:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_PIXAZO_API_KEY: ${{ secrets.VITE_PIXAZO_API_KEY }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. **Configure GitHub Settings:**

- Go to repo Settings → Pages
- Source: GitHub Actions
- Save

4. **Add Secrets:**

- Go to repo Settings → Secrets → Actions
- Add `VITE_PIXAZO_API_KEY`

---

### Cloudflare Pages

**Recommended for:** Global CDN, free SSL, instant rollbacks

#### Setup

1. **Connect Repository:**

- Go to Cloudflare Dashboard → Pages
- Click "Create a project"
- Connect GitHub

2. **Configure Build:**

```
Build command: npm run build
Build output directory: dist
Root directory: /
```

3. **Environment Variables:**

Add in Cloudflare Pages dashboard:

```
VITE_PIXAZO_API_KEY = your-key
```

4. **Deploy:**

Automatic deployment on push to `main`.

---

### Docker

**Recommended for:** Self-hosting, containerization, scaling

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

#### Build & Run

```bash
# Build image
docker build -t living-diary-pwa .

# Run container
docker run -d -p 8080:80 \
  -e VITE_PIXAZO_API_KEY=your-key \
  --name living-diary \
  living-diary-pwa
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_PIXAZO_API_KEY=${VITE_PIXAZO_API_KEY}
    restart: unless-stopped
```

Run:

```bash
docker-compose up -d
```

---

## Production Optimizations

### 1. Enable Compression

Add to `vite.config.ts`:

```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
});
```

### 2. Optimize Images

Use WebP format:

```typescript
// In component
<img
  src={imageUrl}
  loading="lazy"
  decoding="async"
/>
```

### 3. Lazy Load Routes

```typescript
// App.tsx
const BattleArena = lazy(() => import('./components/Battle/BattleArena'));
const SkillTree = lazy(() => import('./components/Skills/SkillTree'));

<Suspense fallback={<LoadingScreen />}>
  <BattleArena />
</Suspense>
```

### 4. Bundle Analysis

```bash
# Install bundle analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({ open: true }),
  ],
});

# Build with stats
npm run build
```

---

## Monitoring & Analytics

### Error Tracking

```typescript
// Error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to service (Sentry, LogRocket, etc.)
    console.error('Error:', error, errorInfo);
  }
}
```

### Performance Monitoring

```typescript
// Performance marks
performance.mark('feature-start');
// ... feature code ...
performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');
```

### Analytics (Optional)

Add Google Analytics or similar:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Troubleshooting

### Build Failures

**Issue:** Build fails with TypeScript errors

```bash
# Solution: Run type check locally
npm run check
# Fix errors, then rebuild
npm run build
```

**Issue:** Build succeeds but app crashes

```bash
# Solution: Preview locally first
npm run preview
# Test at http://localhost:4173
```

### Environment Variables Not Working

**Issue:** `import.meta.env` returns undefined

```bash
# Solution: Ensure variables start with VITE_
# Correct: VITE_API_KEY
# Wrong: API_KEY
```

### PWA Not Installing

**Issue:** PWA doesn't prompt to install

**Solutions:**
1. Serve over HTTPS (required for PWA)
2. Check manifest.json is accessible
3. Verify service worker is registered
4. Clear site data and retry

### Images Not Loading

**Issue:** Generated images show as broken

**Solutions:**
1. Check API key is valid
2. Verify CORS headers on API
3. Check browser console for errors
4. Ensure images are cached in IndexedDB

### Performance Issues

**Issue:** Slow load times

**Solutions:**
1. Enable gzip compression
2. Optimize images (WebP, lazy loading)
3. Use CDN for static assets
4. Implement code splitting
5. Enable browser caching

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check site is accessible
curl https://your-domain.com

# Check SSL certificate
curl -I https://your-domain.com

# Test PWA installability
# Open Chrome DevTools → Application → PWA
```

### 2. Monitor Logs

- **Vercel:** Dashboard → Logs
- **Netlify:** Dashboard → Functions → Logs
- **Docker:** `docker logs living-diary`

### 3. Set Up Alerts

Configure alerts for:
- Downtime
- Error rate spikes
- Performance degradation
- SSL expiration

### 4. Backup Strategy

- Regular database exports (IndexedDB)
- Backup environment variables
- Document deployment process

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor performance
- Review analytics

**Monthly:**
- Update dependencies
- Review security advisories
- Optimize images

**Quarterly:**
- Audit API usage
- Review costs
- Plan improvements

### Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Test thoroughly
npm run build
npm run preview
```

---

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting)
2. Search [GitHub Issues](https://github.com/slothitude/living-diary-pwa/issues)
3. Create new issue with details
4. Contact support@slothitudegames.com

---

**Happy Deploying!** 🚀

---

**Last Updated:** March 15, 2026
