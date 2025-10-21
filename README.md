# 🎮 Lila Tic-Tac-Toe

A deployable multiplayer Tic-Tac-Toe mobile game built with Nakama and React Native.

## 📋 Prerequisites

- **Node.js**: 20.19.5 or higher (see [NODE_VERSION.md](NODE_VERSION.md) for setup)
- **Docker**: For running Nakama server
- **nvm**: Recommended for Node.js version management

## 🏗️ Architecture

- **Server**: Nakama with TypeScript runtime for server-authoritative game logic
- **Client**: React Native with Expo for cross-platform mobile development
- **Database**: PostgreSQL (Nakama default)
- **Real-time Communication**: Nakama WebSocket API
- **Deployment**: Docker containers on Railway/DigitalOcean

## 🚀 Features

- ✅ Server-authoritative multiplayer gameplay
- ✅ Real-time matchmaking system
- ✅ Player authentication & sessions
- ✅ Leaderboard & statistics tracking
- ✅ Multiple concurrent game sessions
- ✅ Cross-platform mobile support
- ✅ Reconnection handling

## 📁 Project Structure

```
lila-tic-tac-toe/
├── server/                 # Nakama server with TypeScript runtime
│   ├── src/               # TypeScript game logic
│   ├── docker-compose.yml # Nakama server setup
│   └── package.json       # Server dependencies
├── client/                # React Native mobile app
│   ├── src/              # React Native source code
│   ├── app.json          # Expo configuration
│   └── package.json      # Client dependencies
└── README.md
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Expo CLI
- iOS Simulator or Android Emulator

### Server Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Nakama server:
   ```bash
   docker-compose up
   ```

### Client Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npx expo start
   ```

## 🎯 Game Flow

1. **Authentication** → Device-based authentication with Nakama
2. **Main Menu** → Join quick match or create private room
3. **Matchmaking** → Server finds opponent and creates game session
4. **Gameplay** → Real-time Tic-Tac-Toe with server validation
5. **Results** → Game outcome, statistics update, leaderboard ranking

## 🌐 Deployment

The server is containerized and ready for deployment on:
- Railway
- DigitalOcean
- AWS/GCP/Azure
- Heroic Cloud (Nakama managed hosting)

## 📱 Mobile App Deployment

Built with Expo for easy deployment to:
- iOS App Store (via EAS Build)
- Google Play Store (via EAS Build)
- Web (Progressive Web App)

## 🏆 Advanced Features

- **ELO Rating System**: Skill-based matchmaking
- **Tournament Mode**: Bracket-style competitions
- **Social Features**: Friends, chat, spectating
- **Analytics**: Player behavior tracking with Satori
- **LiveOps**: Remote configuration and A/B testing

## 📊 Technical Details

- **Concurrent Players**: Supports thousands of simultaneous games
- **Latency**: Sub-100ms real-time updates
- **Scalability**: Horizontal scaling with Nakama clusters
- **Security**: Server-authoritative validation prevents cheating

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.