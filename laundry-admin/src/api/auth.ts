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

export const loginApi = async (payload: LoginRequest) => {
	const { data } = await http.post<LoginResponse>('/auth/login', payload);
	return data;
};


