import { http } from './http';

export type ServiceDto = {
	id: string;
	name: string;
	unitPrice: number;
	unitOfMeasure: string;
	minimumWeight?: number | null;
	minimumPrice?: number | null;
	description: string;
	defaultCode: string;
	active: boolean;
};

export type PagedResult<T> = {
	offset: number;
	limit: number;
	totalItems: number;
	items: T[];
};

export const getServices = async (params: { limit: number; offset: number; search?: string }) => {
	const { data } = await http.get<PagedResult<ServiceDto>>('/services', { params });
	return data;
};

export const getServiceById = async (id: string) => {
	const { data } = await http.get<ServiceDto>(`/services/${id}`);
	return data;
};

export type CreateServiceRequest = {
	name: string;
	unitPrice: number;
	unitOfMeasure?: string;
	minimumWeight?: number | null;
	minimumPrice?: number | null;
	description: string;
	defaultCode?: string; // Optional, sẽ tự sinh ở backend
	active: boolean;
};

export const createService = async (payload: CreateServiceRequest) => {
	await http.post('/services', payload);
};

export type UpdateServiceRequest = {
	id: string;
	name: string;
	unitPrice: number;
	unitOfMeasure?: string;
	minimumWeight?: number | null;
	minimumPrice?: number | null;
	description: string;
	defaultCode?: string; // Optional, không được sửa
	active: boolean;
};

export const updateService = async (id: string, payload: UpdateServiceRequest) => {
	await http.put(`/services/${id}`, payload);
};

export const deleteService = async (id: string) => {
	await http.delete(`/services/${id}`);
};

