import { httpGet, httpPost, httpPut, httpDelete } from './http';

export type OrderDto = {
	id: string;
	code: string;
	partnerId: string;
	partnerName: string;
	partnerRef: string;
	partnerDisplayName?: string | null;
	partnerPhone?: string | null;
	totalAmount: number;
	paidAmount: number;
	remainingAmount: number;
	status: string;
	paymentStatus?: string;
	notes?: string | null;
	dateCreated: string;
	dateUpdated?: string | null;
	createdBy?: string | null;
	updatedBy?: string | null;
	orderItems: OrderItemDto[];
};

export type OrderItemDto = {
	id: string;
	orderId: string;
	serviceId: string;
	serviceName: string;
	serviceCode: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
};

export type PagedResult<T> = {
	offset: number;
	limit: number;
	totalItems: number;
	items: T[];
};

export type GetOrdersQuery = {
	limit?: number;
	offset?: number;
	partnerId?: string;
	search?: string;
	status?: string;
	dateFrom?: string;
	dateTo?: string;
};

export type CreateOrderRequest = {
	partnerId: string;
	orderItems: CreateOrderItemRequest[];
	notes?: string | null;
};

export type CreateOrderItemRequest = {
	serviceId: string;
	quantity: number;
	unitPrice: number;
};

export type UpdateOrderRequest = {
	id: string;
	partnerId?: string;
	orderItems?: CreateOrderItemRequest[];
	notes?: string | null;
	status?: string;
};

export const getOrders = async (query: GetOrdersQuery) => {
	const { data } = await httpGet<PagedResult<OrderDto>>('/orders', {
		params: query,
	});
	return data;
};

export const getOrderById = async (id: string) => {
	const { data } = await httpGet<OrderDto>(`/orders/${id}`);
	return data;
};

export const createOrder = async (payload: CreateOrderRequest) => {
	const { data } = await httpPost<{ id: string }>('/orders', payload);
	return data;
};

export const updateOrder = async (id: string, payload: UpdateOrderRequest) => {
	await httpPut(`/orders/${id}`, payload);
};

export const deleteOrder = async (id: string) => {
	await httpDelete(`/orders/${id}`);
};

export const updateOrderStatus = async (orderId: string, status: string) => {
	await httpPut(`/orders/${orderId}/status`, { orderId, status });
};

