# Running Cosmic Watch Locally (Without Docker)

Since Docker is having build issues, here's how to run the application locally on your machine.

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR use MongoDB Atlas (cloud)
- Redis installed locally OR skip Redis (optional for caching)

## Quick Setup

### 1. Install MongoDB (if not installed)

**Option A: MongoDB Community Server (Local)**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Sign up at: https://www.mongodb.com/cloud/atlas/register
- Create a free cluster
- Get connection string and update `.env` file

### 2. Install Redis (Optional)

**Option A: Redis for Windows**
- Download from: https://github.com/microsoftarchive/redis/releases
- Install and start Redis service

**Option B: Skip Redis**
- Comment out Redis-related code (app will work without caching)

### 3. Install Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Update Environment Variables

**Backend (.env)**:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cosmic-watch
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmic-watch

REDIS_URL=redis://localhost:6379
# If skipping Redis, the app will still work

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

NASA_API_KEY=usxLT2BsemQtRXgNtQeYmdpKoZ9lLroarsW7e6Rg
NASA_API_URL=https://api.nasa.gov/neo/rest/v1

CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 5. Start the Application

**Terminal 1 - Backend**:
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```powershell
cd frontend
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

## Troubleshooting

### MongoDB Connection Error
If you see "MongoDB connection error":
- Make sure MongoDB is running
- Check the connection string in `.env`
- For Atlas, make sure to whitelist your IP address

### Redis Connection Error
If you see "Redis connection error":
- Either install and start Redis
- Or comment out Redis code in `backend/src/config/redis.ts`

### Port Already in Use
If ports 3000 or 4000 are in use:
- Change PORT in backend `.env`
- Update NEXT_PUBLIC_API_URL in frontend `.env.local`

## Running Without Redis

If you don't want to install Redis, modify `backend/src/config/redis.ts`:

```typescript
// Comment out or wrap in try-catch
export async function connectRedis() {
  try {
    await redisClient.connect()
    console.log('✅ Redis connected successfully')
  } catch (error) {
    console.warn('⚠️  Redis not available, running without cache')
  }
}
```

And in `backend/src/services/nasa.service.ts`, wrap Redis calls in try-catch blocks.

## Success!

Once both servers are running, you should see:
- Backend: `🚀 Server running on http://localhost:4000`
- Frontend: `✓ Ready in X ms`

Happy exploring! 🌌
