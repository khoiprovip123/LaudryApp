import { httpGet, httpPost, httpPut, httpDelete } from './http';

export type CustomerDto = {
	id: string;
	name: string;
	ref: string;
	displayName?: string | null;
	phone: string;
	phoneLastThreeDigits?: string | null;
	address?: string | null;
	active: boolean;
	notes?: string | null;
	cityCode?: string | null;
	cityName?: string | null;
	districtCode?: string | null;
	districtName?: string | null;
	wardCode?: string | null;
	wardName?: string | null;
};

export type PagedResult<T> = {
	offset: number;
	limit: number;
	totalItems: number;
	items: T[];
};

export const getCustomers = async (params: { limit: number; offset: number; search?: string }) => {
	const { data } = await httpGet<PagedResult<CustomerDto>>('/partners', { params });
	return data;
};

export const getCustomerById = async (id: string) => {
	const { data } = await httpGet<CustomerDto>(`/partners/${id}`);
	return data;
};

export type CreateCustomerRequest = {
	name: string;
	phone: string;
	phoneLastThreeDigits?: string | null;
	address?: string | null;
	cityCode?: string | null;
	cityName?: string | null;
	districtCode?: string | null;
	districtName?: string | null;
	wardCode?: string | null;
	wardName?: string | null;
	companyId?: string | null;
	isCompany?: boolean;
};

export const createCustomer = async (payload: CreateCustomerRequest) => {
	await httpPost('/partners', { ...payload, isCompany: false });
};

export type UpdateCustomerRequest = {
	id: string;
	name: string;
	phone: string;
	phoneLastThreeDigits?: string | null;
	address?: string | null;
	cityCode?: string | null;
	cityName?: string | null;
	districtCode?: string | null;
	districtName?: string | null;
	wardCode?: string | null;
	wardName?: string | null;
	active: boolean;
};

export const updateCustomer = async (id: string, payload: UpdateCustomerRequest) => {
	await httpPut(`/partners/${id}`, payload);
};

export const deleteCustomer = async (id: string) => {
	await httpDelete(`/partners/${id}`);
};


