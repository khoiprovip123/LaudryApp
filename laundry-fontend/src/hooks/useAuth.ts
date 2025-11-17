import { useAuthStore } from '../store/auth';
import type { Permission } from '../constants/permissions';
import type { Role } from '../constants/roles';

/**
 * Hook để kiểm tra authorization và lấy thông tin user
 */
export const useAuth = () => {
	const userInfo = useAuthStore((s) => s.userInfo);
	const token = useAuthStore((s) => s.token);

	/**
	 * Kiểm tra user có permission không
	 */
	const hasPermission = (permission: Permission | string): boolean => {
		if (!userInfo) return false;
		
		// SuperAdmin có tất cả permissions
		if (userInfo.isSuperAdmin) return true;
		
		// Kiểm tra permissions có tồn tại và là array không
		if (!userInfo.permissions || !Array.isArray(userInfo.permissions)) return false;
		
		return userInfo.permissions.includes(permission);
	};

	/**
	 * Kiểm tra user có một trong các permissions không
	 */
	const hasAnyPermission = (permissions: (Permission | string)[]): boolean => {
		if (!userInfo) return false;
		
		if (userInfo.isSuperAdmin) return true;
		
		// Kiểm tra permissions có tồn tại và là array không
		if (!userInfo.permissions || !Array.isArray(userInfo.permissions)) return false;
		
		return permissions.some(permission => userInfo.permissions.includes(permission));
	};

	/**
	 * Kiểm tra user có tất cả permissions không
	 */
	const hasAllPermissions = (permissions: (Permission | string)[]): boolean => {
		if (!userInfo) return false;
		
		if (userInfo.isSuperAdmin) return true;
		
		// Kiểm tra permissions có tồn tại và là array không
		if (!userInfo.permissions || !Array.isArray(userInfo.permissions)) return false;
		
		return permissions.every(permission => userInfo.permissions.includes(permission));
	};

	/**
	 * Kiểm tra user có role không
	 */
	const hasRole = (role: Role | string): boolean => {
		if (!userInfo) return false;
		
		if (userInfo.isSuperAdmin) return true;
		
		// Kiểm tra roles có tồn tại và là array không
		if (!userInfo.roles || !Array.isArray(userInfo.roles)) return false;
		
		return userInfo.roles.includes(role);
	};

	/**
	 * Kiểm tra user có một trong các roles không
	 */
	const hasAnyRole = (roles: (Role | string)[]): boolean => {
		if (!userInfo) return false;
		
		if (userInfo.isSuperAdmin) return true;
		
		// Kiểm tra roles có tồn tại và là array không
		if (!userInfo.roles || !Array.isArray(userInfo.roles)) return false;
		
		return roles.some(role => userInfo.roles.includes(role));
	};

	/**
	 * Kiểm tra user có company không
	 */
	const hasCompany = (): boolean => {
		return userInfo?.companyId != null;
	};

	return {
		userInfo,
		token,
		isAuthenticated: !!token && !!userInfo,
		isSuperAdmin: userInfo?.isSuperAdmin ?? false,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		hasRole,
		hasAnyRole,
		hasCompany,
	};
};

