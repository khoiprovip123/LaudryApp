import { create } from 'zustand';
import type { UseToastOptions } from '@chakra-ui/react';

type ToastFunction = (options: UseToastOptions) => void;

type ToastStore = {
	toast: ToastFunction | null;
	setToast: (toast: ToastFunction) => void;
};

/**
 * Toast store để có thể gọi toast từ bất kỳ đâu (ngoài React components)
 * Toast function sẽ được set từ App component khi app khởi động
 */
export const useToastStore = create<ToastStore>((set) => ({
	toast: null,
	setToast: (toast) => set({ toast }),
}));

