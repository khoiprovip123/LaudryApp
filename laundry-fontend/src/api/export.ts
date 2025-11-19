import { http } from './http';
import type { GetOrdersQuery } from './orders';
import type { GetRevenueReportQuery } from './reports';

export const exportOrdersToExcel = async (query: GetOrdersQuery) => {
	const response = await http.get('/export/orders/excel', {
		params: query,
		responseType: 'blob',
	});

	// Tạo link download
	const url = window.URL.createObjectURL(new Blob([response.data]));
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', `DonHang_${new Date().toISOString().slice(0, 10)}.xlsx`);
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
};

export const exportRevenueToExcel = async (query: GetRevenueReportQuery) => {
	const response = await http.get('/export/revenue/excel', {
		params: query,
		responseType: 'blob',
	});

	// Tạo link download
	const url = window.URL.createObjectURL(new Blob([response.data]));
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', `BaoCaoDoanhThu_${new Date().toISOString().slice(0, 10)}.xlsx`);
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
};

