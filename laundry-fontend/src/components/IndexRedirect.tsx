import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getIsSuperAdminFromToken } from '../utils/jwt';

const IndexRedirect: React.FC = () => {
	return <Navigate to="/dashboard" replace />;
};

export default IndexRedirect;


