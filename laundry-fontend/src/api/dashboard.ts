import { httpGet } from './http';

export type DashboardStatsDto = {
	todayRevenue: number;
	weekRevenue: number;
	monthRevenue: number;
	yearRevenue: number;
	todayOrders: number;
	weekOrders: number;
	monthOrders: number;
	yearOrders: number;
	receivedOrders: number;
	processingOrders: number;
	completedOrders: number;
	deliveredOrders: number;
	totalDebt: number;
	debtOrders: number;
	topCustomers: TopCustomerDto[];
	dailyRevenues: DailyRevenueDto[];
	overdueOrders: number;
};

export type TopCustomerDto = {
	partnerId: string;
	partnerName: string;
	partnerDisplayName: string;
	totalRevenue: number;
	orderCount: number;
};

export type DailyRevenueDto = {
	date: string;
	revenue: number;
	orderCount: number;
};

export type GetDashboardStatsQuery = {
	dateFrom?: string;
	dateTo?: string;
};

export const getDashboardStats = async (query?: GetDashboardStatsQuery) => {
	const { data } = await httpGet<DashboardStatsDto>('/dashboard/stats', {
		params: query,
	});
	return data;
};

