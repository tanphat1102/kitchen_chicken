import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL ?? '';

export const api: AxiosInstance = axios.create({
	baseURL,
	headers: {
		Accept: '*/*',
		'Content-Type': 'application/json',
	},
	withCredentials: false,
});

const AUTH_TOKEN_KEY = 'accessToken';

export function setAuthToken(token?: string) {
	if (token) {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
	} else {
		localStorage.removeItem(AUTH_TOKEN_KEY);
	}
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	if (token) {
		const hasAuth = (config.headers as any)?.Authorization ?? (config.headers as any)?.authorization;
		if (!hasAuth) {
			(config.headers as any) = config.headers || {};
			(config.headers as any).Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

export default api;
