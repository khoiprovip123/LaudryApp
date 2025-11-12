import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

type Props = {
	children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
	const token = useAuthStore((s) => s.token);
	const location = useLocation();

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}
	return <>{children}</>;
};

export default ProtectedRoute;


