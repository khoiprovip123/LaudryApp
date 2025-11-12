import axios from 'axios';
import { useAuthStore } from '../store/auth';

function resolveBaseUrl(): string {
	// 1) Ưu tiên cấu hình runtime trong localStorage
	const fromStorage = typeof window !== 'undefined' ? localStorage.getItem('apiBaseUrl') : null;
	if (fromStorage) return fromStorage;

	// 2) Đọc từ biến môi trường Vite (nếu có)
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore import.meta env typing
	const fromEnv = import.meta?.env?.VITE_API_BASE_URL as string | undefined;
	if (fromEnv) return fromEnv;

	// 3) Fallback mặc định: IIS Express (Swagger: https://localhost:44337/swagger)
	return 'https://localhost:44337/api';
}

const baseURL = resolveBaseUrl();

export const http = axios.create({
	baseURL,
});

http.interceptors.request.use((config) => {
	const token = useAuthStore.getState().token;
	if (token) {
		config.headers = config.headers ?? {}; 
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

http.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err?.response?.status === 401) {
			useAuthStore.getState().logout();
			// Hard redirect to login
			window.location.href = '/login';
		}
		return Promise.reject(err);
	}
);


