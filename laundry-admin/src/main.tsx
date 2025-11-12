import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import CompaniesList from './pages/companies/List';
import CompanyCreate from './pages/companies/Create';
import CompanyEdit from './pages/companies/Edit';
import CustomersList from './pages/customers/List';
import CustomerCreate from './pages/customers/Create';
import CustomerEdit from './pages/customers/Edit';
import ProtectedRoute from './components/ProtectedRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import IndexRedirect from './components/IndexRedirect';

const RootApp: React.FC = () => {
	return (
		<ChakraProvider>
			<AppErrorBoundary>
				<BrowserRouter>
					<Routes>
						<Route path="/login" element={<Login />} />

						<Route
							path="/"
							element={
								<ProtectedRoute>
									<AppLayout />
								</ProtectedRoute>
							}
						>
							<Route index element={<IndexRedirect />} />
							<Route path="companies" element={<CompaniesList />} />
							<Route path="companies/new" element={<CompanyCreate />} />
							<Route path="companies/:id/edit" element={<CompanyEdit />} />
							<Route path="customers" element={<CustomersList />} />
							<Route path="customers/new" element={<CustomerCreate />} />
							<Route path="customers/:id/edit" element={<CustomerEdit />} />
						</Route>

						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</BrowserRouter>
			</AppErrorBoundary>
		</ChakraProvider>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RootApp />
	</React.StrictMode>
);


