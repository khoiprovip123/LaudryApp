import React from 'react';
import { Box, Button, Flex, HStack, Link, Text, Menu, MenuButton, MenuList, MenuItem, Avatar, VStack, Divider } from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getIsSuperAdminFromToken } from '../utils/jwt';
import logo from '../assets/images/logo-vip-main.png';
// @ts-ignore - react-icons sẽ được cài đặt sau
import { FaBuilding, FaUsers, FaSignOutAlt, FaUser, FaChevronDown } from 'react-icons/fa';

const AppLayout: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const logout = useAuthStore((s) => s.logout);
	const token = useAuthStore((s) => s.token);
	const userInfo = useAuthStore((s) => s.userInfo);
	const isSuperAdmin = token ? getIsSuperAdminFromToken(token) : false;

	// Kiểm tra route active
	const isCompaniesActive = location.pathname.startsWith('/companies');
	const isCustomersActive = location.pathname.startsWith('/customers');

	const handleLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	return (
		<Flex height="100vh" overflow="hidden" bg="gray.50">
			<Box w="30vh" bg="white" borderRight="1px solid" className='flex flex-col' borderColor="gray.200" p={4}>
				<div className='flex items-center gap-1 justify-center mb-4'>
				<img src={logo} alt="logo" className="w-20" />
				<div className='flex flex-col items-center justify-center'>
					<div className='font-bold text-[30px]'>KLaundry</div>
					{/* <div className='text-[12px] text-gray-500'>Laundry {isSuperAdmin ? 'Admin' : 'management'}</div> */}
				</div>
				{/* <div className='font-bold text-[20px]'>
					KLaundry 
				</div> */}
				</div>
				{/* menu */}
				<Box>
					{isSuperAdmin && (
						<Link 
							as={RouterLink} 
							to="/companies" 
							display="flex" 
							alignItems="center" 
							gap={2} 
							p={2} 
							borderRadius="md"
							bg={isCompaniesActive ? 'blue.50' : 'transparent'}
							color={isCompaniesActive ? 'blue.600' : 'gray.700'}
							borderLeft={isCompaniesActive ? '3px solid' : '3px solid transparent'}
							borderLeftColor={isCompaniesActive ? 'blue.500' : 'transparent'}
							_hover={{ bg: isCompaniesActive ? 'blue.50' : 'gray.100' }}
							fontWeight={isCompaniesActive ? 'semibold' : 'normal'}
						>
							<FaBuilding size={18} />
							<div>Cửa hàng</div>
						</Link>
					)}
					{!isSuperAdmin && (
						<Link 
							as={RouterLink} 
							to="/customers" 
							display="flex" 
							alignItems="center" 
							gap={2} 
							p={2} 
							borderRadius="md"
							bg={isCustomersActive ? 'blue.50' : 'transparent'}
							color={isCustomersActive ? 'blue.600' : 'gray.700'}
							borderLeft={isCustomersActive ? '3px solid' : '3px solid transparent'}
							borderLeftColor={isCustomersActive ? 'blue.500' : 'transparent'}
							_hover={{ bg: isCustomersActive ? 'blue.50' : 'gray.100' }}
							fontWeight={isCustomersActive ? 'semibold' : 'normal'}
						>
							<FaUsers size={18} />
							<div>Khách hàng</div>
						</Link>
					)}
				</Box>
			</Box>
			<Flex flex="1" direction="column" overflow="hidden">
				<div className='border-b border-gray-200 flex justify-end items-center p-2'>
					{userInfo && (
						<Menu>
							<MenuButton
								as={Button}
								rightIcon={<FaChevronDown size={12} />}
								variant="ghost"
								_focus={{ boxShadow: 'none', outline: 'none' }}
								_active={{ bg: 'gray.100' }}
								_hover={{ bg: 'gray.100' }}
							>
								<HStack className='p-1 gap-2'>
									<Avatar size="sm" name={userInfo.userName} bg="blue.500" />
									<VStack spacing={0} align="start">
										<Text fontSize="sm" color="gray.700" fontWeight="medium" lineHeight="1.2">
											{userInfo.userName}
										</Text>
										{userInfo.email && (
											<Text fontSize="xs" color="gray.500" lineHeight="1.2">
												{userInfo.email}
											</Text>
										)}
									</VStack>
								</HStack>
							</MenuButton>
							<MenuList minW="200px" border="1px solid" borderColor="gray.200" boxShadow="md">
								<Box px={4} py={3}>
									<VStack spacing={1} align="start">
										<Text fontSize="sm" fontWeight="bold" color="gray.700">
											{userInfo.userName}
										</Text>
										{userInfo.email && (
											<Text fontSize="xs" color="gray.500">
												{userInfo.email}
											</Text>
										)}
										{userInfo.companyName && (
											<Text fontSize="xs" color="gray.500">
												Cửa hàng: {userInfo.companyName}
											</Text>
										)}
									</VStack>
								</Box>
								<Divider />
								<MenuItem
									icon={<FaSignOutAlt />}
									onClick={handleLogout}
									color="red.500"
									_hover={{ bg: 'red.50' }}
									_focus={{ bg: 'red.50', boxShadow: 'none', outline: 'none' }}
									_active={{ bg: 'red.100' }}
								>
									Đăng xuất
								</MenuItem>
							</MenuList>
						</Menu>
					)}
				</div>
				<Box as="main" className='h-full' overflow="auto">
					<Outlet />
				</Box>
			</Flex>
		</Flex>
	);
};

export default AppLayout;


