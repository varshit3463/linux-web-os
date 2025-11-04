# 🚀 Deployment Guide - Linux Web OS

## 📦 What You Have with GitHub Student Developer Pack

### Free Hosting Services (from Student Pack):
1. **Vercel** - Free hosting + custom domain
2. **Netlify** - Free hosting + custom domain  
3. **Heroku** - Free dyno hours (limited)
4. **DigitalOcean** - $200 credit for 1 year
5. **Namecheap** - Free .me domain for 1 year
6. **Name.com** - Free domain for 1 year

---

## 🎯 Recommended Architecture

Since your app has 3 parts:
1. **Frontend** (Svelte - `npm run dev`)
2. **Backend** (Express - `npm start`)
3. **Firefox Docker** (for Firefox launcher)

### Best Solution: Split Deployment

```
┌─────────────────────────────────────────────┐
│  Frontend (Vercel/Netlify)                  │
│  https://linux-web-os.vercel.app            │
│  or your-custom-domain.me                   │
└─────────────────┬───────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────┐
│  Backend API (Railway/Render)               │
│  https://your-api.railway.app               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Docker Firefox (DigitalOcean Droplet)      │
│  Optional - for Firefox launcher feature    │
└─────────────────────────────────────────────┘
```

---

## 🔥 Option 1: Quick Start (Recommended)

### Frontend: Vercel (Free + Fast)
### Backend: Railway (Free tier)

---

## 📝 Step-by-Step Deployment

### Part 1: Deploy Backend to Railway

1. **Sign up for Railway** (free with GitHub):
   - Go to: https://railway.app
   - Sign in with GitHub
   - Apply GitHub Student Pack for $5/month credit

2. **Create New Project**:
   ```
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: varshit3463/linux-web-os
   ```

3. **Configure Backend Service**:
   ```
   Root Directory: /server
   Build Command: (leave empty)
   Start Command: node server.js
   ```

4. **Add Environment Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   ```

5. **Get your Backend URL**:
   ```
   Example: https://linux-web-os-production.up.railway.app
   ```

---

### Part 2: Configure Frontend for Production

First, let's update the frontend to use environment variables for the API URL:

**Create `.env` file in root:**
```env
VITE_API_URL=http://localhost:3001
```

**Create `.env.production` file in root:**
```env
VITE_API_URL=https://your-backend-url.railway.app
```

**Update API calls in your code** to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

---

### Part 3: Deploy Frontend to Vercel

1. **Install Vercel CLI**:
   ```powershell
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```powershell
   vercel login
   ```

3. **Deploy**:
   ```powershell
   vercel
   ```

4. **Set Production Environment Variable**:
   ```powershell
   vercel env add VITE_API_URL production
   # Enter your Railway backend URL
   ```

5. **Deploy to Production**:
   ```powershell
   vercel --prod
   ```

---

## 🔧 Alternative: All-in-One Deployment

### Option A: DigitalOcean Droplet (Full Control)

**Included in Student Pack**: $200 credit (1 year)

**Setup VPS with Docker:**

```bash
# 1. Create Droplet (Ubuntu 22.04)
# 2. SSH into droplet
# 3. Install Docker & Docker Compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone https://github.com/varshit3463/linux-web-os.git
cd linux-web-os

# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Install PM2 for process management
sudo npm i -g pm2

# Start backend
cd server
pm2 start server.js --name backend

# Serve frontend with nginx
sudo apt install nginx
# Configure nginx to serve dist/ folder
```

---

### Option B: Docker Compose (All Services)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001

  firefox:
    image: jlesage/firefox
    ports:
      - "5800:5800"
    environment:
      - DISPLAY_WIDTH=1920
      - DISPLAY_HEIGHT=1080
```

---

## 🌐 Custom Domain Setup (Free from Student Pack)

### Get Free Domain:

1. **Namecheap** (from Student Pack):
   - Get free .me domain for 1 year
   - Example: `varshith-linux.me`

2. **Configure DNS**:
   ```
   # Point to Vercel
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com

   # Point backend subdomain to Railway
   CNAME: api → your-app.railway.app
   ```

3. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add: `varshith-linux.me`
   - Vercel will auto-configure SSL

---

## 📋 Configuration Files Needed

### 1. Create `Dockerfile.frontend` (root):

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Create `nginx.conf` (root):

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001
CMD ["node", "server.js"]
```

### 4. Update `vercel.json` (root):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "svelte",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
```

---

## 🎯 Quick Start Commands

### Deploy Backend to Railway:
```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
cd server
railway up
```

### Deploy Frontend to Vercel:
```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Start):
- **Frontend (Vercel)**: Free forever
  - 100GB bandwidth/month
  - Unlimited websites
  - SSL included
  
- **Backend (Railway)**: $5/month credit (Student Pack)
  - 500 hours/month
  - 512MB RAM
  - 1GB storage

- **Domain (Namecheap)**: Free .me for 1 year
  - Then ~$20/year

**Total Cost**: $0 for first year with Student Pack! 🎉

---

## 🐳 Docker Firefox Setup (Optional)

If you want to keep Firefox launcher working:

### On DigitalOcean Droplet ($6/month, covered by $200 credit):

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Run Firefox container
docker run -d \
  --name=firefox \
  -p 5800:5800 \
  -e DISPLAY_WIDTH=1920 \
  -e DISPLAY_HEIGHT=1080 \
  jlesage/firefox

# Access at: http://your-droplet-ip:5800
```

Then update your frontend to point to this URL.

---

## 🔒 Environment Variables Summary

### Frontend (.env.production):
```env
VITE_API_URL=https://your-backend.railway.app
```

### Backend (Railway):
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## 📊 Monitoring & Logs

### Railway:
- Built-in logs viewer
- Metrics dashboard
- Auto-deploy on git push

### Vercel:
- Real-time logs
- Analytics
- Performance insights

---

## 🚀 CI/CD Setup (Auto-deploy on push)

Both Vercel and Railway support auto-deployment:

1. **Connect GitHub repo**
2. **Every push to master auto-deploys**
3. **Preview deployments for PRs**

---

## 📱 Next Steps

1. **Deploy backend to Railway** → Get API URL
2. **Update frontend .env.production** with API URL
3. **Deploy frontend to Vercel** → Get website URL
4. **Get free domain from Namecheap** (Student Pack)
5. **Configure custom domain** in Vercel
6. **(Optional) Set up DigitalOcean droplet** for Firefox

---

## 🎓 Student Pack Resources

Claim these from: https://education.github.com/pack

- ✅ Vercel Pro (12 months free)
- ✅ Railway ($5/month credit)
- ✅ DigitalOcean ($200 credit)
- ✅ Namecheap (.me domain free 1 year)
- ✅ MongoDB Atlas (free clusters)
- ✅ Heroku (free dyno hours)

---

**Ready to deploy? Let me know which option you want to proceed with!** 🚀
