# Manual Fix Steps - React 18 Downgrade

## ✅ Completed
- [x] Updated `package.json` to React 18.3.1
- [x] Deleted `package-lock.json`

## ⏳ You Need to Complete Manually

### Step 1: Stop Any Running Processes
```bash
# If dev server is running, press Ctrl+C
```

### Step 2: Delete node_modules
**Close VS Code, then delete manually:**
1. Navigate to: `C:\Users\sunils\OneDrive - Ajanta Pharma Limited\Webapps\VMS`
2. Delete the `node_modules` folder
3. If you get "Access Denied", restart your computer first

### Step 3: Install Dependencies
```bash
npm install
```

**Expected output:**
```
added XXX packages in XXs
```

### Step 4: Build
```bash
npm run build
```

**Expected output:**
```
vite v5.3.1 building for production...
✓ XXX modules transformed
dist/index.html
dist/assets/*.css
dist/assets/*.js
✓ built in XXs
```

### Step 5: Commit Changes
```bash
git add package.json package-lock.json
git commit -m "fix: downgrade to React 18 for lucide-react compatibility"
git push origin main
```

### Step 6: Verify Vercel Deployment
- Go to Vercel Dashboard
- Check deployment status
- Build should succeed

---

## Updated Dependencies

### package.json Changes:
```json
{
  "dependencies": {
    "react": "^18.3.1",          // was ^19.0.0
    "react-dom": "^18.3.1"       // was ^19.0.0
  },
  "devDependencies": {
    "@types/react": "^18.3.12",      // was ^19.0.0
    "@types/react-dom": "^18.3.1"    // was ^19.0.0
  }
}
```

### All Other Dependencies (Unchanged):
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.43.4",
    "@tanstack/react-query": "^5.45.1",
    "lucide-react": "^0.395.0",
    "react-router-dom": "^6.23.1",
    "react-hook-form": "^7.51.5",
    "zod": "^3.23.8"
  }
}
```

---

## Expected Build Output

```bash
> avems@1.0.0 build
> tsc && vite build

vite v5.3.1 building for production...
✓ 427 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     24.15 kB │ gzip:  6.42 kB
dist/assets/index-def456.js     187.43 kB │ gzip: 61.28 kB
✓ built in 3.47s
```

---

## Success Indicators

- ✅ No ERESOLVE errors during npm install
- ✅ TypeScript compilation succeeds
- ✅ Vite build completes
- ✅ No dependency conflicts
- ✅ Vercel deployment succeeds

---

**Current Status:**
- ✅ package.json updated
- ⏳ Awaiting manual node_modules deletion
- ⏳ Awaiting npm install
- ⏳ Awaiting build verification
- ⏳ Awaiting git commit & push
