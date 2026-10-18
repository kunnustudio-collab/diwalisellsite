# 🚂 DeepAura — Diwali Decor: Railway Deployment Guide

Ye website **Railway.app** par 100% asaani se deploy ho sakti hai! Next.js 14 App Router full-stack architecture hone ki wajah se Railway isko automatically detect karke deploy kar deta hai.

---

## 📋 Quick Deployment Steps (5 Minutes)

### Step 1: GitHub par Code Push Karein
Agar aapka code GitHub par nahi hai toh pehle GitHub par repository banakar push karein:
```bash
git add -A
git commit -m "Ready for Railway deployment"
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

---

### Step 2: Railway.app par New Project Banayein
1. [https://railway.app](https://railway.app) par login ya sign up karein.
2. Dashboard par **"New Project"** par click karein.
3. **"Deploy from GitHub repo"** select karein.
4. Apni repository select karein (`DIWALI SITE` ya jo bhi naam ho).
5. **"Deploy Now"** par click karein.

---

### Step 3: Environment Variables Set Karein
Railway Dashboard mein aapke service par click karein -> **"Variables"** tab mein jayein -> **"Raw Editor"** ya single variable add karein:

```env
NODE_ENV=production
ADMIN_JWT_SECRET=super_secret_jwt_random_key_min_32_characters_long
INITIAL_ADMIN_EMAIL=admin@deepaura.com
INITIAL_ADMIN_PASSWORD=DeepAura@2026
NEXT_PUBLIC_SITE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

*(Optional Payment Gateway Variables):*
- Agar **YouPI-PG** use kar rahe hain:
  ```env
  NEXT_PUBLIC_YOUPI_URL=https://your-youpi-instance.up.railway.app
  NEXT_PUBLIC_YOUPI_MERCHANT_KEY=yp_live_...
  YOUPI_WEBHOOK_SECRET=your_secret_here
  ```
- Agar **Supabase Cloud DB** use karna ho:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```
- Agar **Gemini AI Review Assistant** use karna ho:
  ```env
  GEMINI_API_KEY=AIzaSy...
  ```

---

### Step 4: Persistent Volume Setup (Data & Image Uploads ke liye)
Railway containers restart hone par local files reset na ho, iske liye:
1. Railway Dashboard mein apne service par click karein.
2. Left menu mein **"Volumes"** par click karein.
3. **"Add Volume"** karein.
4. Mount Path mein: `/app/data` daalein (database save rehne ke liye).
5. Aap chahein toh ek aur volume `/app/public/uploads` mount kar sakte hain uploaded images ke liye.
*(Note: Agar aap Supabase use karte hain toh volume ki bhi zaroorat nahi hoti, sab cloud mein rehta hai).*

---

### Step 5: Public Domain Generate Karein
1. Service Settings mein jayein -> **"Networking"** section.
2. **"Generate Domain"** button par click karein.
3. Railway aapko ek free HTTPS URL dega (e.g., `deepaura-diwali-decor.up.railway.app`).
4. Custom domain (e.g. `yourbrand.in` ya `.com`) bhi link kar sakte hain!

---

## 🎯 Verification
Deploy hone ke baad:
- Storefront check karein: `https://<your-railway-domain>.up.railway.app`
- Admin Login check karein: `https://<your-railway-domain>.up.railway.app/admin/login`
