import { useCallback } from 'react';
import { useToast } from './useToast';
import { parseError, formatErrorMessage, formatErrorWithCode } from '../utils/errorHandler';

/**
 * Hook để xử lý và hiển thị errors một cách nhất quán
 */
export function useErrorHandler() {
	const toast = useToast();

	const handleError = useCallback(
		(error: unknown, options?: { title?: string; showToast?: boolean }) => {
			const parsed = parseError(error);
			const errorWithCode = formatErrorWithCode(error);
			const message = formatErrorMessage(error);

			// Log error để debug
			console.error('Error occurred:', {
				error,
				parsed,
				errorWithCode,
				message,
			});

			// Hiển thị toast nếu được yêu cầu (mặc định là true)
			if (options?.showToast !== false) {
				// Tạo title với code nếu có
				const toastTitle = errorWithCode.code 
					? `${options?.title || 'Có lỗi xảy ra'} [${errorWithCode.code}]`
					: options?.title || 'Có lỗi xảy ra';

				toast({
					title: toastTitle,
					description: errorWithCode.message + (errorWithCode.details ? `\n${errorWithCode.details}` : ''),
					status: 'error',
					duration: 5000,
					isClosable: true,
				});
			}

			return parsed;
		},
		[toast]
	);

	return { handleError };
}

