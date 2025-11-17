import React from 'react';
import { Button, type ButtonProps } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import type { Permission } from '../constants/permissions';
import type { Role } from '../constants/roles';

interface ProtectedButtonProps extends ButtonProps {
	permission?: Permission | string;
	anyPermission?: (Permission | string)[];
	role?: Role | string;
	anyRole?: (Role | string)[];
	requireCompany?: boolean;
	hideIfNoPermission?: boolean; // Ẩn button nếu không có quyền (default: true)
	disabledIfNoPermission?: boolean; // Disable button nếu không có quyền
	children: React.ReactNode;
}

/**
 * Button component chỉ hiển thị hoặc enable khi user có quyền
 */
export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
	permission,
	anyPermission,
	role,
	anyRole,
	requireCompany = false,
	hideIfNoPermission = true,
	disabledIfNoPermission = false,
	children,
	...buttonProps
}) => {
	const { hasPermission, hasAnyPermission, hasRole, hasAnyRole, hasCompany } = useAuth();

	// Kiểm tra quyền
	let hasAccess = true;

	if (permission && !hasPermission(permission)) {
		hasAccess = false;
	}

	if (anyPermission && !hasAnyPermission(anyPermission)) {
		hasAccess = false;
	}

	if (role && !hasRole(role)) {
		hasAccess = false;
	}

	if (anyRole && !hasAnyRole(anyRole)) {
		hasAccess = false;
	}

	if (requireCompany && !hasCompany()) {
		hasAccess = false;
	}

	// Ẩn button nếu không có quyền và hideIfNoPermission = true
	if (!hasAccess && hideIfNoPermission) {
		return null;
	}

	// Disable button nếu không có quyền
	const isDisabled = (!hasAccess && disabledIfNoPermission) || buttonProps.isDisabled;

	return (
		<Button {...buttonProps} isDisabled={isDisabled}>
			{children}
		</Button>
	);
};

