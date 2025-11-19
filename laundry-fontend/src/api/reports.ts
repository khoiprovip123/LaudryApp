import { httpGet } from './http';

export type RevenueReportDto = {
	dateFrom: string;
	dateTo: string;
	totalRevenue: number;
	totalOrders: number;
	totalDebt: number;
	revenueByService: RevenueByServiceDto[];
	revenueByCustomer: RevenueByCustomerDto[];
	dailyDetails: DailyRevenueDetailDto[];
};

export type RevenueByServiceDto = {
	serviceId: string;
	serviceName: string;
	revenue: number;
	orderCount: number;
	quantity: number;
};

export type RevenueByCustomerDto = {
	partnerId: string;
	partnerName: string;
	partnerDisplayName: string;
	revenue: number;
	paidAmount: number;
	debtAmount: number;
	orderCount: number;
};

export type DailyRevenueDetailDto = {
	date: string;
	revenue: number;
	orderCount: number;
	paidOrders: number;
	debtOrders: number;
};

export type GetRevenueReportQuery = {
	dateFrom: string;
	dateTo: string;
	includeByService?: boolean;
	includeByCustomer?: boolean;
	includeDailyDetails?: boolean;
};

export const getRevenueReport = async (query: GetRevenueReportQuery) => {
	const { data } = await httpGet<RevenueReportDto>('/reports/revenue', {
		params: query,
	});
	return data;
};

