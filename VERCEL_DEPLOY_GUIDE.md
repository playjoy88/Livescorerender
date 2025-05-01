# Step-by-Step Vercel Deployment Guide

This detailed guide walks you through deploying your Playjoy LiveScore application to Vercel via GitHub integration.

## 1. Prepare Your GitHub Repository

### If your code is not yet on GitHub:

1. **Create a new GitHub repository**:
   - Go to [GitHub](https://github.com) and sign in
   - Click the "+" icon in the top-right corner and select "New repository"
   - Name your repository (e.g., "playjoy-livescore")
   - Choose Public or Private visibility
   - Click "Create repository"

2. **Initialize your local repository and push your code**:
   ```bash
   # Navigate to your project folder
   cd c:/Users/PLANT44/Documents/LiveScore-vercel/playjoy-livescore
   
   # Initialize git (if not already done)
   git init
   
   # Add all files to git
   git add .
   
   # Create your first commit
   git commit -m "Initial commit"
   
   # Add the GitHub repository as remote origin
   git remote add origin https://github.com/YOUR_USERNAME/playjoy-livescore.git
   
   # Push your code to GitHub
   git push -u origin main
   ```

### If your code is already on GitHub:
   
1. **Update your repository with the latest changes**:
   ```bash
   # Add the changes
   git add .
   
   # Commit the changes
   git commit -m "Update for Vercel deployment"
   
   # Push the changes
   git push
   ```

## 2. Deploy to Vercel

1. **Create a Vercel account**:
   - Go to [Vercel](https://vercel.com) and sign up if you don't have an account
   - You can sign up with your GitHub account for easier integration

2. **Create a new project in Vercel**:
   - After logging in, you'll see the Vercel dashboard
   - Click the "Add New..." button and select "Project"

3. **Import your GitHub repository**:
   - Vercel will show a list of your GitHub repositories
   - Find and select the "playjoy-livescore" repository
   - If you don't see it, you may need to configure GitHub permissions for Vercel

4. **Configure your project settings**:
   - **Framework Preset**: Select "Next.js" (Vercel should auto-detect this)
   - **Root Directory**: Leave as default (or if your project is in a subfolder, specify it)
   - **Build Command**: The default `next build` is correct
   - **Output Directory**: The default `.next` is correct

5. **Environment Variables**:
   - Expand the "Environment Variables" section
   - Add the following variables:
     
     | Name | Value |
     |------|-------|
     | `NEXT_PUBLIC_API_URL` | `https://api-football-v1.p.rapidapi.com/v3` |
     | `NEXT_PUBLIC_API_KEY` | `[Your RapidAPI Key]` |
     | `NEXT_PUBLIC_API_HOST` | `api-football-v1.p.rapidapi.com` |
   
   - Make sure to toggle on all environments: Production, Preview, and Development

6. **Click "Deploy" to start the deployment process**:
   - Vercel will clone your repository, install dependencies, build the project, and deploy it
   - You'll see a progress indicator during the build and deployment

7. **When deployment is complete**:
   - You'll see a success message and a preview of your site
   - Your site will be available at a URL like `playjoy-livescore-xxxx.vercel.app`
   - You can click the "Visit" button to open your site

## 3. Set Up a Custom Domain (Optional)

1. **Go to your project dashboard**:
   - From the Vercel dashboard, click on your project

2. **Add a custom domain**:
   - Click on the "Domains" tab
   - Enter your domain name (e.g., `livescore.yourwebsite.com`)
   - Click "Add"

3. **Configure DNS settings**:
   - Follow Vercel's instructions to configure your DNS
   - This typically involves adding CNAME or A records to your domain's DNS settings

## 4. Authorize Your Domain with RapidAPI

1. **Go to the RapidAPI dashboard**:
   - Log in to [RapidAPI](https://rapidapi.com/hub)
   - Navigate to your API-Football subscription

2. **Add your domain to the authorized domains list**:
   - Find the security settings for the API
   - Add your Vercel domain (e.g., `playjoy-livescore-xxxx.vercel.app`)
   - If you're using a custom domain, add that as well
   - Save your changes

## 5. Post-Deployment Verification

1. **Test your live application**:
   - Navigate to your deployed application URL
   - Verify that the API data is loading correctly
   - Test the key features of your application

2. **Monitor the application logs**:
   - Go to your project in the Vercel dashboard
   - Click on the "Runtime Logs" tab to view application logs
   - Check for any errors or issues

## 6. Setting Up Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Every time you push changes to your repository, Vercel will:

1. Detect the changes
2. Build a new version of your application
3. Deploy it to a preview URL (for non-main branches)
4. Deploy it to production (for the main branch)

To update your application, simply push your changes to GitHub:

```bash
git add .
git commit -m "Your update description"
git push
```

## 7. Team Collaboration

To collaborate with your team on Vercel:

1. Go to your Vercel account settings
2. Click on "Teams"
3. Create a new team or manage an existing one
4. Invite team members by email
5. Assign roles and permissions

Team members can then help manage deployments, environment variables, and other settings.

---

This deployment process ensures that your Playjoy LiveScore application is securely hosted on Vercel, with proper environment configuration for the API-Football service, and set up for easy updates and maintenance.
