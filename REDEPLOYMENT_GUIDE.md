# Redeployment Guide for Vercel

This guide explains how to redeploy your application to Vercel after making changes and how automatic deployments work.

## How Vercel Handles Updates

Vercel uses a **Git-based deployment model**, which means it's connected to your GitHub repository and watches for changes.

### Automatic Deployments

When you've connected your GitHub repository to Vercel, the process works like this:

1. You make changes to your code locally
2. You commit those changes to your local Git repository
3. You push those commits to GitHub
4. Vercel automatically detects the new commits
5. Vercel automatically builds and deploys your updated application

This means you **don't need to manually redeploy** every time you make changes. The process is automatic as long as you push your changes to GitHub.

## How to Deploy Again Manually

If you need to manually trigger a new deployment (for example, if you've changed environment variables or want to redeploy without code changes), you have several options:

### Option 1: Using the Vercel Dashboard

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the "Deployments" tab
3. Click the "Redeploy" button on your latest deployment
4. Optionally, you can select "Redeploy with existing build cache" if you want to speed up the process

### Option 2: Using the Vercel CLI

If you've installed the Vercel CLI (which is included in your devDependencies), you can redeploy directly from your command line:

```bash
# Navigate to your project directory
cd playjoy-livescore

# Run the deploy command
npm run deploy

# For production deployments
npm run deploy:prod
```

## Updating Your Application

### Workflow for Making Changes

1. **Make changes locally**:
   ```bash
   # Edit your files in your code editor
   ```

2. **Test your changes locally**:
   ```bash
   npm run dev
   ```

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

4. **Push to GitHub**:
   ```bash
   git push
   ```

5. **Vercel automatically deploys** your changes (no additional action required)

6. **Check deployment status** in the Vercel dashboard

### Important Notes

- **Branch Deployments**: By default, Vercel deploys your `main` branch to your production environment. Other branches will create "Preview Deployments" that don't affect your production site.

- **Environment Variables**: Changes to environment variables require a new deployment. These don't automatically trigger deployments, so you'll need to manually redeploy after changing them in the Vercel dashboard.

- **Build Cache**: Vercel caches build artifacts to speed up deployments. If you're experiencing issues, you might want to clear the cache by selecting "Redeploy without cache" in the dashboard.

## Monitoring Deployments

You can monitor the status of your deployments in several ways:

1. **Vercel Dashboard**: The most comprehensive view, showing build logs, deployment status, and preview URLs

2. **GitHub Integration**: If you've set up the GitHub integration, you'll see deployment statuses directly on your pull requests and commits

3. **Email Notifications**: Vercel can send email notifications for failed deployments

## Rollbacks

If a deployment introduces issues, you can easily roll back to a previous version:

1. Go to your project in the Vercel Dashboard
2. Click on the "Deployments" tab
3. Find the previous working deployment
4. Click the three-dot menu on that deployment
5. Select "Promote to Production"

This will instantly revert your production site to the previous version without needing to change your code.

## Continuous Deployment vs. Manual Updates

- **Continuous Deployment** (recommended): Push to GitHub → Automatic deployment
  - Pros: Seamless workflow, version control, automatic
  - Cons: Each deployment takes a few minutes to build

- **Manual Deployment**: Make changes → Run `npm run deploy`
  - Pros: More control over when deployments happen
  - Cons: Extra steps, potential for human error

For most projects, the continuous deployment workflow (pushing to GitHub) is recommended as it maintains a clear history of changes and ensures your deployed code always matches your repository.
