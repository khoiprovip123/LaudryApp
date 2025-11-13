/**
 * Chuyển đổi số thành chữ tiếng Việt
 */
export const numberToWords = (num: number): string => {
	if (num === 0) return 'không đồng';

	const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
	const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
	const hundreds = ['', 'một trăm', 'hai trăm', 'ba trăm', 'bốn trăm', 'năm trăm', 'sáu trăm', 'bảy trăm', 'tám trăm', 'chín trăm'];

	const readGroup = (group: number): string => {
		if (group === 0) return '';
		
		let result = '';
		const hundred = Math.floor(group / 100);
		const remainder = group % 100;
		const ten = Math.floor(remainder / 10);
		const one = remainder % 10;

		if (hundred > 0) {
			result += hundreds[hundred] + ' ';
		}

		if (ten > 1) {
			result += tens[ten] + ' ';
			if (one > 0) {
				if (one === 5) {
					result += 'lăm ';
				} else if (one === 1 && ten > 1) {
					result += 'mốt ';
				} else {
					result += ones[one] + ' ';
				}
			}
		} else if (ten === 1) {
			if (one === 0) {
				result += 'mười ';
			} else if (one === 5) {
				result += 'mười lăm ';
			} else {
				result += 'mười ' + ones[one] + ' ';
			}
		} else if (one > 0) {
			if (one === 5 && hundred > 0) {
				result += 'lăm ';
			} else {
				result += ones[one] + ' ';
			}
		}

		return result.trim();
	};

	// Làm tròn đến hàng đơn vị
	const wholeNumber = Math.floor(num);
	const decimal = Math.round((num - wholeNumber) * 100);

	let result = '';

	// Đọc phần triệu
	const millions = Math.floor(wholeNumber / 1000000);
	if (millions > 0) {
		result += readGroup(millions) + ' triệu ';
	}

	// Đọc phần nghìn
	const thousands = Math.floor((wholeNumber % 1000000) / 1000);
	if (thousands > 0) {
		result += readGroup(thousands) + ' nghìn ';
	}

	// Đọc phần trăm
	const hundredsPart = wholeNumber % 1000;
	if (hundredsPart > 0) {
		result += readGroup(hundredsPart);
	}

	// Xử lý phần thập phân (xu)
	if (decimal > 0) {
		if (result) {
			result += ' phẩy ';
		}
		if (decimal < 10) {
			result += ones[decimal];
		} else {
			const decTen = Math.floor(decimal / 10);
			const decOne = decimal % 10;
			if (decTen === 1) {
				result += 'mười ' + (decOne > 0 ? ones[decOne] : '');
			} else {
				result += tens[decTen] + ' ' + (decOne > 0 ? ones[decOne] : '');
			}
		}
		result += ' xu';
	}

	result = result.trim() + ' đồng';

	// Viết hoa chữ cái đầu
	return result.charAt(0).toUpperCase() + result.slice(1);
};

