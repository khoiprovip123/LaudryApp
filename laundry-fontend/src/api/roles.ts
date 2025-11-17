import { http } from './http';

export type PermissionDto = {
	code: string;
	name: string;
	category: string;
	description: string;
};

export type RoleDto = {
	name: string;
	displayName: string;
	description: string;
	permissions: string[];
};

export const getAllPermissions = async (): Promise<PermissionDto[]> => {
	const { data } = await http.get<PermissionDto[]>('/roles/permissions');
	return data;
};

export const getAllRoles = async (): Promise<RoleDto[]> => {
	const { data } = await http.get<RoleDto[]>('/roles');
	return data;
};

export const getRolePermissions = async (roleName: string): Promise<string[]> => {
	const { data } = await http.get<string[]>(`/roles/${roleName}/permissions`);
	return data;
};

