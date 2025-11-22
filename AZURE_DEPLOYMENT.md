# Azure App Service Deployment Guide

This guide will help you deploy the Scrum Poker application to Azure App Service with Socket.IO support.

## Prerequisites

1. Azure subscription with access to Azure App Service
2. Azure CLI installed locally
3. Git repository set up
4. Node.js 18+ installed locally

## Deployment Steps

### 1. Create Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name scrum-poker-rg --location "East US"

# Create App Service plan (B1 or higher required for WebSocket support)
az appservice plan create --name scrum-poker-plan --resource-group scrum-poker-rg --sku B1 --is-linux

# Create App Service
az webapp create --resource-group scrum-poker-rg --plan scrum-poker-plan --name your-scrum-poker-app --runtime "NODE:18-lts" --deployment-local-git
```

### 2. Configure App Service Settings

```bash
# Enable WebSocket support (required for Socket.IO)
az webapp config set --resource-group scrum-poker-rg --name your-scrum-poker-app --web-sockets-enabled true

# Set Node.js version
az webapp config appsettings set --resource-group scrum-poker-rg --name your-scrum-poker-app --settings WEBSITE_NODE_DEFAULT_VERSION=18.17.0

# Set production environment
az webapp config appsettings set --resource-group scrum-poker-rg --name your-scrum-poker-app --settings NODE_ENV=production

# Configure startup command to use the azure-package.json
az webapp config set --resource-group scrum-poker-rg --name your-scrum-poker-app --startup-file "npm start"

# Set the main package.json file for Azure
az webapp config appsettings set --resource-group scrum-poker-rg --name your-scrum-poker-app --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### 3. Deploy Application

#### Option A: Git Deployment (Recommended)

```bash
# Get deployment URL
az webapp deployment source config-local-git --resource-group scrum-poker-rg --name your-scrum-poker-app --query url --output tsv

# Add Azure remote
git remote add azure <deployment-url>

# Deploy
git push azure main
```

#### Option B: ZIP Deployment

```bash
# Create deployment package (exclude unnecessary files)
zip -r scrum-poker-app.zip . -x "node_modules/*" "*.git*" "*.vscode*" ".claude/*" "dist/*"

# Deploy using Azure CLI
az webapp deployment source config-zip --resource-group scrum-poker-rg --name your-scrum-poker-app --src scrum-poker-app.zip
```

### 4. Update Server Configuration

**IMPORTANT**: Before deployment, update the CORS configuration in your server to use your actual Azure domain:

```javascript
// In server/server.js - replace 'your-domain.azurewebsites.net' with your actual Azure App Service name
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-scrum-poker-app.azurewebsites.net'] // Replace with your actual domain
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
          ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

### 5. Client Configuration

The client is already configured to automatically use the correct URL in production:

```typescript
// src/hooks/useSocket.ts (already configured correctly)
const serverUrl =
  process.env.NODE_ENV === 'production'
    ? window.location.origin // Automatically uses the Azure domain
    : 'http://localhost:8080';
```

### 6. Test Deployment

Visit your application at: `https://your-scrum-poker-app.azurewebsites.net`

## Deployment Process

Azure will automatically:

1. **Build Frontend**: Run `npm install` and `npm run build` (via azure-package.json)
2. **Install Server Dependencies**: Install production dependencies in server/ directory
3. **Start Application**: Run `npm start` which starts the server
4. **Serve Static Files**: Express serves the built React app from dist/ directory

## Project Structure

```
scrum-poker/
├── server/                 # Backend Node.js/Express/Socket.IO server
│   ├── package.json       # Server dependencies
│   └── server.js          # Main server file (serves API + static files)
├── src/                   # Frontend React application source
├── dist/                  # Built frontend (created by Vite during deployment)
├── package.json           # Frontend build dependencies
├── azure-package.json     # Azure deployment configuration
├── vite.config.ts         # Vite build configuration
├── .deployment           # Azure deployment settings
├── deploy.sh             # Custom deployment script (optional)
└── AZURE_DEPLOYMENT.md   # This guide
```

## Environment Variables

Set these in Azure App Service Configuration:

- `NODE_ENV=production`
- `PORT` (automatically set by Azure)
- Any other environment variables your app needs

## Troubleshooting

### Common Issues:

1. **WebSocket Connection Failures**
   - Ensure WebSocket support is enabled: `az webapp config set --web-sockets-enabled true`
   - Verify you're using B1 tier or higher (Free tier doesn't support WebSockets)
   - Check that CORS configuration in server.js matches your Azure domain

2. **Build Failures**
   - Check deployment logs in Azure Portal → Deployment Center → Logs
   - Ensure Node.js version is correct (18+)
   - Verify all dependencies are listed in package.json

3. **Socket.IO Connection Issues**
   - Check browser developer console for connection errors
   - Verify server CORS settings include your Azure domain
   - Ensure NODE_ENV=production is set in Azure App Service configuration

4. **Static Files Not Loading**
   - Verify the build process creates dist/ directory
   - Check that server.js serves static files from correct path
   - Ensure vite.config.ts is configured properly

### Deployment Logs

Check deployment status:

```bash
# Stream deployment logs
az webapp log tail --resource-group scrum-poker-rg --name your-scrum-poker-app

# Get deployment status
az webapp deployment list --resource-group scrum-poker-rg --name your-scrum-poker-app
```

## Socket.IO Configuration

The server is configured to:

- Accept connections from the production domain
- Support both WebSocket and polling transports
- Handle room-based communication
- Manage user connections and disconnections

## Features Included

- ✅ URL-based room routing (e.g., `/ABC123`)
- ✅ Auto-rejoin functionality with localStorage
- ✅ Real-time updates via Socket.IO
- ✅ Room management (create/join)
- ✅ Voting system
- ✅ Emoji reactions
- ✅ User connection status
- ✅ Responsive design

## Next Steps

1. Replace placeholder URLs with your actual Azure App Service domain
2. Set up custom domain (optional)
3. Configure SSL certificate (automatic with azurewebsites.net)
4. Set up monitoring and logging
5. Consider using Azure Application Insights for monitoring
