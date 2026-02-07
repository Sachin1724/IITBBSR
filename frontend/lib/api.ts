import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export interface Asteroid {
    id: string
    name: string
    nasa_jpl_url: string
    absolute_magnitude_h: number
    estimated_diameter: {
        kilometers: {
            estimated_diameter_min: number
            estimated_diameter_max: number
        }
    }
    is_potentially_hazardous_asteroid: boolean
    close_approach_data: Array<{
        close_approach_date: string
        close_approach_date_full: string
        relative_velocity: {
            kilometers_per_hour: string
        }
        miss_distance: {
            kilometers: string
        }
    }>
    riskScore?: number
}

export interface User {
    id: string
    email: string
    name: string
    role: string
}

export interface WatchlistItem {
    id: string
    asteroidId: string
    userId: string
    createdAt: string
}

export interface Alert {
    id: string
    userId: string
    asteroidId: string
    threshold: number
    enabled: boolean
    createdAt: string
}

// Auth APIs
export const authAPI = {
    register: (data: { email: string; password: string; name: string }) =>
        api.post('/api/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/api/auth/login', data),
    getProfile: () => api.get('/api/auth/profile'),
}

// Asteroid APIs
export const asteroidAPI = {
    getAll: (params?: { startDate?: string; endDate?: string }) =>
        api.get<Asteroid[]>('/api/asteroids', { params }),
    getById: (id: string) => api.get<Asteroid>(`/api/asteroids/${id}`),
    search: (query: string) => api.get<Asteroid[]>(`/api/asteroids/search?q=${query}`),
}

// Watchlist APIs
export const watchlistAPI = {
    getAll: () => api.get<WatchlistItem[]>('/api/watchlist'),
    add: (asteroidId: string) => api.post('/api/watchlist', { asteroidId }),
    remove: (asteroidId: string) => api.delete(`/api/watchlist/${asteroidId}`),
}

// Alert APIs
export const alertAPI = {
    getAll: () => api.get<Alert[]>('/api/alerts'),
    create: (data: { asteroidId: string; threshold: number }) =>
        api.post('/api/alerts', data),
    update: (id: string, data: { threshold?: number; enabled?: boolean }) =>
        api.put(`/api/alerts/${id}`, data),
    delete: (id: string) => api.delete(`/api/alerts/${id}`),
}

export default api
