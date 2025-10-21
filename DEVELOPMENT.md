# 🎮 Lila Tic-Tac-Toe Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (optional)

### 1. Start the Server

```bash
cd server
npm install
./start.sh
```

This will:
- Install server dependencies
- Build TypeScript code
- Start Nakama server with PostgreSQL
- Server will be available at `http://localhost:7350`
- Admin console at `http://localhost:7351`

### 2. Start the Mobile Client

In a new terminal:
```bash
cd client
npm install
npx expo start
```

This will:
- Install client dependencies
- Start Expo development server
- Scan QR code with Expo Go app or press 'i' for iOS simulator

## 🏗️ Project Architecture

### Server (Nakama + TypeScript)
```
server/
├── src/
│   ├── index.ts          # Main server runtime
│   └── types.d.ts        # Type definitions
├── docker-compose.yml    # Docker setup
├── local.yml            # Nakama configuration
└── start.sh             # Startup script
```

### Client (React Native + Expo)
```
client/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── services/        # API and business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
└── App.tsx              # Main app component
```

## 🎯 Key Features Implemented

### ✅ Server Features
- **Server-Authoritative Game Logic**: All game validation on server
- **Real-time Multiplayer**: WebSocket communication
- **Matchmaking System**: Auto-pairing of players
- **Player Statistics**: Win/loss tracking with ELO rating
- **Leaderboard System**: Global ranking system
- **Multiple Concurrent Games**: Handle many simultaneous matches

### ✅ Client Features
- **Cross-platform Mobile App**: React Native with Expo
- **Real-time Game UI**: Live game board updates
- **Player Authentication**: Device-based auth
- **Statistics Dashboard**: Player performance metrics
- **Leaderboard View**: Global rankings
- **Reconnection Handling**: Graceful connection management

## 🎮 Game Flow

1. **Authentication**: Device-based automatic login
2. **Home Screen**: View stats, find match, access leaderboard
3. **Matchmaking**: Server finds/creates game session
4. **Gameplay**: Real-time Tic-Tac-Toe with turn validation
5. **Results**: Game outcome, stats update, ELO calculation
6. **Repeat**: Return to home or play again

## 🔧 Development Commands

### Server Commands
```bash
cd server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development (watch mode)
npm run dev

# Start production
npm start

# Reset Docker (clean restart)
npm run reset
```

### Client Commands
```bash
cd client

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web
npx expo start --web

# Build for production
npx expo build
```

## 🌐 Network Configuration

### Local Development
- Server: `http://localhost:7350`
- Admin Console: `http://localhost:7351`
- Client connects to `127.0.0.1:7350`

### Testing on Physical Device
1. Find your computer's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Update `client/src/services/NakamaService.ts`:
   ```typescript
   private readonly host = 'YOUR_COMPUTER_IP'; // e.g., '192.168.1.100'
   ```

## 🐛 Troubleshooting

### Server Issues
- **Docker not starting**: Ensure Docker Desktop is running
- **Port conflicts**: Check if ports 7350, 7351, 5432 are available
- **TypeScript errors**: Run `npm run build` to see compilation errors

### Client Issues
- **Metro bundler issues**: Clear cache with `npx expo start --clear`
- **Connection errors**: Verify server IP configuration
- **Navigation errors**: Ensure all screens are properly imported

### Common Fixes
```bash
# Clear all caches
cd client && npx expo start --clear
cd server && docker-compose down -v && docker-compose up

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install
```

## 📊 Testing & Debugging

### Server Debugging
- Check Nakama logs: `docker-compose logs nakama`
- Access admin console: `http://localhost:7351`
- Monitor match states and user sessions

### Client Debugging
- Use React Native Debugger
- Enable Flipper for network inspection
- Console logs in Expo development tools

### Testing Multiplayer
1. Open two browser tabs or devices
2. Both connect to same server
3. Start matches from both clients
4. Verify real-time synchronization

## 🚀 Deployment Options

### Server Deployment
- **Railway**: Easy one-click deployment
- **DigitalOcean**: Docker container hosting
- **AWS/GCP**: Cloud container services
- **Heroic Cloud**: Managed Nakama hosting

### Client Deployment
- **Expo Application Services (EAS)**: Managed build and deploy
- **App Store/Google Play**: Native app distribution
- **Web**: Progressive Web App deployment

## 🔮 Next Steps

### Planned Enhancements
- [ ] Private room codes
- [ ] Spectator mode
- [ ] Tournament system
- [ ] Chat functionality
- [ ] Push notifications
- [ ] Social features (friends, invites)
- [ ] Advanced analytics with Satori
- [ ] AI opponent mode

### Performance Optimizations
- [ ] Connection pooling
- [ ] Match state caching
- [ ] Horizontal scaling
- [ ] CDN integration
- [ ] Image optimization

## 📚 Learning Resources

- [Nakama Documentation](https://heroiclabs.com/docs/)
- [React Native Guide](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.