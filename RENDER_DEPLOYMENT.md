# Render Deployment Guide

## Memory Configuration

The application has been configured to handle memory constraints during build and runtime on Render.

### Build Configuration

The build script uses increased memory allocation:
```json
"build": "NODE_OPTIONS='--max-old-space-size=2048' nest build"
```

This allocates 2GB of memory for the build process to prevent "JavaScript heap out of memory" errors.

### Render Configuration

The `render.yaml` file includes:
- Build command with memory allocation
- Runtime memory configuration via `NODE_OPTIONS`
- Health check endpoint configuration

### Manual Render Setup (Alternative)

If not using `render.yaml`, configure in Render Dashboard:

1. **Environment Variables:**
   ```
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=2048 --expose-gc
   ```

2. **Build Command:**
   ```
   yarn install && NODE_OPTIONS='--max-old-space-size=2048' yarn build
   ```

3. **Start Command:**
   ```
   yarn start:prod
   ```

4. **Health Check Path:**
   ```
   /api/v1/health
   ```

### Troubleshooting

If you still get memory errors:

⚠️ **CRITICAL: Render Starter plan has very limited memory (often 512MB-1GB). The container memory is the limiting factor, not just Node.js heap size. You will likely need to upgrade to Standard plan (2GB RAM) for the build to succeed.**

1. **Upgrade Render Plan (RECOMMENDED):**
   - Go to Render Dashboard → Your Service → Settings
   - Change plan from "Starter" to "Standard" (2GB RAM) or higher
   - This is often the only reliable solution

2. **Alternative Build Approaches:**

   **Option A: Use TypeScript compiler directly (lighter):**
   ```bash
   buildCommand: yarn install && yarn build:tsc
   ```

   **Option B: Clean build with cache clearing:**
   ```bash
   buildCommand: rm -rf dist node_modules/.cache && yarn install && yarn build:memory
   ```

   **Option C: Build in stages:**
   ```bash
   buildCommand: yarn install --frozen-lockfile && yarn build:memory || yarn build
   ```

3. **Optimize Build:**
   - Ensure `.env` files are not included in build (check `.gitignore`)
   - Check `node_modules` size
   - Enable Render's cache for `node_modules` in settings
   - Remove unused dependencies

4. **Reduce Memory Usage:**
   - The build config already disables source maps and declarations
   - Ensure `incremental: false` in `tsconfig.build.json`
   - Check for large files in `src/` that don't need compilation

5. **Check Render Service Limits:**
   - Starter plan: ~512MB-1GB total memory
   - Standard plan: ~2GB total memory  
   - The Node.js memory allocation can't exceed container memory

### Production Runtime

The production start script already includes memory management:
```json
"start:prod": "node --max-old-space-size=512 --expose-gc dist/main.js"
```

For higher memory requirements, use:
- `yarn start:prod:large` (1GB)
- `yarn start:prod:xl` (2GB)

Update `startCommand` in `render.yaml` accordingly.

