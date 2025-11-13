import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getIsSuperAdminFromToken } from '../utils/jwt';

type Props = {
	children: React.ReactNode;
	requireSuperAdmin?: boolean;
};

const ProtectedRoute: React.FC<Props> = ({ children, requireSuperAdmin = false }) => {
	const token = useAuthStore((s) => s.token);
	const location = useLocation();

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	// Kiểm tra quyền super admin nếu route yêu cầu
	if (requireSuperAdmin) {
		const isSuperAdmin = token ? getIsSuperAdminFromToken(token) : false;
		if (!isSuperAdmin) {
			// Redirect về trang chủ nếu không phải super admin
			return <Navigate to="/" replace />;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;


