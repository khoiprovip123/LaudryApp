import React from 'react';
import { Box, Button, Flex, HStack, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getCompanyIdFromToken, getIsSuperAdminFromToken } from '../utils/jwt';

const AppLayout: React.FC = () => {
	const navigate = useNavigate();
	const logout = useAuthStore((s) => s.logout);
	const token = useAuthStore((s) => s.token);
	const companyId = token ? getCompanyIdFromToken(token) : null;
	const isSuperAdmin = token ? getIsSuperAdminFromToken(token) : false;

	const handleLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	return (
		<Flex height="100vh" overflow="hidden" bg="gray.50">
			<Box w="260px" bg="white" borderRight="1px solid" borderColor="gray.200" p={4}>
				<Text fontWeight="bold" mb={6}>
					Laundry {isSuperAdmin ? 'Admin' : 'Store'}
				</Text>
				<Box>
					{isSuperAdmin && (
						<Link as={RouterLink} to="/companies" display="block" p={2} borderRadius="md" _hover={{ bg: 'gray.100' }}>
							Companies
						</Link>
					)}
					{!isSuperAdmin && (
						<Link as={RouterLink} to="/customers" display="block" p={2} borderRadius="md" _hover={{ bg: 'gray.100' }}>
							Customers
						</Link>
					)}
				</Box>
			</Box>
			<Flex flex="1" direction="column" overflow="hidden">
				<Flex as="header" bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={2} align="center" justify="space-between">
					<HStack spacing={3}>
						<Text fontSize="sm" color="gray.500">
							Quản trị
						</Text>
					</HStack>
					<Button size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</Flex>
				<Box as="main" p={6} overflow="auto">
					<Outlet />
				</Box>
			</Flex>
		</Flex>
	);
};

export default AppLayout;


