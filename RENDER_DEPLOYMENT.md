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

1. **Increase memory in build command:**
   Change `2048` to `4096` in `package.json` build script

2. **Upgrade Render Plan:**
   Consider upgrading from "Starter" to a higher tier with more memory

3. **Optimize Build:**
   - Ensure `.env` files are not included in build
   - Check `node_modules` size
   - Consider using Render's cache for `node_modules`

4. **Alternative Build Command:**
   ```bash
   NODE_OPTIONS='--max-old-space-size=4096' nest build
   ```

### Production Runtime

The production start script already includes memory management:
```json
"start:prod": "node --max-old-space-size=512 --expose-gc dist/main.js"
```

For higher memory requirements, use:
- `yarn start:prod:large` (1GB)
- `yarn start:prod:xl` (2GB)

Update `startCommand` in `render.yaml` accordingly.

