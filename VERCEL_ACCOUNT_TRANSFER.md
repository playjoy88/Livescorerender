# Transferring Your Project to a Different Vercel Account

If you need to transfer your Playjoy LiveScore project to a different Vercel account, there are several approaches you can take. Here's a comprehensive guide on how to do this:

## Option 1: Using Git Repository Transfer (Recommended)

If your project is connected to a Git repository (GitHub, GitLab, Bitbucket), this is the easiest method:

1. **Log in to the new Vercel account** you want to use
2. **Import the same Git repository** into this new account:
   - Go to the Vercel dashboard
   - Click "Add New" → "Project"
   - Select your Git provider and find your repository
   - Configure the project settings (similar to your original setup)
   - Deploy the project

This creates a new deployment under the new account while keeping your codebase intact.

## Option 2: Remove and Reconnect Locally

1. **Remove the current Vercel connection**:
   ```bash
   cd playjoy-livescore
   rm -rf .vercel
   ```

2. **Log out from the current Vercel account**:
   ```bash
   npx vercel logout
   ```

3. **Log in to the new Vercel account**:
   ```bash
   npx vercel login
   ```

4. **Re-deploy to the new account**:
   ```bash
   npx vercel
   ```
   
5. **Follow the setup prompts** to configure your project settings

## Option 3: Transfer Team Ownership (For Team Plans)

If you're using Vercel Teams:

1. **Create a team** in the new account (if not already done)
2. **Invite the new account** to your current team:
   - Go to "Team Settings" → "Members"
   - Add the email address associated with the new account
   - Set role to "Owner"
   
3. **Accept the invitation** from the new account
4. **Remove the old account** from the team once the transfer is complete

## Option 4: Clone and Redeploy

If you need a clean start:

1. **Clone your repository** to a new location:
   ```bash
   git clone https://github.com/YOUR_USERNAME/playjoy-livescore.git playjoy-livescore-new
   cd playjoy-livescore-new
   ```

2. **Log in to the new Vercel account**:
   ```bash
   npx vercel login
   ```

3. **Deploy to the new account**:
   ```bash
   npx vercel
   ```

## Important Considerations When Transferring Accounts

1. **Custom Domains**: You'll need to reconfigure any custom domains on the new project
2. **Environment Variables**: Make sure to set up all environment variables in the new project
3. **Deployment History**: Deployment history won't transfer to the new account
4. **Team Members**: If using teams, you'll need to re-invite team members

## Changing the Project Owner in the Same Account

If you just want to change which team owns the project within the same account:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" → "General"
3. Under "Project Owner", click "Change"
4. Select the new team or account
5. Confirm the transfer

## After the Transfer

After transferring your project to a new account, make sure to:

1. Verify that all environment variables are correctly set up
2. Reconfigure any integrations or webhooks
3. Update any deployment scripts to use the new project URL
4. Test that the site is functioning correctly

If you encounter any issues during the transfer, Vercel's support team can assist with more complex account migration needs.
