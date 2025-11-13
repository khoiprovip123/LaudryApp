import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
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
import ProtectedRoute from "./components/ProtectedRoute";
import AppErrorBoundary from "./components/AppErrorBoundary";
import IndexRedirect from "./components/IndexRedirect";
import { useAuthStore } from "./store/auth";
import { getSessionInfoApi } from "./api/auth";

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

const RootApp: React.FC = () => {
  return (
    <ChakraProvider>
      <AppErrorBoundary>
        <BrowserRouter>
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
                <Route path="customers" element={<CustomersList />} />
                <Route path="customers/new" element={<CustomerCreate />} />
                <Route path="customers/:id/edit" element={<CustomerEdit />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SessionLoader>
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
