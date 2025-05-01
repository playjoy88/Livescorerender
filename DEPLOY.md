# Deploying Playjoy Livescore to Vercel

This guide will walk you through the process of deploying the Playjoy Livescore application to Vercel.

## Prerequisites

1. A Vercel account - [Sign up here](https://vercel.com/signup) if you don't have one
2. Git installed on your computer
3. Node.js installed on your computer

## Deployment Steps

### 1. Install Vercel CLI (Optional)

While you can deploy directly through the Vercel website, the CLI offers more flexibility.

```bash
npm install -g vercel
```

### 2. Login to Vercel (if using CLI)

```bash
vercel login
```

### 3. Prepare Your Project

Make sure your project has all the necessary configuration:

- The `.env.local` file is set up correctly (but will not be deployed - you'll set these variables in Vercel)
- The `next.config.ts` file is configured properly
- All changes are committed to your repository

### 4. Deploy to Vercel

#### Option 1: Using Vercel CLI

Navigate to your project directory and run:

```bash
cd playjoy-livescore
vercel
```

Follow the prompts to complete the deployment.

#### Option 2: Using Vercel Dashboard (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Import your repository
5. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: `playjoy-livescore` (if your project is in a subdirectory)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

6. Click "Deploy"

### 5. Configure Environment Variables

After the initial deployment, you need to set up environment variables:

1. Go to your project in the Vercel Dashboard
2. Click on "Settings" > "Environment Variables"
3. Add the following variables:
   - `NEXT_PUBLIC_API_URL`: `https://api-football-v1.p.rapidapi.com/v3`
   - `NEXT_PUBLIC_API_KEY`: Your RapidAPI key
   - `NEXT_PUBLIC_API_HOST`: `api-football-v1.p.rapidapi.com`

4. Choose the appropriate environments (Production, Preview, Development)
5. Click "Save"
6. Redeploy your application for the environment variables to take effect

### 6. Custom Domain (Optional)

To add a custom domain to your Vercel project:

1. Go to your project in the Vercel Dashboard
2. Click on "Settings" > "Domains"
3. Enter your domain name
4. Follow the instructions to configure DNS settings

### 7. Authorization for api-football Domain

The RapidAPI Football API requires you to authorize the domains that will access the API. To do this:

1. Go to the [RapidAPI Dashboard](https://rapidapi.com/dashboard)
2. Find and click on the Football API subscription
3. Navigate to Security/Settings
4. Add your Vercel deployment URL (e.g., `yourproject.vercel.app`) to the list of authorized domains
5. If you're using a custom domain, add that as well

## Troubleshooting

- **CORS Issues**: Check the headers configuration in `next.config.ts`
- **API Not Working**: Verify your API key and host in the environment variables
- **Build Errors**: Check the build logs in the Vercel dashboard for detailed error information

## Vercel Features to Consider

- **Preview Deployments**: Each pull request gets its own deployment for testing
- **Analytics**: Enable Vercel Analytics to track performance and usage
- **Edge Functions**: Consider using Vercel Edge Functions for improved performance
- **Teams**: Invite team members to collaborate on your project

For more information about Vercel deployment options, refer to the [Vercel Documentation](https://vercel.com/docs).
