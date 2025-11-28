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

/**
 * Hàm làm tròn số
 * @param value - Giá trị cần làm tròn
 * @param decimals - Số chữ số thập phân (mặc định 0)
 */
const round = (value: number, decimals?: number): number => {
	if (decimals === undefined || decimals === null) {
		return Math.round(value);
	}
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
};

/**
 * Format số với locale string (vi-VN)
 */
const localeString = (value: number): number => {
	// Trong Angular pipe, localeString trả về string đã format
	// Nhưng ở đây chúng ta cần trả về number để dùng trong input
	// Nên sẽ parse lại từ string đã format
	const formatted = new Intl.NumberFormat('vi-VN').format(value);
	// Loại bỏ dấu chấm phân cách để parse về number
	const numericValue = formatted.replace(/\./g, '');
	return parseFloat(numericValue) || 0;
};

/**
 * Transform giá trị giống như pipe trong Angular
 * @param value - Giá trị cần transform (string | number)
 * @param optionDecimal - Số chữ số thập phân (-1 nghĩa là không làm tròn)
 * @returns Số đã được format
 */
export const transform = (value: string | number, optionDecimal?: number): number => {
	if (value === null || value === undefined) return 0;

	const numValue = typeof value === 'string' ? parseFloat(value) : value;
	if (isNaN(numValue)) return 0;

	const roundValue = optionDecimal === -1 ? round(numValue) : numValue;

	return localeString(
		optionDecimal !== -1 ? round(numValue, optionDecimal) : roundValue
	);
};

/**
 * Format giá trị để hiển thị trong input (giống transform nhưng trả về string đã format)
 * @param value - Giá trị cần format (string | number)
 * @param optionDecimal - Số chữ số thập phân (-1 nghĩa là không làm tròn)
 * @returns String đã được format với dấu chấm phân cách hàng nghìn
 */
export const formatPriceInput = (value: string | number, optionDecimal?: number): string => {
	if (value === null || value === undefined || value === '') return '';

	const numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;
	if (isNaN(numValue)) return '';

	// Làm tròn nếu cần
	let roundedValue: number;
	if (optionDecimal === -1) {
		roundedValue = round(numValue);
	} else if (optionDecimal !== undefined) {
		roundedValue = parseFloat(numValue.toFixed(optionDecimal));
	} else {
		roundedValue = round(numValue);
	}

	// Format với locale string (vi-VN) - dùng dấu chấm phân cách hàng nghìn
	return new Intl.NumberFormat('vi-VN').format(roundedValue);
};

/**
 * Parse giá trị từ input đã format về number
 * @param value - String đã được format (có dấu chấm phân cách)
 * @returns Number
 */
export const parsePriceInput = (value: string): number => {
	if (!value) return 0;
	// Loại bỏ dấu chấm phân cách và parse về number
	const numericValue = value.replace(/\./g, '');
	return parseFloat(numericValue) || 0;
};

