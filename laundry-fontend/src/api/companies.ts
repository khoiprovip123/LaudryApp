import { http } from './http';

export type CompanyDto = {
	id: string;
	companyName: string;
	ownerName: string;
	phone: string;
	subscriptionStartDate: string;
	periodLockDate?: string | null;
	active: boolean;
};

export type PagedResult<T> = {
	offset: number;
	limit: number;
	totalItems: number;
	items: T[];
};

export type GetCompaniesQuery = {
	limit: number;
	offset: number;
};

export type CreateCompanyRequest = {
	companyName: string;
	ownerName: string;
	userName: string;
	password: string;
	phone: string;
	subscriptionStartDate: string;
	periodLockDate?: string | null;
	active: boolean;
	isActive: boolean;
};

export type UpdateCompanyRequest = {
	id: string;
	companyName: string;
	ownerName: string;
	phone: string;
	subscriptionStartDate: string;
	periodLockDate?: string | null;
	active: boolean;
};

export const getCompanies = async (query: GetCompaniesQuery) => {
	const { data } = await http.get<PagedResult<CompanyDto>>('/companies', {
		params: query,
	});
	return data;
};

export const getCompanyById = async (id: string) => {
	const { data } = await http.get<CompanyDto>(`/companies/${id}`);
	return data;
};

export const createCompany = async (payload: CreateCompanyRequest) => {
	await http.post('/companies', payload);
};

export const updateCompany = async (id: string, payload: UpdateCompanyRequest) => {
	await http.put(`/companies/${id}`, payload);
};

export const deleteCompany = async (id: string) => {
	await http.delete(`/companies/${id}`);
};


