import { useToast as useChakraToast } from '@chakra-ui/react';
import type { UseToastOptions } from '@chakra-ui/react';

export const useToast = () => {
	const toast = useChakraToast();

	return (options: UseToastOptions) => {
		return toast({
			...options,
			position: options.position || 'top',
		});
	};
};

