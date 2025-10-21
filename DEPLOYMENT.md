# 🚀 Deployment Guide - Railway

## Quick Deploy to Railway

### Prerequisites
- Railway account (free tier available)
- GitHub repository
- Railway CLI (optional)

### 1. Prepare for Deployment

#### Server Dockerfile
Create `server/Dockerfile`:

```dockerfile
FROM heroiclabs/nakama:3.21.1

# Copy our TypeScript runtime
COPY build/ /nakama/data/modules/
COPY local.yml /nakama/data/local.yml

# Expose ports
EXPOSE 7349 7350 7351

# Run Nakama
CMD ["/nakama/nakama", "--config", "/nakama/data/local.yml"]
```

#### Update docker-compose for production
Create `server/docker-compose.prod.yml`:

```yaml
version: '3'
services:
  postgres:
    image: postgres:12.2-alpine
    environment:
      - POSTGRES_DB=nakama
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    
  nakama:
    build: .
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgres://postgres:${DATABASE_PASSWORD}@postgres:5432/nakama
    ports:
      - "7349:7349"
      - "7350:7350"
      - "7351:7351"
    restart: unless-stopped

volumes:
  pgdata:
```

### 2. Deploy Server

#### Option A: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Railway**:
   - Visit [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Choose the `server` directory

3. **Configure Environment**:
   ```
   DATABASE_PASSWORD=your_secure_password
   PORT=7350
   ```

4. **Build Configuration**:
   - Build Command: `npm run build`
   - Start Command: `docker-compose -f docker-compose.prod.yml up`

#### Option B: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
cd server
railway init

# Deploy
railway up
```

### 3. Update Client Configuration

Update `client/src/services/NakamaService.ts`:

```typescript
// For production
private readonly host = 'your-app-name.railway.app';
private readonly port = '443';
private readonly useSSL = true;

// Or use environment variables
private readonly host = process.env.EXPO_PUBLIC_NAKAMA_HOST || '127.0.0.1';
private readonly port = process.env.EXPO_PUBLIC_NAKAMA_PORT || '7350';
private readonly useSSL = process.env.EXPO_PUBLIC_USE_SSL === 'true';
```

### 4. Deploy Mobile App

#### Expo Application Services (EAS)

```bash
cd client

# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS/Android
eas build --platform all

# Submit to app stores
eas submit
```

#### Environment Configuration

Create `client/.env`:
```
EXPO_PUBLIC_NAKAMA_HOST=your-app-name.railway.app
EXPO_PUBLIC_NAKAMA_PORT=443
EXPO_PUBLIC_USE_SSL=true
```

### 5. Domain Setup (Optional)

1. **Custom Domain**:
   - In Railway dashboard, go to Settings
   - Add custom domain
   - Update DNS records

2. **SSL Certificate**:
   - Railway provides automatic SSL
   - Update client to use HTTPS

### 6. Monitoring & Scaling

#### Railway Features:
- **Automatic scaling**: Based on traffic
- **Health checks**: Built-in monitoring
- **Logs**: Real-time log streaming
- **Metrics**: CPU, memory, network usage

#### Cost Optimization:
- Use Railway's sleep feature for development
- Monitor usage to avoid overages
- Consider upgrading to Pro for production

### 7. Environment Variables

#### Server Environment:
```bash
DATABASE_PASSWORD=secure_password_here
NAKAMA_SERVER_KEY=your_server_key
PORT=7350
```

#### Client Environment:
```bash
EXPO_PUBLIC_NAKAMA_HOST=your-app.railway.app
EXPO_PUBLIC_NAKAMA_PORT=443
EXPO_PUBLIC_USE_SSL=true
```

### 8. Backup & Recovery

#### Database Backups:
```bash
# Create backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore backup
railway run psql $DATABASE_URL < backup.sql
```

#### Code Deployment:
- Use Git tags for releases
- Maintain staging and production environments
- Test deployments on staging first

## Alternative Deployment Options

### DigitalOcean App Platform
- Similar to Railway
- Docker support
- Managed databases

### AWS/GCP/Azure
- More configuration required
- Better for large scale
- More services available

### Heroic Cloud (Nakama Managed)
- Official Nakama hosting
- Premium support
- Enterprise features

## Production Checklist

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificates active
- [ ] Custom domain configured (optional)
- [ ] Monitoring alerts setup
- [ ] Client updated with production URLs
- [ ] Mobile app built and tested
- [ ] Performance testing completed
- [ ] Security review completed

## Troubleshooting

### Common Issues:
1. **Connection timeouts**: Check firewall settings
2. **SSL errors**: Verify certificate configuration
3. **Build failures**: Check dependency versions
4. **Database connection**: Verify DATABASE_URL format

### Debug Commands:
```bash
# Check server logs
railway logs

# Check service status
railway status

# Connect to database
railway connect

# Run commands in production
railway run [command]
```