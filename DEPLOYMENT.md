# Deployment Guide: INAD Analysis Dashboard

This guide explains how to deploy the INAD Analysis Dashboard to **Streamlit Community Cloud** for secure, cloud-based access.

## 📋 Prerequisites

1. **GitHub Account** ✅ (You already have this)
2. **Streamlit Community Cloud Account** (Free - linked to GitHub)
3. **Private GitHub Repository** (for data security)

---

## 🚀 Deployment Steps

### Step 1: Create a Private GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **"+"** icon in the top-right → **"New repository"**
3. Repository settings:
   - **Name**: `inad-analysis` (or your preferred name)
   - **Visibility**: ⚠️ **Private** (IMPORTANT for data security)
   - **Initialize**: Don't add README, .gitignore, or license (we already have files)
4. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

Open a terminal in your project directory and run:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: INAD Analysis Dashboard"

# Add your GitHub repository as remote (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/inad-analysis.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace** `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Sign Up for Streamlit Community Cloud

1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Click **"Sign up"** or **"Continue with GitHub"**
3. Authorize Streamlit to access your GitHub account
4. Grant access to your **private repositories** when prompted

### Step 4: Deploy Your App

1. Once logged into Streamlit Cloud, click **"New app"**
2. Fill in the deployment settings:
   - **Repository**: Select `YOUR_USERNAME/inad-analysis`
   - **Branch**: `main`
   - **Main file path**: `dashboard.py`
   - **App URL**: Choose a custom URL (e.g., `inad-analysis-casa`)

3. Click **"Deploy!"**

4. Streamlit will:
   - Install dependencies from `requirements.txt`
   - Start your dashboard
   - Provide a URL like: `https://inad-analysis-casa.streamlit.app`

⏱️ **First deployment takes 2-5 minutes**

---

## 🔐 Access Control

### Who Can View the Dashboard?

Since your GitHub repository is **private**, you control access through Streamlit Cloud settings:

1. In Streamlit Cloud, go to your app
2. Click **"Settings"** → **"Sharing"**
3. Options:
   - **Private** (default): Only you can view
   - **Invite specific users**: Add email addresses of legal team members
   - **Public**: Anyone with the URL can view (⚠️ NOT recommended for sensitive data)

**Recommended**: Keep it **private** and invite only trusted team members via email.

---

## 📁 Data Upload Workflow

### Option 1: Upload Files via Dashboard (Recommended)

1. Open your deployed dashboard
2. In the sidebar, select **"Upload Files"**
3. Upload new **INAD Tabelle** (.xlsm) and **BAZL-Daten** (.xlsx) files
4. Analysis runs automatically with the new data

**Advantages:**
- No need to commit data to GitHub
- Easy for non-technical users
- Better for sensitive data (files stay in memory/temp storage)

### Option 2: Store Files in GitHub Repository

1. Add your data files to the repository:
   ```bash
   cp "path/to/INAD Tabelle .xlsm" .
   cp "path/to/BAZL-Daten.xlsx" .
   git add "INAD Tabelle .xlsm" "BAZL-Daten.xlsx"
   git commit -m "Add data files"
   git push
   ```

2. In dashboard sidebar, select **"Use Server Files"**
3. Files are automatically detected

**⚠️ Warning**: Data files will be stored in your private repository. Ensure you're comfortable with this.

---

## 🔄 Updating the Dashboard

### Update Code Only

When you make changes to the code:

```bash
git add .
git commit -m "Description of changes"
git push
```

Streamlit Cloud will **automatically redeploy** within 1-2 minutes.

### Update Data Only

**If using file upload**: Simply upload new files through the dashboard interface.

**If using server files**:
```bash
# Replace old data files with new ones
cp "new/INAD Tabelle .xlsm" .
cp "new/BAZL-Daten.xlsx" .

git add "INAD Tabelle .xlsm" "BAZL-Daten.xlsx"
git commit -m "Update data for [semester]"
git push
```

---

## 🛠️ Troubleshooting

### App Won't Start

**Check logs** in Streamlit Cloud:
1. Go to your app's page
2. Click **"Manage app"** → **"Logs"**
3. Look for error messages

Common issues:
- **Missing dependencies**: Check `requirements.txt`
- **File not found**: Ensure `dashboard.py` is in the root directory
- **Import errors**: Make sure `inad_analysis.py` is in the repository

### File Upload Size Limit

The current limit is **200 MB** per file (set in `.streamlit/config.toml`).

If your files are larger:
1. Edit `.streamlit/config.toml`
2. Change `maxUploadSize = 200` to a higher value (e.g., `500`)
3. Commit and push

### App Runs Slowly

Streamlit Community Cloud has resource limits. If analysis is slow:
- Use smaller date ranges
- Consider upgrading to Streamlit Cloud Teams (paid)
- Or deploy to a different platform (Heroku, AWS, etc.)

### Access Issues

If team members can't access:
1. Verify repository is **private**
2. Check Streamlit Cloud **Sharing** settings
3. Ensure invites were sent to correct email addresses
4. Team members need Streamlit accounts (free)

---

## 🔒 Security Best Practices

1. ✅ **Keep repository private**
2. ✅ **Use file upload** instead of committing sensitive data
3. ✅ **Invite only trusted users** to the dashboard
4. ✅ **Regularly review access** in Streamlit Cloud settings
5. ⚠️ **Never commit passwords or API keys** (use Streamlit secrets if needed)

---

## 📞 Getting Help

### Streamlit Documentation
- [Deployment Guide](https://docs.streamlit.io/streamlit-community-cloud/get-started)
- [File Upload Widget](https://docs.streamlit.io/library/api-reference/widgets/st.file_uploader)

### Common Commands

```bash
# Check git status
git status

# View deployment URL
# Go to share.streamlit.io → Your apps

# Force reboot app (if stuck)
# In Streamlit Cloud: Manage app → Reboot app
```

---

## 📊 Workflow Summary

### Regular Usage (Every Semester)

1. **Obtain new data files** from INAD/BAZL sources
2. **Open your dashboard** at `https://your-app-url.streamlit.app`
3. **Upload new files** via the sidebar
4. **Select semester** in the dashboard
5. **Review analysis** in the tabs
6. **Export reports** as needed (CSV downloads)

### Code Updates (Occasional)

1. **Make changes** to `dashboard.py` or `inad_analysis.py` locally
2. **Test locally**: `streamlit run dashboard.py`
3. **Commit and push** to GitHub
4. **App auto-redeploys** (check Streamlit Cloud logs)

---

## ✅ Next Steps

After deployment:

1. ⬜ Test file upload with real data
2. ⬜ Invite legal team members
3. ⬜ Bookmark dashboard URL
4. ⬜ Document any custom analysis parameters for your team
5. ⬜ Set up regular data update schedule

---

**Your dashboard is now accessible from anywhere with internet! 🎉**
