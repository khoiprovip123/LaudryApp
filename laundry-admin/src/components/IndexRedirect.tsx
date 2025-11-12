import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getIsSuperAdminFromToken } from '../utils/jwt';

const IndexRedirect: React.FC = () => {
	const token = useAuthStore((s) => s.token);
	const isSuperAdmin = token ? getIsSuperAdminFromToken(token) : false;
	return <Navigate to={isSuperAdmin ? 'companies' : 'customers'} replace />;
};

export default IndexRedirect;


