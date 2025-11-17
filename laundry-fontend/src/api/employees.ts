import { http } from './http';
import type { PagedResult } from './companies';

export type EmployeeDto = {
	id: string;
	userName: string;
	email: string;
	phoneNumber: string;
	companyId: string | null;
	companyName: string;
	isUserRoot: boolean;
	active: boolean;
	roles: string[];
};

export type GetEmployeesQuery = {
	limit?: number;
	offset?: number;
	companyId?: string;
};

export type CreateEmployeeRequest = {
	userName: string;
	email: string;
	phoneNumber: string;
	password: string;
	companyId?: string | null;
	active: boolean;
};

export type UpdateEmployeeRequest = {
	id: string;
	email: string;
	phoneNumber: string;
	active: boolean;
};

export const getEmployees = async (query: GetEmployeesQuery) => {
	const { data } = await http.get<PagedResult<EmployeeDto>>('/employees', {
		params: query,
	});
	return data;
};

export const getEmployeeById = async (id: string) => {
	const { data } = await http.get<EmployeeDto>(`/employees/${id}`);
	return data;
};

export const createEmployee = async (payload: CreateEmployeeRequest) => {
	const { data } = await http.post<{ id: string }>('/employees', payload);
	return data;
};

export const updateEmployee = async (id: string, payload: UpdateEmployeeRequest) => {
	await http.put(`/employees/${id}`, payload);
};

export const deleteEmployee = async (id: string) => {
	await http.delete(`/employees/${id}`);
};

