# Ashly Store - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites

1. GitHub account ✅
2. Vercel account (sign up at vercel.com)
3. MongoDB Atlas database ✅

### Important Notes for Vercel

⚠️ **Vercel Limitations:**

1. **Read-only filesystem** - File uploads won't persist
2. **Serverless functions** - Each request is a separate execution
3. **Cold starts** - First request may be slower

### Step-by-Step Deployment

#### 1. Push to GitHub ✅

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### 2. Deploy on Vercel

**Go to Vercel Dashboard:**

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project" or "Import Project"
3. Import your GitHub repository: `Amr3011/Ashri`
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

#### 3. Add Environment Variables

**CRITICAL STEP** - Add these environment variables in Vercel:

```
MONGODB_URI=mongodb+srv://amrosama376_db_user:UyzNhy5kqbmqGnIK@cluster0.l6vluv6.mongodb.net/ashly-store
NODE_ENV=production
```

**How to add:**

1. In Vercel dashboard → Your Project → Settings
2. Click "Environment Variables"
3. Add each variable:
   - Name: `MONGODB_URI`
   - Value: (paste connection string)
   - Environment: Production, Preview, Development (select all)
4. Repeat for `NODE_ENV`

#### 4. MongoDB Atlas Network Access

**IMPORTANT:** Configure MongoDB to allow Vercel connections:

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Or add Vercel IPs specifically
6. Click "Confirm"

#### 5. Deploy & Test

1. Click "Deploy" in Vercel
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://ashri-xxxxx.vercel.app`

**Test your API:**

```bash
# Root endpoint
curl https://YOUR_VERCEL_URL/

# Health check
curl https://YOUR_VERCEL_URL/api/health

# Get products
curl https://YOUR_VERCEL_URL/api/products
```

---

## 🐛 Troubleshooting

### Error: FUNCTION_INVOCATION_FAILED

**Fixed Issues:**

- ✅ Removed file system operations in production
- ✅ Added MongoDB connection timeout
- ✅ Proper serverless function structure
- ✅ Error handling for database connection

### Error: MongoDB Connection Timeout

**Solution:**

1. Check MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` to IP whitelist
3. Verify `MONGODB_URI` in Vercel environment variables
4. Check connection string format

### Error: Cannot read property 'xyz' of undefined

**Solution:**

- Check Vercel Function Logs
- Look for specific error in logs
- Verify all environment variables are set

### Where to Check Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment
5. Click "Functions" tab
6. View real-time logs

---

## 📝 File Upload Limitations

⚠️ **Critical:** Vercel has a **read-only filesystem**. Uploaded images will NOT persist.

**Solutions:**

### Option 1: Cloudinary (Recommended)

```bash
npm install cloudinary multer-storage-cloudinary
```

### Option 2: AWS S3

```bash
npm install @aws-sdk/client-s3 multer-s3
```

### Option 3: Vercel Blob Storage

```bash
npm install @vercel/blob
```

For now, you can test API without images or use external image URLs.

---

## 🔄 Automatic Deployments

Vercel auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically redeploys! 🚀
```

---

## 📊 Monitoring

**Check Performance:**

1. Vercel Dashboard → Your Project
2. View "Analytics" tab
3. Monitor function execution time
4. Check error rates

**View Logs:**

1. Deployments → Latest deployment
2. Functions → View Function Logs
3. Filter by errors or time range

---

## 🌐 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `api.ashly-store.com`)
3. Configure DNS records as instructed:
   ```
   Type: CNAME
   Name: api
   Value: cname.vercel-dns.com
   ```
4. Wait for SSL certificate (automatic, ~1 hour)

---

## ✅ Final Checklist

- [x] Project structure fixed for serverless
- [x] `api/index.js` created (serverless entry point)
- [x] `vercel.json` updated
- [x] Database connection handles production mode
- [x] File system operations disabled in production
- [x] Code pushed to GitHub
- [ ] Environment variables added in Vercel
- [ ] MongoDB Network Access configured (0.0.0.0/0)
- [ ] Redeploy in Vercel (after adding env vars)
- [ ] All endpoints tested
- [ ] (Optional) Cloudinary for images
- [ ] (Optional) Custom domain

---

## 🎯 Quick Summary of Fixes

**What was wrong:**

1. ❌ File system operations (`fs.mkdirSync`) - crashed on Vercel
2. ❌ Wrong serverless structure - needed `api/index.js`
3. ❌ Database connection without timeout
4. ❌ `process.exit()` in production - kills serverless function

**What we fixed:**

1. ✅ Disabled file operations in production
2. ✅ Created proper serverless entry point (`api/index.js`)
3. ✅ Added connection timeout and error handling
4. ✅ Prevented `process.exit()` in production

---

**🎉 Your API should work now!**

**Next Steps:**

1. ✅ Code is already pushed to GitHub
2. Go to Vercel Dashboard
3. **Redeploy** your project (it will auto-deploy from GitHub)
4. Make sure environment variables are set (`MONGODB_URI`, `NODE_ENV`)
5. Configure MongoDB Network Access (0.0.0.0/0)
6. Test the endpoints

**The deployment will auto-trigger now that code is pushed!** 🚀
