import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserInfo = {
	userId: string;
	userName: string;
	email: string;
	companyId: string | null;
	companyName: string;
	isSuperAdmin: boolean;
};

type AuthState = {
	token: string | null;
	userInfo: UserInfo | null;
	setToken: (token: string) => void;
	setUserInfo: (userInfo: UserInfo) => void;
	logout: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			userInfo: null,
			setToken: (token) => set({ token }),
			setUserInfo: (userInfo) => set({ userInfo }),
			logout: () => set({ token: null, userInfo: null }),
		}),
		{
			name: 'laundry-auth',
		}
	)
);


