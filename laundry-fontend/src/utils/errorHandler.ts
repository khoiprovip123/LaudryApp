import { AxiosError } from 'axios';

/**
 * Error Response từ Backend (theo chuẩn ABP)
 */
export interface ErrorResponse {
	error: {
		code?: string;
		message: string;
		details?: string;
		data?: Record<string, any>;
		validationErrors?: Array<{
			message: string;
			members: string[];
		}>;
	};
	targetUrl?: string;
	unauthorizedRequest?: boolean;
	success: boolean;
}

/**
 * Parse error từ Axios error response
 */
export function parseError(error: unknown): {
	message: string;
	code?: string;
	details?: string;
	statusCode?: number;
} {
	// Nếu là AxiosError với response từ BE
	if (error instanceof AxiosError && error.response?.data) {
		const data = error.response.data as ErrorResponse;

		// Nếu có error object theo chuẩn ABP
		if (data.error) {
			return {
				message: data.error.message || 'Đã xảy ra lỗi',
				code: data.error.code,
				details: data.error.details,
				statusCode: error.response.status,
			};
		}

		// Nếu response.data là string
		if (typeof data === 'string') {
			return {
				message: data,
				statusCode: error.response.status,
			};
		}

		// Nếu có message trực tiếp
		if (typeof data === 'object' && 'message' in data) {
			return {
				message: (data as any).message || 'Đã xảy ra lỗi',
				statusCode: error.response.status,
			};
		}
	}

	// Nếu là AxiosError nhưng không có response (network error)
	if (error instanceof AxiosError) {
		if (error.code === 'ECONNABORTED') {
			return {
				message: 'Kết nối timeout. Vui lòng thử lại.',
				code: 'TIMEOUT',
			};
		}
		if (error.code === 'ERR_NETWORK') {
			return {
				message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
				code: 'NETWORK_ERROR',
			};
		}
		return {
			message: error.message || 'Đã xảy ra lỗi kết nối',
			code: error.code,
		};
	}

	// Nếu là Error object thông thường
	if (error instanceof Error) {
		return {
			message: error.message || 'Đã xảy ra lỗi',
		};
	}

	// Fallback
	return {
		message: 'Đã xảy ra lỗi không xác định',
	};
}

/**
 * Format error message để hiển thị cho user
 * Bao gồm cả code và message
 */
export function formatErrorMessage(error: unknown): string {
	const parsed = parseError(error);
	
	// Nếu có code, hiển thị cả code và message
	if (parsed.code) {
		const codeMessage = `[${parsed.code}] ${parsed.message}`;
		
		// Nếu có details, thêm vào
		if (parsed.details) {
			return `${codeMessage}\n${parsed.details}`;
		}
		
		return codeMessage;
	}
	
	// Nếu không có code nhưng có details, kết hợp với message
	if (parsed.details) {
		return `${parsed.message}\n${parsed.details}`;
	}

	return parsed.message;
}

/**
 * Format error để hiển thị với code và message riêng biệt
 * Trả về object với code và message để có thể hiển thị riêng
 */
export function formatErrorWithCode(error: unknown): {
	code?: string;
	message: string;
	details?: string;
	statusCode?: number;
} {
	const parsed = parseError(error);
	
	return {
		code: parsed.code,
		message: parsed.message,
		details: parsed.details,
		statusCode: parsed.statusCode,
	};
}

