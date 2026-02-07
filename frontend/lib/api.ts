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
    orbital_data?: {
        orbit_id: string
        orbit_determination_date: string
        first_observation_date: string
        last_observation_date: string
        data_arc_in_days: number
        observations_used: number
        orbit_uncertainty: string
        minimum_orbit_intersection: string
        jupiter_tisserand_invariant: string
        epoch_osculation: string
        eccentricity: string
        semi_major_axis: string
        inclination: string
        ascending_node_longitude: string
        orbital_period: string
        perihelion_distance: string
        perihelion_argument: string
        aphelion_distance: string
        perihelion_time: string
        mean_anomaly: string
        mean_motion: string
        equinox: string
        orbit_class?: {
            orbit_class_type: string
            orbit_class_description: string
            orbit_class_range: string
        }
    }
    is_sentry_object?: boolean
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
    forgotPassword: (email: string) => api.post('/api/auth/forgot-password', { email }),
    resetPassword: (data: any) => api.post('/api/auth/reset-password', data),
}

export const adminAPI = {
    getStats: () => api.get('/api/admin/stats'),
    getUsers: (query?: string) => api.get('/api/admin/users' + (query ? `?q=${query}` : '')),
    resetPassword: (data: { userId: string; newPassword: string }) =>
        api.post('/api/admin/reset-password', data),
    updateRole: (data: { userId: string; role: string }) =>
        api.put('/api/admin/update-role', data),
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

export interface HistoricalImpact {
    _id: string
    name: string
    date: string
    location: string
    energy: string
    impactType: string
    description: string
}

// History APIs
export const historyAPI = {
    getAll: () => api.get<HistoricalImpact[]>('/api/history'),
}

// Personal Chat APIs
export const chatAPI = {
    searchUsers: (query: string) => api.get<User[]>(`/api/chat/search-users?q=${query}`),
    getConversations: () => api.get<any[]>('/api/chat/conversations'),
    getMessages: (conversationId: string) =>
        api.get<any[]>(`/api/chat/conversations/${conversationId}/messages`),
}

export default api
