import React, { useState } from 'react';
import { Box, Button, Flex, HStack, Link, Text, Menu, MenuButton, MenuList, MenuItem, Avatar, VStack, Divider, IconButton, useBreakpointValue, Collapse } from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getIsSuperAdminFromToken } from '../utils/jwt';
import logo from '../assets/images/logo-vip-main.png';
import { HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
// @ts-ignore - react-icons sẽ được cài đặt sau
import { FaBuilding, FaUsers, FaSignOutAlt, FaUser, FaChevronDown, FaList } from 'react-icons/fa';

const AppLayout: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const logout = useAuthStore((s) => s.logout);
	const token = useAuthStore((s) => s.token);
	const userInfo = useAuthStore((s) => s.userInfo);
	const isSuperAdmin = token ? getIsSuperAdminFromToken(token) : false;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isCatalogOpen, setIsCatalogOpen] = useState(false);

	// Kiểm tra route active
	const isCompaniesActive = location.pathname.startsWith('/companies');
	const isCustomersActive = location.pathname.startsWith('/customers');
	const isServicesActive = location.pathname.startsWith('/services');
	
	// Tự động mở menu Danh mục nếu đang ở trang dịch vụ
	React.useEffect(() => {
		if (isServicesActive) {
			setIsCatalogOpen(true);
		}
	}, [isServicesActive]);

	// Responsive: trên mobile menu sẽ ẩn mặc định
	const isMobile = useBreakpointValue({ base: true, md: false });

	const handleLogout = () => {
		logout();
		navigate('/login', { replace: true });
	};

	const handleMenuLinkClick = () => {
		// Đóng menu khi click vào link trên mobile
		if (isMobile) {
			setIsMenuOpen(false);
		}
	};

	return (
		<Flex height="100vh" overflow="hidden" bg="gray.50" position="relative">
			{/* Overlay cho mobile */}
			{isMobile && isMenuOpen && (
				<Box
					position="fixed"
					top={0}
					left={0}
					right={0}
					bottom={0}
					bg="blackAlpha.600"
					zIndex={998}
					onClick={() => setIsMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<Box
				w={{ base: '280px', md: '30vh' }}
				bg="white"
				borderRight="1px solid"
				className='flex flex-col'
				borderColor="gray.200"
				p={4}
				position={{ base: 'fixed', md: 'relative' }}
				left={{ base: isMenuOpen ? 0 : '-280px', md: 0 }}
				top={0}
				bottom={0}
				zIndex={999}
				transition="left 0.3s ease"
				overflowY="auto"
				overflowX="hidden"
			>
				<div className='flex items-center gap-1 justify-center mb-4'>
					<img src={logo} alt="logo" className="w-20 max-w-full" />
					<div className='flex flex-col items-center justify-center'>
						<div className='font-bold text-xl md:text-[30px] whitespace-nowrap'>KLaundry</div>
					</div>
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
							onClick={handleMenuLinkClick}
							whiteSpace="nowrap"
							overflow="hidden"
							textOverflow="ellipsis"
						>
							<Box flexShrink={0}>
								<FaBuilding size={18} />
							</Box>
							<div className="truncate">Cửa hàng</div>
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
							onClick={handleMenuLinkClick}
							whiteSpace="nowrap"
							overflow="hidden"
							textOverflow="ellipsis"
						>
							<Box flexShrink={0}>
								<FaUsers size={18} />
							</Box>
							<div className="truncate">Khách hàng</div>
						</Link>
					)}
					
					{/* Menu Danh mục với submenu */}
					<Box>
						<Button
							w="100%"
							justifyContent="flex-start"
							leftIcon={<FaList size={18} />}
							rightIcon={isCatalogOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
							onClick={() => setIsCatalogOpen(!isCatalogOpen)}
							p={2}
							borderRadius="md"
							bg={isServicesActive ? 'blue.50' : 'transparent'}
							color={isServicesActive ? 'blue.600' : 'gray.700'}
							borderLeft={isServicesActive ? '3px solid' : '3px solid transparent'}
							borderLeftColor={isServicesActive ? 'blue.500' : 'transparent'}
							_hover={{ bg: isServicesActive ? 'blue.50' : 'gray.100' }}
							fontWeight={isServicesActive ? 'semibold' : 'normal'}
							variant="ghost"
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							<div className="truncate flex-1 text-left">Danh mục</div>
						</Button>
						<Collapse in={isCatalogOpen} animateOpacity>
							<Box pl={6} mt={1}>
								<Link 
									as={RouterLink} 
									to="/services" 
									display="flex" 
									alignItems="center" 
									gap={2} 
									p={2} 
									borderRadius="md"
									bg={isServicesActive ? 'blue.50' : 'transparent'}
									color={isServicesActive ? 'blue.600' : 'gray.700'}
									borderLeft={isServicesActive ? '3px solid' : '3px solid transparent'}
									borderLeftColor={isServicesActive ? 'blue.500' : 'transparent'}
									_hover={{ bg: isServicesActive ? 'blue.50' : 'gray.100' }}
									fontWeight={isServicesActive ? 'semibold' : 'normal'}
									onClick={handleMenuLinkClick}
									whiteSpace="nowrap"
									overflow="hidden"
									textOverflow="ellipsis"
								>
									<div className="truncate">Dịch vụ</div>
								</Link>
							</Box>
						</Collapse>
					</Box>
				</Box>
			</Box>

			<Flex flex="1" direction="column" overflow="hidden" ml={{ base: 0, md: 0 }}>
				<div className='border-b border-gray-200 flex justify-between items-center p-2'>
					{/* Hamburger button cho mobile */}
					{isMobile && (
						<IconButton
							aria-label="Toggle menu"
							icon={isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
							variant="ghost"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						/>
					)}
					{/* Spacer để đẩy user menu sang phải */}
					{!isMobile && <Box />}
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
									<Avatar size="sm" name={userInfo.userName} bg="blue.500" flexShrink={0} />
									<VStack spacing={0} align="start" display={{ base: 'none', sm: 'flex' }}>
										<Text fontSize="sm" color="gray.700" fontWeight="medium" lineHeight="1.2" noOfLines={1}>
											{userInfo.userName}
										</Text>
										{userInfo.email && (
											<Text fontSize="xs" color="gray.500" lineHeight="1.2" noOfLines={1} maxW="150px">
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


