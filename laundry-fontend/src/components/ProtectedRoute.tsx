import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Permission } from '../constants/permissions';
import type { Role } from '../constants/roles';

type Props = {
	children: React.ReactNode;
	requireSuperAdmin?: boolean;
	requirePermission?: Permission | string;
	requireAnyPermission?: (Permission | string)[];
	requireRole?: Role | string;
	requireAnyRole?: (Role | string)[];
	requireCompany?: boolean;
};

const ProtectedRoute: React.FC<Props> = ({ 
	children, 
	requireSuperAdmin = false,
	requirePermission,
	requireAnyPermission,
	requireRole,
	requireAnyRole,
	requireCompany = false,
}) => {
	const { isAuthenticated, isSuperAdmin, hasPermission, hasAnyPermission, hasRole, hasAnyRole, hasCompany } = useAuth();
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	// Kiểm tra quyền super admin nếu route yêu cầu
	if (requireSuperAdmin && !isSuperAdmin) {
		return <Navigate to="/" replace />;
	}

	// Kiểm tra permission cụ thể
	if (requirePermission && !hasPermission(requirePermission)) {
		return <Navigate to="/unauthorized" replace />;
	}

	// Kiểm tra một trong các permissions
	if (requireAnyPermission && !hasAnyPermission(requireAnyPermission)) {
		return <Navigate to="/unauthorized" replace />;
	}

	// Kiểm tra role cụ thể
	if (requireRole && !hasRole(requireRole)) {
		return <Navigate to="/unauthorized" replace />;
	}

	// Kiểm tra một trong các roles
	if (requireAnyRole && !hasAnyRole(requireAnyRole)) {
		return <Navigate to="/unauthorized" replace />;
	}

	// Kiểm tra company
	if (requireCompany && !hasCompany()) {
		return <Navigate to="/unauthorized" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;


