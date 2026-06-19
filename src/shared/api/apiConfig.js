const runtimeApiUrl = globalThis.window?.__APP_CONFIG__?.API_URL

export const API_URL = runtimeApiUrl || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'