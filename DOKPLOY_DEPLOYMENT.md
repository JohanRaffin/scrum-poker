# Dokploy Deployment Guide

This guide will help you deploy the Scrum Poker application to your Dokploy server with Socket.IO support.

## Prerequisites

1. Dokploy server set up and accessible
2. Git repository accessible from Dokploy server
3. Node.js 22+ runtime available in Dokploy
4. Domain or subdomain configured for your application (optional)

## Project Architecture

This is a monorepo containing:

- **Frontend**: React + TypeScript + Vite (builds to `dist/`)
- **Backend**: Node.js + Express + Socket.IO (in `server/`)
- **Deployment**: Backend serves both API and static frontend files

```
scrum-poker/
├── server/                 # Backend Express + Socket.IO server
│   ├── package.json       # Server dependencies
│   └── server.js          # Main server (API + static file serving)
├── src/                   # Frontend React source code
├── dist/                  # Built frontend (created during build)
├── package.json           # Frontend build dependencies
├── vite.config.ts         # Vite build configuration
└── DOKPLOY_DEPLOYMENT.md  # This guide
```

## Deployment Steps

### 1. Create Application in Dokploy

1. Log in to your Dokploy dashboard
2. Create a new **Application**
3. Choose deployment method:
   - **Option A**: Docker (Recommended) - Uses [Dockerfile](Dockerfile)
   - **Option B**: Git/Buildpack - Traditional build approach
4. Connect your Git repository

### 2. Configure Deployment Settings

#### Option A: Docker Deployment (Recommended)

**Dockerfile Path**: `./Dockerfile`

**Port**: `8080`

**Docker Build Args**: None required

The [Dockerfile](Dockerfile) handles:

- Multi-stage build for optimized image size
- Frontend build with Vite
- Backend production dependencies
- Health checks at `/health` endpoint
- Automatic startup

**Advantages**:

- Consistent builds across environments
- Optimized image size with multi-stage build
- Built-in health checks
- No manual build commands needed

#### Option B: Git/Buildpack Deployment

**Build Path**: `.` (root directory)

**Install Command**:

```bash
npm install && cd server && npm install
```

**Build Command**:

```bash
npm run build
```

**Start Command**:

```bash
cd server && npm start
```

**Node Version**: `22` or higher

#### Environment Variables

Add these environment variables in Dokploy:

| Variable   | Value        | Description                                       |
| ---------- | ------------ | ------------------------------------------------- |
| `NODE_ENV` | `production` | Enables production mode                           |
| `PORT`     | `8080`       | Server port (or use Dokploy's auto-assigned port) |

### 3. Configure Network Settings

#### WebSocket Support

**IMPORTANT**: Ensure WebSocket support is enabled in Dokploy for Socket.IO to work properly.

- Enable **WebSocket** support in the application settings
- Socket.IO requires persistent WebSocket connections

#### Port Configuration

- Default application port: `8080`
- The server automatically uses `process.env.PORT` if provided by Dokploy
- Dokploy will handle port mapping and reverse proxy

#### Domain Configuration (Optional)

1. In Dokploy, add your custom domain or subdomain
2. Example: `scrum-poker.yourdomain.com`
3. Dokploy will automatically configure SSL/TLS with Let's Encrypt

### 4. Update Server CORS Configuration

**IMPORTANT**: Before deploying, update the CORS configuration in [server/server.js](server/server.js:14-24) with your Dokploy domain:

```javascript
// In server/server.js - replace with your actual Dokploy domain
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-app.dokploy.example.com'] // Replace with your Dokploy domain
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
          ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Update the Express CORS middleware too (around line 28-40)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-app.dokploy.example.com'] // Replace with your Dokploy domain
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
          ],
    credentials: true,
  })
);
```

**Note**: The frontend automatically uses the same domain in production (configured in [src/hooks/useSocket.ts](src/hooks/useSocket.ts)).

### 5. Deploy Application

1. Commit and push your changes to Git
2. In Dokploy, trigger a deployment:
   - Manual: Click **Deploy** button
   - Automatic: Enable **Auto Deploy** on git push (recommended)
3. Monitor the build logs in Dokploy dashboard

## Deployment Process

When you deploy, the following happens automatically:

1. **Install Dependencies**:
   - Root: `npm install` (frontend build tools)
   - Server: `cd server && npm install` (backend dependencies)

2. **Build Frontend**:
   - Runs `npm run build` which executes `vite build`
   - Creates production-optimized bundle in `dist/`

3. **Start Server**:
   - Runs `cd server && npm start`
   - Express serves API endpoints on `/api/*`
   - Express serves static files from `../dist/`
   - Socket.IO handles WebSocket connections

4. **Reverse Proxy**:
   - Dokploy routes traffic to your application
   - Handles SSL/TLS termination
   - Manages WebSocket upgrades

## Features Verified

- ✅ URL-based room routing (e.g., `/ABC123`)
- ✅ Real-time updates via Socket.IO
- ✅ Room creation and joining
- ✅ Fibonacci voting system
- ✅ Vote anonymization during voting
- ✅ Vote reveal with statistics
- ✅ Flying emoji reactions
- ✅ User connection status tracking
- ✅ Auto-reconnection (10s grace period)
- ✅ Responsive mobile-first design

## Troubleshooting

### WebSocket Connection Failures

**Symptoms**: Real-time updates don't work, Socket.IO connection errors in browser console

**Solutions**:

1. Verify WebSocket support is enabled in Dokploy application settings
2. Check CORS configuration in [server/server.js](server/server.js) matches your domain
3. Ensure you're using HTTPS (not HTTP) in production
4. Check browser console for specific error messages

### Build Failures

**Symptoms**: Deployment fails during build step

**Solutions**:

1. Check Dokploy build logs for specific errors
2. Verify Node.js version is 22 or higher
3. Ensure all dependencies are listed in `package.json` files
4. Try building locally: `npm install && npm run build`

### Static Files Not Loading

**Symptoms**: Blank page or 404 errors for JS/CSS files

**Solutions**:

1. Verify `dist/` directory was created during build
2. Check that [server/server.js](server/server.js:43) serves static files correctly:
   ```javascript
   app.use(express.static(path.join(__dirname, '../dist')));
   ```
3. Verify the build command completed successfully in logs

### Socket.IO Connection Issues

**Symptoms**: "ERR_CONNECTION_REFUSED" or CORS errors in console

**Solutions**:

1. Check server logs in Dokploy dashboard
2. Verify CORS origin matches your deployed domain
3. Ensure `NODE_ENV=production` is set in environment variables
4. Test Socket.IO endpoint directly: `https://your-domain/socket.io/`

### Room Not Found Errors

**Symptoms**: Users can't join rooms after server restart

**Note**: This is expected behavior - the application uses in-memory storage for rooms. When the server restarts, all rooms are cleared.

**Solutions**:

- This is by design for the current implementation
- For persistence, consider adding Redis or database storage (future enhancement)

## Viewing Logs

In Dokploy dashboard:

1. Navigate to your application
2. Go to **Logs** tab
3. View real-time application logs
4. Filter by log level (info, error, etc.)

Key log messages to monitor:

- `Server running on port 8080`
- `Environment: production`
- `Created room: XXXXXX`
- `User joined: ...`
- `User connected: ...`

## Health Checks

Dokploy can monitor application health:

**Endpoint**: `GET /api/room/HEALTH` (returns 404 but confirms server is running)

Better option - Add a dedicated health endpoint to [server/server.js](server/server.js):

```javascript
// Add this near other API routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});
```

## Scaling Considerations

### Current Limitations (In-Memory Storage)

- Rooms are stored in server memory
- Server restarts clear all rooms
- Single-instance only (no horizontal scaling)

### For Production at Scale

Consider implementing:

1. **Redis for Room Storage**
   - Persist rooms across restarts
   - Enable multi-instance deployments
   - Use Redis adapter for Socket.IO

2. **Database for User/History**
   - Store voting history
   - User profiles and preferences
   - Analytics and reporting

3. **Session Management**
   - Redis-backed sessions
   - Persistent user authentication

## Security Recommendations

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Restrict to your specific domain(s)
3. **Rate Limiting**: Add to prevent abuse (use `express-rate-limit`)
4. **Input Validation**: Already implemented (name length, room capacity)
5. **HTTPS Only**: Ensure Dokploy SSL/TLS is configured

## Monitoring

Monitor these metrics in Dokploy:

- CPU usage
- Memory usage
- Active connections
- Request count
- Error rates

## Next Steps

1. ✅ Deploy to Dokploy
2. ✅ Configure custom domain (optional)
3. ✅ Test all features (voting, emojis, reconnection)
4. ✅ Monitor application logs
5. 🔄 Consider Redis for room persistence (optional)
6. 🔄 Set up monitoring/alerts (optional)
7. 🔄 Add analytics tracking (optional)

## Useful Commands

### Local Testing (Production Mode)

```bash
# Build frontend
npm run build

# Start server in production mode
cd server
NODE_ENV=production npm start

# Test at http://localhost:8080
```

### Development Mode

```bash
# Run both frontend and backend
npm run dev:full

# Frontend: http://localhost:5173
# Backend: http://localhost:8080
```

## Support

For issues specific to:

- **Dokploy**: Check Dokploy documentation or community support
- **Application**: Check application logs and this guide
- **Socket.IO**: Verify WebSocket support and CORS configuration

---

**Ready to Deploy!** 🚀

Once deployed, share your room codes and start estimating with your team!
