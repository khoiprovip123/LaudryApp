import { http } from './http';
import type { PagedResult } from './companies';

export type PermissionGroupDto = {
	id: string;
	name: string;
	description: string;
	companyId: string | null;
	companyName: string;
	permissions: string[];
	active: boolean;
	employeeCount: number;
};

export type GetPermissionGroupsQuery = {
	limit?: number;
	offset?: number;
	companyId?: string;
};

export type CreatePermissionGroupRequest = {
	name: string;
	description: string;
	companyId?: string | null;
	permissions: string[];
	active: boolean;
};

export type UpdatePermissionGroupRequest = {
	id: string;
	name: string;
	description: string;
	permissions: string[];
	active: boolean;
};

export type AddEmployeesToPermissionGroupRequest = {
	permissionGroupId: string;
	employeeIds: string[];
};

export type RemoveEmployeesFromPermissionGroupRequest = {
	permissionGroupId: string;
	employeeIds: string[];
};

export const getPermissionGroups = async (query: GetPermissionGroupsQuery) => {
	const { data } = await http.get<PagedResult<PermissionGroupDto>>('/permissiongroups', {
		params: query,
	});
	return data;
};

export const getPermissionGroupById = async (id: string) => {
	const { data } = await http.get<PermissionGroupDto>(`/permissiongroups/${id}`);
	return data;
};

export const getEmployeesByPermissionGroup = async (id: string) => {
	const { data } = await http.get(`/permissiongroups/${id}/employees`);
	return data;
};

export const createPermissionGroup = async (payload: CreatePermissionGroupRequest) => {
	const { data } = await http.post<{ id: string }>('/permissiongroups', payload);
	return data;
};

export const updatePermissionGroup = async (id: string, payload: UpdatePermissionGroupRequest) => {
	await http.put(`/permissiongroups/${id}`, payload);
};

export const deletePermissionGroup = async (id: string) => {
	await http.delete(`/permissiongroups/${id}`);
};

export const addEmployeesToPermissionGroup = async (id: string, payload: AddEmployeesToPermissionGroupRequest) => {
	await http.post(`/permissiongroups/${id}/employees`, payload);
};

export const removeEmployeesFromPermissionGroup = async (id: string, payload: RemoveEmployeesFromPermissionGroupRequest) => {
	await http.delete(`/permissiongroups/${id}/employees`, { data: payload });
};

