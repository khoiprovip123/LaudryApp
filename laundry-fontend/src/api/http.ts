import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/auth';
import { useToastStore } from '../store/toast';
import { parseError, formatErrorWithCode } from '../utils/errorHandler';

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
		
		// Log error để debug
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

/**
 * Wrapper functions cho các phương thức HTTP với tự động parse và hiển thị lỗi
 * Sử dụng các functions này thay vì gọi trực tiếp http.get/post/put/patch/delete
 * để có xử lý lỗi đồng nhất cho cả project
 */

type HttpOptions = AxiosRequestConfig & {
	/**
	 * Tắt tự động hiển thị toast khi có lỗi (mặc định: false)
	 * Nếu true, sẽ không hiển thị toast, chỉ parse error và throw
	 */
	silent?: boolean;
};

/**
 * Wrapper cho http.get với tự động parse và hiển thị lỗi
 */
export const httpGet = async <T = any>(
	url: string,
	config?: HttpOptions
): Promise<AxiosResponse<T>> => {
	try {
		return await http.get<T>(url, config);
	} catch (err) {
		handleHttpError(err, config?.silent);
		throw err;
	}
};

/**
 * Wrapper cho http.post với tự động parse và hiển thị lỗi
 */
export const httpPost = async <T = any>(
	url: string,
	data?: any,
	config?: HttpOptions
): Promise<AxiosResponse<T>> => {
	try {
		return await http.post<T>(url, data, config);
	} catch (err) {
		handleHttpError(err, config?.silent);
		throw err;
	}
};

/**
 * Wrapper cho http.put với tự động parse và hiển thị lỗi
 */
export const httpPut = async <T = any>(
	url: string,
	data?: any,
	config?: HttpOptions
): Promise<AxiosResponse<T>> => {
	try {
		return await http.put<T>(url, data, config);
	} catch (err) {
		handleHttpError(err, config?.silent);
		throw err;
	}
};

/**
 * Wrapper cho http.patch với tự động parse và hiển thị lỗi
 */
export const httpPatch = async <T = any>(
	url: string,
	data?: any,
	config?: HttpOptions
): Promise<AxiosResponse<T>> => {
	try {
		return await http.patch<T>(url, data, config);
	} catch (err) {
		handleHttpError(err, config?.silent);
		throw err;
	}
};

/**
 * Wrapper cho http.delete với tự động parse và hiển thị lỗi
 */
export const httpDelete = async <T = any>(
	url: string,
	config?: HttpOptions
): Promise<AxiosResponse<T>> => {
	try {
		return await http.delete<T>(url, config);
	} catch (err) {
		handleHttpError(err, config?.silent);
		throw err;
	}
};

/**
 * Hàm xử lý lỗi HTTP: parse error và hiển thị toast
 */
function handleHttpError(err: unknown, silent?: boolean): void {
	// Không hiển thị toast nếu silent = true
	if (silent) {
		return;
	}

	// Không hiển thị toast cho lỗi 401 (đã được xử lý trong interceptor)
	if (err instanceof AxiosError && err?.response?.status === 401) {
		return;
	}

	// Parse error
	const errorWithCode = formatErrorWithCode(err);

	// Lấy toast function từ store
	const toast = useToastStore.getState().toast;

	// Hiển thị toast nếu có toast function
	if (toast) {
		const toastTitle = errorWithCode.code
			? `Có lỗi xảy ra [${errorWithCode.code}]`
			: 'Có lỗi xảy ra';

		toast({
			title: toastTitle,
			description: errorWithCode.message + (errorWithCode.details ? `\n${errorWithCode.details}` : ''),
			status: 'error',
			duration: 5000,
			isClosable: true,
			position: 'top-right',
		});
	}
}


