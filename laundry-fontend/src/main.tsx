import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, useToast } from "@chakra-ui/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./style.css";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import CompaniesList from "./pages/companies/List";
import CompanyCreate from "./pages/companies/Create";
import CompanyEdit from "./pages/companies/Edit";
import CustomersList from "./pages/customers/List";
import CustomerCreate from "./pages/customers/Create";
import CustomerEdit from "./pages/customers/Edit";
import CustomerDetail from "./pages/customers/Detail";
import ServicesList from "./pages/services/List";
import ServiceCreate from "./pages/services/Create";
import ServiceEdit from "./pages/services/Edit";
import OrderCreate from "./pages/orders/Create";
import OrdersList from "./pages/orders/List";
import OrderDetail from "./pages/orders/Detail";
import EmployeesList from "./pages/employees/List";
import EmployeeCreate from "./pages/employees/Create";
import EmployeeEdit from "./pages/employees/Edit";
import PermissionGroupsList from "./pages/permissionGroups/List";
import PermissionGroupCreate from "./pages/permissionGroups/Create";
import PermissionGroupEdit from "./pages/permissionGroups/Edit";
import ManageEmployees from "./pages/permissionGroups/ManageEmployees";
import ProtectedRoute from "./components/ProtectedRoute";
import AppErrorBoundary from "./components/AppErrorBoundary";
import IndexRedirect from "./components/IndexRedirect";
import { useAuthStore } from "./store/auth";
import { useToastStore } from "./store/toast";
import { getSessionInfoApi } from "./api/auth";
import { Permissions } from "./constants/permissions";

const SessionLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const token = useAuthStore((s) => s.token);
	const setUserInfo = useAuthStore((s) => s.setUserInfo);

	useEffect(() => {
		const loadSession = async () => {
			if (token) {
				try {
					const sessionInfo = await getSessionInfoApi();
					setUserInfo({
						userId: sessionInfo.userId,
						userName: sessionInfo.userName,
						email: sessionInfo.email,
						companyId: sessionInfo.companyId || null,
						companyName: sessionInfo.companyName,
						isSuperAdmin: sessionInfo.isSuperAdmin,
						roles: sessionInfo.roles || [],
						permissions: sessionInfo.permissions || [],
					});
				} catch (error) {
					console.error("Failed to load session:", error);
					// Nếu không load được session, có thể token đã hết hạn
				}
			}
		};

		loadSession();
	}, [token, setUserInfo]);

	return <>{children}</>;
};

const ToastInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const toast = useToast();
	const setToast = useToastStore((s) => s.setToast);

	useEffect(() => {
		setToast(toast);
	}, [toast, setToast]);

	return <>{children}</>;
};

const RootApp: React.FC = () => {
  return (
    <ChakraProvider>
      <AppErrorBoundary>
        <BrowserRouter>
          <ToastInitializer>
            <SessionLoader>
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
                <Route 
                  path="companies" 
                  element={
                    <ProtectedRoute requireSuperAdmin={true}>
                      <CompaniesList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="companies/new" 
                  element={
                    <ProtectedRoute requireSuperAdmin={true}>
                      <CompanyCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="companies/:id/edit" 
                  element={
                    <ProtectedRoute requireSuperAdmin={true}>
                      <CompanyEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="customers" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Partners_View}>
                      <CustomersList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="customers/new" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Partners_Create}>
                      <CustomerCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="customers/:id/edit" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Partners_Update}>
                      <CustomerEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="customers/:id" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Partners_View}>
                      <CustomerDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="services" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Services_View}>
                      <ServicesList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="services/new" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Services_Create}>
                      <ServiceCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="services/:id/edit" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Services_Update}>
                      <ServiceEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="orders" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Orders_View}>
                      <OrdersList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="orders/new" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Orders_Create}>
                      <OrderCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="orders/:id" 
                  element={
                    <ProtectedRoute requirePermission={Permissions.Orders_View}>
                      <OrderDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="employees" 
                  element={
                    <ProtectedRoute requireAnyPermission={[Permissions.Companies_View]}>
                      <EmployeesList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="employees/new" 
                  element={
                    <ProtectedRoute requireAnyPermission={[Permissions.Companies_View]}>
                      <EmployeeCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="employees/:id/edit" 
                  element={
                    <ProtectedRoute requireAnyPermission={[Permissions.Companies_View]}>
                      <EmployeeEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="permission-groups" 
                  element={
                    <ProtectedRoute requireAnyPermission={[Permissions.Companies_View]}>
                      <PermissionGroupsList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="permission-groups/new" 
                  element={
                    <ProtectedRoute requireAnyPermission={[Permissions.Companies_View]}>
                      <PermissionGroupCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="permission-groups/:id/edit" 
                  element={
                    <ProtectedRoute requireAnyPermission={[Permissions.Companies_View]}>
                      <PermissionGroupEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="permission-groups/:id/employees" 
                  element={
                    <ProtectedRoute requireAnyPermission={[Permissions.Companies_View]}>
                      <ManageEmployees />
                    </ProtectedRoute>
                  } 
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SessionLoader>
          </ToastInitializer>
        </BrowserRouter>
      </AppErrorBoundary>
    </ChakraProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
