# Cosmic Watch 🌌

A production-ready full-stack platform for real-time Near-Earth Object (NEO) monitoring with a sleek, minimal, cinematic space-themed UI.

![Cosmic Watch](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

### Frontend
- **Real-time Asteroid Dashboard** - Live NEO data with risk scoring
- **3D Orbital Simulation** - Interactive Three.js visualization with orbital mechanics
- **Watchlist Management** - Track your favorite asteroids
- **Alert System** - Customizable risk-based notifications
- **Community Chat** - Real-time WebSocket chat per asteroid
- **Responsive Design** - Glassmorphism UI with cosmic color palette
- **Smooth Animations** - Framer Motion micro-interactions

### Backend
- **NASA NeoWs Integration** - Live asteroid data with caching
- **Risk Analysis Engine** - Intelligent scoring based on multiple factors
- **JWT Authentication** - Secure user management with bcrypt
- **RESTful APIs** - Clean, documented endpoints
- **WebSocket Support** - Real-time chat and notifications
- **Background Schedulers** - Automated data refresh
- **Redis Caching** - Optimized API performance

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Three.js / React Three Fiber
- Framer Motion
- Socket.io Client

**Backend:**
- Node.js + Fastify
- TypeScript
- MongoDB + Mongoose
- Redis
- Socket.io
- JWT + bcrypt
- Node-cron

**DevOps:**
- Docker + Docker Compose
- Multi-stage builds
- Health checks

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- NASA API Key (get free at https://api.nasa.gov/)

### Quick Start with Docker

1. **Clone the repository**
\`\`\`bash
git clone <your-repo-url>
cd IITBBSR
\`\`\`

2. **Set environment variables**
\`\`\`bash
# Create .env file in root
echo "JWT_SECRET=your-super-secret-key" > .env
echo "NASA_API_KEY=your-nasa-api-key" >> .env
\`\`\`

3. **Start all services**
\`\`\`bash
docker-compose up -d
\`\`\`

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

### Local Development

**Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

**Backend:**
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

## 🚀 Deployment

For detailed instructions on how to deploy this application to production (Netlify + Render) or run it with Docker, please see our [Deployment Guide](deployment_guide.md).

## 🎨 Color Palette

The cosmic theme uses a carefully curated palette:

- **Deep Space Blue** (#070F2B) - Primary background
- **Dark Cosmic Purple** (#1B1A55) - Secondary background
- **Nebula Blue** (#535C91) - Accents and borders
- **Soft Lavender** (#9290C3) - Text and highlights

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Asteroids
- `GET /api/asteroids` - Get all asteroids (with date range)
- `GET /api/asteroids/:id` - Get asteroid by ID
- `GET /api/asteroids/search?q=` - Search asteroids

### Watchlist
- `GET /api/watchlist` - Get user's watchlist (protected)
- `POST /api/watchlist` - Add to watchlist (protected)
- `DELETE /api/watchlist/:asteroidId` - Remove from watchlist (protected)

### Alerts
- `GET /api/alerts` - Get user's alerts (protected)
- `POST /api/alerts` - Create alert (protected)
- `PUT /api/alerts/:id` - Update alert (protected)
- `DELETE /api/alerts/:id` - Delete alert (protected)

## 🔌 WebSocket Events

### Chat
- `join-asteroid` - Join asteroid chat room
- `leave-asteroid` - Leave asteroid chat room
- `send-message` - Send chat message
- `new-message` - Receive new message
- `chat-history` - Receive message history

## 🧪 Testing

Import the Postman collection from `Cosmic_Watch.postman_collection.json` for complete API testing.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation with Zod
- Role-based access control

## 📊 Risk Scoring Algorithm

The risk score (0-100) is calculated based on:
- **Diameter** (0-30 points) - Larger asteroids score higher
- **Velocity** (0-30 points) - Faster asteroids score higher
- **Miss Distance** (0-30 points) - Closer approaches score higher
- **Hazardous Flag** (0-10 points) - NASA classification

Risk Levels:
- **LOW**: 0-24
- **MODERATE**: 25-49
- **HIGH**: 50-74
- **CRITICAL**: 75-100

## 🌟 3D Simulation

The Three.js simulation includes:
- Accurate orbital mechanics
- Real-time asteroid tracking
- Close approach visualization
- Hypothetical impact simulation (educational only)
- Interactive camera controls

## 📝 License

MIT License - feel free to use this project for learning and hackathons!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- NASA NeoWs API for asteroid data
- Three.js community for 3D visualization tools
- Fastify team for the excellent Node.js framework

---

Built with 💜 for space enthusiasts and researchers worldwide.
