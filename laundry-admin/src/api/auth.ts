import { http } from './http';

export type LoginRequest = {
	userName: string;
	password: string;
};

export type LoginResponse = {
	succeeded: boolean;
	message: string;
	token: string;
};

export type SessionInfoResponse = {
	userId: string;
	userName: string;
	email: string;
	companyId: string | null;
	companyName: string;
	isSuperAdmin: boolean;
};

export const loginApi = async (payload: LoginRequest) => {
	const { data } = await http.post<LoginResponse>('/auth/login', payload);
	return data;
};

export const getSessionInfoApi = async (): Promise<SessionInfoResponse> => {
	const { data } = await http.get<SessionInfoResponse>('/auth/session');
	return data;
};


