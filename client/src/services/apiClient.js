import axios from 'axios';

const getDefaultBaseUrl = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined') {
        return '/api';
    }
    return 'http://localhost:5001/api';
};

const API_BASE_URL = getDefaultBaseUrl();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000
});

// Request interceptor to attach JWT auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('insight_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            'Network request failed. Please check your connection.';
        const customError = new Error(message);
        customError.status = error.response?.status;
        customError.data = error.response?.data;
        return Promise.reject(customError);
    }
);

// High-performance In-Memory Query Cache & In-Flight Deduplication Store
const cache = new Map();
const inFlightRequests = new Map();
const DEFAULT_CACHE_TTL = 15000; // 15 seconds

export const clearApiCache = (pattern = null) => {
    if (!pattern) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

apiClient.clearCache = clearApiCache;

// Wrap GET requests with in-flight deduplication & short-term query cache
const rawGet = apiClient.get.bind(apiClient);
apiClient.get = (url, config = {}) => {
    const bypassCache = config.cache === false || config.isRefresh === true;
    const token = (typeof localStorage !== 'undefined' && localStorage.getItem('insight_token')) || 'anon';
    const cacheKey = `${token}:${url}:${JSON.stringify(config.params || {})}`;

    if (!bypassCache) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < (config.ttl || DEFAULT_CACHE_TTL)) {
            return Promise.resolve(cached.data);
        }
        if (inFlightRequests.has(cacheKey)) {
            return inFlightRequests.get(cacheKey);
        }
    }

    const requestPromise = rawGet(url, config)
        .then((data) => {
            if (!bypassCache) {
                cache.set(cacheKey, { data, timestamp: Date.now() });
            }
            return data;
        })
        .finally(() => {
            inFlightRequests.delete(cacheKey);
        });

    if (!bypassCache) {
        inFlightRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
};

// Invalidate cache on mutations (POST, PUT, DELETE) so state is never stale
const rawPost = apiClient.post.bind(apiClient);
apiClient.post = (url, data, config) => {
    cache.clear();
    return rawPost(url, data, config);
};

const rawPut = apiClient.put.bind(apiClient);
apiClient.put = (url, data, config) => {
    cache.clear();
    return rawPut(url, data, config);
};

const rawDelete = apiClient.delete.bind(apiClient);
apiClient.delete = (url, config) => {
    cache.clear();
    return rawDelete(url, config);
};

export default apiClient;

