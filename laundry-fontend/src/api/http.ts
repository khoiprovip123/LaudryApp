import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/auth';
import { parseError } from '../utils/errorHandler';

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
	timeout: 30000, // 30 seconds timeout
});

http.interceptors.request.use(
	(config) => {
		const token = useAuthStore.getState().token;
		if (token) {
			config.headers = config.headers ?? {};
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		// Xử lý lỗi request
		console.error('Request error:', error);
		return Promise.reject(error);
	}
);

http.interceptors.response.use(
	(res) => res,
	(err: AxiosError) => {
		// Xử lý 401 Unauthorized
		if (err?.response?.status === 401) {
			useAuthStore.getState().logout();
			// Hard redirect to login
			window.location.href = '/login';
			return Promise.reject(err);
		}

		// Parse error để có thông tin chi tiết
		const parsedError = parseError(err);
		
		// Log error để debug (không hiển thị toast ở đây vì không có access đến toast context)
		// Các component sẽ tự quyết định có hiển thị toast hay không
		console.error('API Error:', {
			status: err?.response?.status,
			code: parsedError.code,
			message: parsedError.message,
			details: parsedError.details,
			url: err?.config?.url,
		});

		// Trả về error với thông tin đã được parse
		// Các component có thể access err.response.data để lấy ErrorResponse
		return Promise.reject(err);
	}
);


