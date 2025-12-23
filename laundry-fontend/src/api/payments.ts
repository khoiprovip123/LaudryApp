import { httpGet, httpPost, httpDelete } from './http';

export type PaymentDto = {
	id: string;
	orderId?: string | null;
	paymentId: string;
	orderCode: string;
	partnerId?: string | null;
	partnerName: string;
	partnerRef: string;
	amount: number;
	paymentMethod: string;
	paymentDate: string;
	note?: string | null;
	paymentCode: string;
	dateCreated: string;
	dateUpdated?: string | null;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type PagedResult<T> = {
	offset: number;
	limit: number;
	totalItems: number;
	items: T[];
};

export type GetPaymentsQuery = {
	limit?: number;
	offset?: number;
	orderId?: string;
	partnerId?: string;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
};

export type CreatePaymentRequest = {
	orderId?: string | null;
	partnerId?: string | null;
	amount?: number | null;
	paymentMethod?: string | null;
	paymentDate?: string | null;
	note?: string | null;
};

export const getPayments = async (query: GetPaymentsQuery) => {
	const { data } = await httpGet<PaymentDto[]>('/paymentorders', {
		params: query,
	});
	return data;
};

export const getPayments2 = async (query: GetPaymentsQuery) => {
	const { data } = await httpGet<PagedResult<PaymentDto>>('/payments', {
		params: query,
	});
	return data;
};

export const getPaymentById = async (id: string) => {
	const { data } = await httpGet<PaymentDto>(`/payments/${id}`);
	return data;
};

export const createPayment = async (payload: CreatePaymentRequest) => {
	const { data } = await httpPost<{ id: string }>('/payments', payload);
	return data;
};

export const deletePayment = async (id: string) => {
	await httpDelete(`/payments/${id}`);
};

