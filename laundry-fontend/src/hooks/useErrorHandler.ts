import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { parseError, formatErrorMessage } from '../utils/errorHandler';

/**
 * Hook để xử lý và hiển thị errors một cách nhất quán
 */
export function useErrorHandler() {
	const toast = useToast();

	const handleError = useCallback(
		(error: unknown, options?: { title?: string; showToast?: boolean }) => {
			const parsed = parseError(error);
			const message = formatErrorMessage(error);

			// Log error để debug
			console.error('Error occurred:', {
				error,
				parsed,
				message,
			});

			// Hiển thị toast nếu được yêu cầu (mặc định là true)
			if (options?.showToast !== false) {
				toast({
					title: options?.title || 'Có lỗi xảy ra',
					description: message,
					status: 'error',
					duration: 5000,
					isClosable: true,
					position: 'top-right',
				});
			}

			return parsed;
		},
		[toast]
	);

	return { handleError };
}

