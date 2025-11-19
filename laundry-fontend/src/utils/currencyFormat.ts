/**
 * Format số tiền theo định dạng VND với dấu chấm phân cách hàng nghìn
 * Ví dụ: 1000000 -> "1.000.000", "100000" -> "100.000"
 */
export const formatCurrencyInput = (value: string | number): string => {
	// Xử lý các trường hợp rỗng
	if (value === '' || value === null || value === undefined) return '';
	
	// Chuyển thành string và loại bỏ tất cả ký tự không phải số
	const numericValue = String(value).replace(/[^\d]/g, '');
	
	if (numericValue === '' || numericValue === '0') return '';
	
	// Format với dấu chấm phân cách hàng nghìn từ phải sang trái
	// Ví dụ: "100000" -> "100.000"
	const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	
	return formatted;
};

/**
 * Parse giá trị đã format về số nguyên
 * Ví dụ: "1.000.000" -> 1000000
 */
export const parseCurrencyInput = (value: string): number => {
	if (!value) return 0;
	
	// Loại bỏ tất cả ký tự không phải số
	const numericValue = value.replace(/[^\d]/g, '');
	
	return numericValue === '' ? 0 : parseInt(numericValue, 10);
};

/**
 * Format số tiền để hiển thị (có thể dùng cho display)
 */
export const formatCurrencyDisplay = (amount: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
	}).format(amount);
};

