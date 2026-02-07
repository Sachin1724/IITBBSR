import dotenv from 'dotenv'
dotenv.config()

export const config = {
    port: parseInt(process.env.PORT || '4000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmic-watch',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    nasa: {
        apiKey: process.env.NASA_API_KEY || 'DEMO_KEY',
        apiUrl: process.env.NASA_API_URL || 'https://api.nasa.gov/neo/rest/v1',
    },
    cors: {
        origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002',
                'http://localhost:3003',
                'http://localhost:3004',
                'http://localhost:3005',
                'http://localhost:3006',
                'http://localhost:3007',
                'http://localhost:3008',
                'http://localhost:3009',
                'http://localhost:3010',
                'http://localhost:3011',
                'http://localhost:3012',
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                cb(null, true);
                return;
            }
            cb(new Error("Not allowed by CORS"), false);
        }
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    },
}
