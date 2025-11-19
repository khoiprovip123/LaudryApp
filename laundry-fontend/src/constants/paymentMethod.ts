/**
 * Payment Method Constants và Helper Functions
 */

export const PaymentMethod = {
	Cash: 'Cash',
	BankTransfer: 'BankTransfer',
	Bank: 'Bank',
	Card: 'Card',
	Other: 'Other',
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

/**
 * Mapping PaymentMethod sang text tiếng Việt
 */
export const PaymentMethodLabels: Record<PaymentMethodType | string, string> = {
	[PaymentMethod.Cash]: 'Tiền mặt',
	[PaymentMethod.BankTransfer]: 'Chuyển khoản',
	[PaymentMethod.Bank]: 'Chuyển khoản',
	[PaymentMethod.Card]: 'Thẻ',
	[PaymentMethod.Other]: 'Khác',
};

/**
 * Lấy label tiếng Việt cho PaymentMethod
 */
export const getPaymentMethodLabel = (method: string): string => {
	return PaymentMethodLabels[method] || method;
};

