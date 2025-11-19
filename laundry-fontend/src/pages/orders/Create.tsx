import React, { useEffect, useState, useMemo } from 'react';
import {
	Box,
	Button,
	Flex,
	Heading,
	Spinner,
	useToast,
	Card,
	CardBody,
	VStack,
	HStack,
	Text,
	IconButton,
	Avatar,
	Textarea,
	SimpleGrid,
	Input,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Stack,
	Switch,
	useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
// @ts-ignore
import { FaUser, FaList, FaFilter, FaPlus, FaChevronDown, FaExchangeAlt } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { getServices } from '../../api/services';
import { getCustomers, getCustomerById, createCustomer } from '../../api/customers';
import type { CreateCustomerRequest } from '../../api/customers';
import { createOrder } from '../../api/orders';
import type { ServiceDto } from '../../api/services';
import type { CustomerDto } from '../../api/customers';
import SearchInput from '../../components/SearchInput';

type SelectedService = {
	service: ServiceDto;
	quantity: number;
	customPrice?: number; // Giá tùy chỉnh, nếu không có thì dùng service.unitPrice
};

type OrderTab = {
	id: string;
	name: string;
	selectedServices: SelectedService[];
	selectedCustomer: CustomerDto | null;
	orderNotes: string;
	customerSearch: string;
};

// Lấy giá của dịch vụ (ưu tiên customPrice nếu có)
const getServicePrice = (item: SelectedService): number => {
	return item.customPrice !== undefined ? item.customPrice : item.service.unitPrice;
};

const OrderCreate: React.FC = () => {
	const [searchParams] = useSearchParams();
	const customerIdFromUrl = searchParams.get('customerId');
	
	const [services, setServices] = useState<ServiceDto[]>([]);
	const [tabs, setTabs] = useState<OrderTab[]>([
		{
			id: '1',
			name: 'Đặt hàng 1',
			selectedServices: [],
			selectedCustomer: null,
			orderNotes: '',
			customerSearch: '',
		},
	]);
	const [activeTabId, setActiveTabId] = useState<string>('1');
	const [customers, setCustomers] = useState<CustomerDto[]>([]);
	const [serviceSearch, setServiceSearch] = useState('');
	const [loadingServices, setLoadingServices] = useState(false);
	const [loadingCustomers, setLoadingCustomers] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [servicesPerPage] = useState(12);
	const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
	const customerDropdownRef = React.useRef<HTMLDivElement>(null);
	const [leftColumnWidth, setLeftColumnWidth] = useState(400); // Width mặc định cho cột trái
	const [isResizing, setIsResizing] = useState(false);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const toast = useToast();
	
	// Modal tạo khách hàng mới
	const { isOpen: isCreateCustomerOpen, onOpen: onCreateCustomerOpen, onClose: onCreateCustomerClose } = useDisclosure();
	const [newCustomerForm, setNewCustomerForm] = useState<CreateCustomerRequest>({
		name: '',
		phone: '',
		phoneLastThreeDigits: '',
		address: '',
		isCompany: false,
	});
	const [newCustomerActive, setNewCustomerActive] = useState(true);
	const [creatingCustomer, setCreatingCustomer] = useState(false);

	// Lấy tab hiện tại
	const activeTab = useMemo(() => {
		return tabs.find(tab => tab.id === activeTabId) || tabs[0];
	}, [tabs, activeTabId]);

	// Load services
	const loadServices = async () => {
		setLoadingServices(true);
		try {
			const res = await getServices({
				limit: 1000,
				offset: 0,
				search: serviceSearch || undefined,
			});
			setServices(res.items.filter(s => s.active));
			setCurrentPage(1);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoadingServices(false);
		}
	};

	// Load customers
	const loadCustomers = async (searchTerm?: string) => {
		setLoadingCustomers(true);
		try {
			const res = await getCustomers({
				limit: 10,
				offset: 0,
				search: searchTerm && searchTerm.length >= 1 ? searchTerm : undefined,
			});
			setCustomers(res.items.filter(c => c.active));
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoadingCustomers(false);
		}
	};

	// Load initial customers list khi focus vào search
	const handleCustomerSearchFocus = () => {
		setShowCustomerDropdown(true);
		// Luôn load danh sách ban đầu khi focus vào ô search
		if (!loadingCustomers) {
			void loadCustomers();
		}
	};

	// Đóng dropdown khi blur (sẽ được xử lý bởi click outside)
	const handleCustomerSearchBlur = () => {
		// Không làm gì ở đây, để click outside handler xử lý
	};

	// Xử lý click outside để đóng dropdown
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				customerDropdownRef.current &&
				!customerDropdownRef.current.contains(event.target as Node)
			) {
				setShowCustomerDropdown(false);
			}
		};

		if (showCustomerDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showCustomerDropdown]);

	// Load customer từ URL nếu có customerId
	useEffect(() => {
		const loadCustomerFromUrl = async () => {
			if (customerIdFromUrl) {
				try {
					const customer = await getCustomerById(customerIdFromUrl);
					if (customer) {
						// Tự động điền khách hàng vào tab đầu tiên
						updateTab(activeTabId, {
							selectedCustomer: customer,
							customerSearch: customer.displayName || customer.name,
						});
					}
				} catch (err: any) {
					toast({
						status: 'error',
						title: 'Không thể tải thông tin khách hàng',
						duration: 3000,
						isClosable: true,
					});
				}
			}
		};

		void loadCustomerFromUrl();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customerIdFromUrl]);

	useEffect(() => {
		void loadServices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serviceSearch]);

	// Chỉ search khi có từ khóa >= 1 ký tự để phản hồi nhanh hơn
	useEffect(() => {
		const timer = setTimeout(() => {
			if (activeTab.customerSearch && activeTab.customerSearch.length >= 1) {
				void loadCustomers(activeTab.customerSearch);
			} else if (activeTab.customerSearch.length === 0) {
				// Nếu xóa hết text, load lại danh sách ban đầu (limit 10)
				void loadCustomers();
			}
		}, 300);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab.customerSearch]);

	// Cập nhật tab
	const updateTab = (tabId: string, updates: Partial<OrderTab>) => {
		setTabs(prevTabs =>
			prevTabs.map(tab =>
				tab.id === tabId ? { ...tab, ...updates } : tab
			)
		);
	};

	// Thêm tab mới
	const addNewTab = () => {
		const newTabNumber = tabs.length + 1;
		const newTab: OrderTab = {
			id: Date.now().toString(),
			name: `Đặt hàng ${newTabNumber}`,
			selectedServices: [],
			selectedCustomer: null,
			orderNotes: '',
			customerSearch: '',
		};
		setTabs([...tabs, newTab]);
		setActiveTabId(newTab.id);
	};

	// Đóng tab
	const closeTab = (tabId: string) => {
		if (tabs.length === 1) {
			toast({
				status: 'warning',
				title: 'Không thể đóng tab cuối cùng',
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		const tabIndex = tabs.findIndex(tab => tab.id === tabId);
		const newTabs = tabs.filter(tab => tab.id !== tabId);

		// Nếu đóng tab đang active, chuyển sang tab khác
		if (tabId === activeTabId) {
			if (tabIndex > 0) {
				setActiveTabId(newTabs[tabIndex - 1].id);
			} else {
				setActiveTabId(newTabs[0].id);
			}
		}

		setTabs(newTabs);
	};

	// Thêm dịch vụ vào tab hiện tại
	const handleAddService = (service: ServiceDto) => {
		const existingIndex = activeTab.selectedServices.findIndex(s => s.service.id === service.id);
		let newServices: SelectedService[];

		if (existingIndex >= 0) {
			newServices = [...activeTab.selectedServices];
			newServices[existingIndex].quantity += 1;
		} else {
			newServices = [...activeTab.selectedServices, { service, quantity: 1 }];
		}

		updateTab(activeTabId, { selectedServices: newServices });
	};

	// Cập nhật giá dịch vụ
	const handleUpdatePrice = (serviceId: string, price: number) => {
		if (price < 0) return; // Không cho phép giá âm
		const service = activeTab.selectedServices.find(s => s.service.id === serviceId);
		if (!service) return;
		
		// Nếu giá mới bằng giá gốc, xóa customPrice để dùng giá gốc
		const newServices = activeTab.selectedServices.map(s => {
			if (s.service.id === serviceId) {
				if (price === s.service.unitPrice) {
					const { customPrice, ...rest } = s;
					return rest;
				}
				return { ...s, customPrice: price };
			}
			return s;
		});
		updateTab(activeTabId, { selectedServices: newServices });
	};

	// Xóa dịch vụ khỏi tab hiện tại
	const handleRemoveService = (serviceId: string) => {
		const newServices = activeTab.selectedServices.filter(s => s.service.id !== serviceId);
		updateTab(activeTabId, { selectedServices: newServices });
	};

	// Cập nhật số lượng dịch vụ
	const handleUpdateQuantity = (serviceId: string, quantity: number) => {
		if (quantity < 1) {
			handleRemoveService(serviceId);
			return;
		}
		const newServices = activeTab.selectedServices.map(s =>
			s.service.id === serviceId ? { ...s, quantity } : s
		);
		updateTab(activeTabId, { selectedServices: newServices });
	};

	// Chọn khách hàng
	const handleSelectCustomer = (customer: CustomerDto) => {
		updateTab(activeTabId, {
			selectedCustomer: customer,
			customerSearch: customer.displayName || customer.name,
		});
		setCustomers([]);
		setShowCustomerDropdown(false);
	};

	// Hàm tự động lấy 3 số cuối từ số điện thoại
	const extractLastThreeDigits = (phone: string): string => {
		if (!phone) return '';
		const digitsOnly = phone.match(/\d+/g);
		if (digitsOnly && digitsOnly.length > 0) {
			const lastMatch = digitsOnly[digitsOnly.length - 1];
			if (lastMatch.length >= 3) {
				return lastMatch.substring(lastMatch.length - 3);
			} else if (lastMatch.length > 0) {
				return lastMatch;
			}
		}
		return '';
	};

	// Xử lý khi thay đổi số điện thoại trong form tạo khách hàng
	const handleNewCustomerPhoneChange = (value: string) => {
		setNewCustomerForm(prev => {
			const updated = { ...prev, phone: value };
			// Tự động điền 3 số cuối nếu chưa có
			if (!updated.phoneLastThreeDigits || updated.phoneLastThreeDigits === '') {
				const lastThree = extractLastThreeDigits(value);
				if (lastThree) {
					updated.phoneLastThreeDigits = lastThree;
				}
			}
			return updated;
		});
	};

	// Tạo khách hàng mới
	const handleCreateCustomer = async () => {
		if (!newCustomerForm.name || !newCustomerForm.phone) {
			toast({
				status: 'error',
				title: 'Vui lòng nhập đầy đủ thông tin',
				description: 'Tên khách hàng và SĐT là bắt buộc',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setCreatingCustomer(true);
		try {
			await createCustomer({
				...newCustomerForm,
				isCompany: false,
			});
			
			// Load lại danh sách khách hàng với số điện thoại để tìm khách hàng vừa tạo
			const refreshedCustomers = await getCustomers({ 
				limit: 10, 
				offset: 0, 
				search: newCustomerForm.phone 
			});
			
			// Tìm khách hàng vừa tạo trong danh sách
			let foundCustomer = refreshedCustomers.items.find(c => c.phone === newCustomerForm.phone);
			
			if (foundCustomer) {
				// Tự động chọn khách hàng vừa tạo
				handleSelectCustomer(foundCustomer);
			} else {
				// Nếu không tìm thấy bằng số điện thoại, thử tìm bằng tên
				foundCustomer = refreshedCustomers.items.find(c => 
					c.name.toLowerCase() === newCustomerForm.name.toLowerCase()
				);
				if (foundCustomer) {
					handleSelectCustomer(foundCustomer);
				} else {
					// Load lại danh sách ban đầu và chọn khách hàng đầu tiên nếu có
					await loadCustomers();
					if (customers.length > 0) {
						foundCustomer = customers[0];
						handleSelectCustomer(foundCustomer);
					}
				}
			}

			toast({
				status: 'success',
				title: 'Tạo khách hàng thành công',
				description: foundCustomer ? 'Khách hàng đã được chọn tự động' : 'Vui lòng chọn khách hàng từ danh sách',
				duration: 3000,
				isClosable: true,
			});

			// Reset form và đóng modal
			setNewCustomerForm({
				name: '',
				phone: '',
				phoneLastThreeDigits: '',
				address: '',
				isCompany: false,
			});
			setNewCustomerActive(true);
			onCreateCustomerClose();
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setCreatingCustomer(false);
		}
	};

	// Tính tổng tiền cho tab hiện tại
	const totalAmount = useMemo(() => {
		return activeTab.selectedServices.reduce((sum, item) => {
			return sum + getServicePrice(item) * item.quantity;
		}, 0);
	}, [activeTab.selectedServices]);

	// Phân trang cho services
	const totalPages = Math.ceil(services.length / servicesPerPage);
	const paginatedServices = useMemo(() => {
		const startIndex = (currentPage - 1) * servicesPerPage;
		return services.slice(startIndex, startIndex + servicesPerPage);
	}, [services, currentPage, servicesPerPage]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	// Handle resize logic
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const containerWidth = containerRect.width;
			// Tính toán vị trí chuột so với container (trừ padding 16px mỗi bên = 32px)
			const padding = 32; // 16px mỗi bên (p={4} = 16px)
			const availableWidth = containerWidth - padding;
			const newLeftWidth = e.clientX - containerRect.left - 16; // Trừ padding trái

			// Giới hạn mỗi bên tối đa 50%
			const minWidth = availableWidth * 0.1; // Tối thiểu 10%
			const maxWidth = availableWidth * 0.5; // Tối đa 50%

			if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
				setLeftColumnWidth(newLeftWidth);
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		if (isResizing) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};
	}, [isResizing]);

	return (
		<Box className="flex flex-col h-full w-full bg-gray-50">
			{/* Tabs Bar */}
			<Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={2}>
				<Flex align="center" gap={2} overflowX="auto">
					{tabs.map((tab) => (
						<Box
							key={tab.id}
							position="relative"
							minW="150px"
							bg={tab.id === activeTabId ? 'white' : 'gray.50'}
							borderLeft={tab.id === activeTabId ? '3px solid' : '1px solid'}
							borderLeftColor={tab.id === activeTabId ? 'blue.500' : 'gray.200'}
							borderTop="1px solid"
							borderRight="1px solid"
							borderTopColor="gray.200"
							borderRightColor="gray.200"
							borderTopRadius="md"
							cursor="pointer"
							onClick={() => setActiveTabId(tab.id)}
							_hover={{ bg: tab.id === activeTabId ? 'white' : 'gray.100' }}
						>
							<HStack spacing={2} px={3} py={2} justify="space-between">
								<HStack spacing={2} flex="1" minW={0}>
									<Box color="blue.500" flexShrink={0}>
										<FaExchangeAlt size={14} />
									</Box>
									<Text
										fontSize="sm"
										fontWeight={tab.id === activeTabId ? 'semibold' : 'normal'}
										color={tab.id === activeTabId ? 'orange.500' : 'gray.700'}
										noOfLines={1}
									>
										{tab.name}
									</Text>
								</HStack>
								<IconButton
									aria-label="Đóng tab"
									icon={<CloseIcon />}
									size="xs"
									variant="ghost"
									onClick={(e) => {
										e.stopPropagation();
										closeTab(tab.id);
									}}
									_focus={{ boxShadow: 'none', outline: 'none' }}
									_hover={{ bg: 'red.100', color: 'red.600' }}
								/>
							</HStack>
						</Box>
					))}
					{/* Blue Action Bar */}
					<Box flex="1" h="40px" ml={2} borderRadius="md" display="flex" alignItems="center" px={4}>
						<HStack spacing={3}>
							<IconButton
								aria-label="Thêm tab mới"
								icon={<FaPlus />}
								size="sm"
								colorScheme="blue"
								variant="ghost"
								color="blue.500"
								onClick={addNewTab}
								_focus={{ boxShadow: 'none', outline: 'none' }}
								_hover={{ bg: 'blue.100' }}
							/>
							<IconButton
								aria-label="Menu"
								icon={<FaChevronDown />}
								size="sm"
								colorScheme="blue"
								variant="ghost"
								color="blue.500"
								_focus={{ boxShadow: 'none', outline: 'none' }}
								_hover={{ bg: 'blue.100' }}
							/>
						</HStack>
					</Box>
				</Flex>
			</Box>

			{/* Main Content - Two Column Layout */}
			<Flex flex="1" gap={0} overflow="hidden" p={4} ref={containerRef} position="relative">
				{/* Left Column - Selected Services */}
				<Box 
					w={`${leftColumnWidth}px`} 
					minW="300px"
					maxW="50%"
					className="bg-white rounded-lg flex flex-col overflow-hidden shadow-sm"
					flexShrink={0}
				>
					<Box p={4} borderBottom="1px solid" borderColor="gray.200">
						<Heading size="md" color="gray.800">
							Dịch vụ đã chọn
						</Heading>
					</Box>
					
					{activeTab.selectedServices.length === 0 ? (
						<Flex flex="1" justify="center" align="center" p={8}>
							<VStack spacing={2}>
								<Text color="gray.400" fontSize="md">
									Chưa có dịch vụ nào
								</Text>
								<Text color="gray.400" fontSize="sm">
									Chọn dịch vụ từ danh sách bên phải
								</Text>
							</VStack>
						</Flex>
					) : (
						<>
							<Box flex="1" overflowY="auto" p={4}>
								<VStack align="stretch" spacing={3}>
									{activeTab.selectedServices.map((item) => (
										<Card key={item.service.id} size="sm" border="1px solid" borderColor="gray.200">
											<CardBody p={3}>
												<Flex justify="space-between" align="start">
													<VStack align="start" spacing={1} flex="1">
														<HStack>
															<Text fontSize="xs" color="gray.500" fontWeight="semibold">
																{item.service.defaultCode}
															</Text>
															<IconButton
																aria-label="Xóa"
																icon={<DeleteIcon />}
																size="xs"
																colorScheme="red"
																variant="ghost"
																onClick={() => handleRemoveService(item.service.id)}
																_focus={{ boxShadow: 'none', outline: 'none' }}
															/>
														</HStack>
														<Text fontSize="sm" fontWeight="medium" color="gray.800">
															{item.service.name}
														</Text>
														<HStack spacing={4}>
															<HStack spacing={2}>
																<IconButton
																	aria-label="Giảm"
																	size="xs"
																	variant="outline"
																	onClick={() => handleUpdateQuantity(item.service.id, item.quantity - 1)}
																	_focus={{ boxShadow: 'none', outline: 'none' }}
																>
																	<Text fontSize="xs">-</Text>
																</IconButton>
																<Text minW="30px" textAlign="center" fontWeight="semibold" fontSize="sm">
																	{item.quantity}
																</Text>
																<IconButton
																	aria-label="Tăng"
																	size="xs"
																	variant="outline"
																	onClick={() => handleUpdateQuantity(item.service.id, item.quantity + 1)}
																	_focus={{ boxShadow: 'none', outline: 'none' }}
																>
																	<Text fontSize="xs">+</Text>
																</IconButton>
															</HStack>
															<VStack spacing={1} align="start" flex="1">
																<HStack spacing={1} align="center">
																	<Text fontSize="xs" color="gray.500" minW="50px">
																		Giá:
																	</Text>
																	<Input
																		type="number"
																		size="md"
																		value={item.customPrice !== undefined ? item.customPrice : item.service.unitPrice}
																		onChange={(e) => {
																			const newPrice = parseFloat(e.target.value);
																			if (!isNaN(newPrice)) {
																				handleUpdatePrice(item.service.id, newPrice);
																			}
																		}}
																		onBlur={(e) => {
																			const newPrice = parseFloat(e.target.value);
																			if (isNaN(newPrice) || newPrice < 0) {
																				// Reset về giá gốc nếu giá không hợp lệ
																				handleUpdatePrice(item.service.id, item.service.unitPrice);
																			}
																		}}
																		min={0}
																		step={1000}
																		className="min-h-[30px]"
																		fontSize="md"
																		_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
																	/>
																	<Text fontSize="md" color="gray.500">
																		đ
																	</Text>
																</HStack>
																{item.customPrice !== undefined && item.customPrice !== item.service.unitPrice && (
																	<Text fontSize="xs" color="gray.400" fontStyle="italic">
																		Giá gốc: {item.service.unitPrice.toLocaleString('vi-VN')} đ
																	</Text>
																)}
															</VStack>
														</HStack>
														<Text fontSize="sm" fontWeight="bold" color="blue.600">
															{formatCurrency(getServicePrice(item) * item.quantity)}
														</Text>
													</VStack>
												</Flex>
											</CardBody>
										</Card>
									))}
								</VStack>
							</Box>

							<Box p={4} borderTop="1px solid" borderColor="gray.200" bg="gray.50">
								<VStack align="stretch" spacing={3}>
									<Box>
										<Text fontSize="sm" color="gray.600" mb={1}>
											Ghi chú đơn hàng
										</Text>
										<Textarea
											value={activeTab.orderNotes}
											onChange={(e) => updateTab(activeTabId, { orderNotes: e.target.value })}
											placeholder="Nhập ghi chú..."
											size="sm"
											rows={2}
											_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
										/>
									</Box>
									<VStack align="stretch" spacing={1}>
										<Flex justify="space-between">
											<Text fontSize="sm" color="gray.600">
												Tổng tiền hàng {activeTab.selectedServices.length}
											</Text>
											<Text fontSize="lg" fontWeight="bold" color="gray.800">
												{formatCurrency(totalAmount)}
											</Text>
										</Flex>
									</VStack>
								</VStack>
							</Box>
						</>
					)}
				</Box>

				{/* Resize Handle */}
				<Box
					w="8px"
					cursor="col-resize"
					bg="gray.200"
					transition="background-color 0.2s"
					onMouseDown={handleMouseDown}
					position="relative"
					flexShrink={0}
					zIndex={10}
					ml={4}
					mr={4}
					display="flex"
					alignItems="center"
					justifyContent="center"
					_hover={{
						bg: 'blue.400',
					}}
				>
					<Box
						w="2px"
						h="40px"
						bg="gray.400"
						borderRadius="full"
						transition="background-color 0.2s"
						_groupHover={{ bg: 'white' }}
					/>
				</Box>

				{/* Right Column - Customer Selection and Available Services */}
				<Box 
					flex="1" 
					minW="200px"
					className="bg-white rounded-lg flex flex-col overflow-hidden shadow-sm"
				>
					{/* Customer Selection Section */}
					<Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
						{!activeTab.selectedCustomer ? (
							<HStack spacing={2} align="center">
								<Box position="relative" ref={customerDropdownRef} flex="1">
									<SearchInput
										value={activeTab.customerSearch}
										onChange={(value) => updateTab(activeTabId, { customerSearch: value })}
										onFocus={handleCustomerSearchFocus}
										onBlur={handleCustomerSearchBlur}
										placeholder="Tìm khách hàng..."
										debounceMs={300}
									/>
									{/* Customer Dropdown */}
									{showCustomerDropdown && customers.length > 0 && (
										<Box
											position="absolute"
											top="100%"
											left={0}
											right={0}
											mt={1}
											bg="white"
											border="1px solid"
											borderColor="gray.200"
											borderRadius="md"
											boxShadow="lg"
											zIndex={1000}
											maxH="300px"
											overflowY="auto"
										>
											{customers.map((customer) => (
												<Box
													key={customer.id}
													p={3}
													cursor="pointer"
													_hover={{ bg: 'blue.50' }}
													onClick={() => handleSelectCustomer(customer)}
													borderBottom="1px solid"
													borderColor="gray.100"
													_last={{ borderBottom: 'none' }}
												>
													<VStack align="start" spacing={1}>
														<HStack>
															<Text fontWeight="semibold" fontSize="sm">
																{customer.displayName || `[${customer.ref}] ${customer.name}`}
															</Text>
														</HStack>
														<Text fontSize="xs" color="gray.600">
															📞 {customer.phone}
														</Text>
													</VStack>
												</Box>
											))}
										</Box>
									)}
									{showCustomerDropdown && loadingCustomers && (
										<Box position="absolute" top="100%" left={0} right={0} mt={1} p={2} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" boxShadow="lg" zIndex={1000}>
											<Flex justify="center" align="center" p={2}>
												<Spinner size="sm" />
											</Flex>
										</Box>
									)}
								</Box>
								<Button
									leftIcon={<AddIcon />}
									colorScheme="green"
									size="sm"
									variant="outline"
									onClick={onCreateCustomerOpen}
									_focus={{ boxShadow: 'none', outline: 'none' }}
									flexShrink={0}
									whiteSpace="nowrap"
								>
									Thêm khách hàng mới
								</Button>
							</HStack>
						) : (
							<HStack justify="space-between" align="center">
								<HStack spacing={3}>
									<Avatar size="sm" name={activeTab.selectedCustomer.name} bg="blue.500" icon={<FaUser />} />
									<VStack align="start" spacing={0}>
										<Text fontSize="sm" fontWeight="semibold" color="gray.800">
											{activeTab.selectedCustomer.name}
										</Text>
										<Text fontSize="xs" color="gray.600">
											{activeTab.selectedCustomer.phone}
										</Text>
									</VStack>
								</HStack>
								<HStack spacing={2}>
									<IconButton
										aria-label="Đóng"
										icon={<CloseIcon />}
										size="sm"
										variant="ghost"
										onClick={() => {
											updateTab(activeTabId, {
												selectedCustomer: null,
												customerSearch: '',
											});
										}}
										_focus={{ boxShadow: 'none', outline: 'none' }}
									/>
								</HStack>
							</HStack>
						)}
					</Box>

					{/* Services Grid Section */}
					<Box flex="1" overflowY="auto" p={4}>
						{loadingServices ? (
							<Flex justify="center" align="center" h="full">
								<Spinner />
							</Flex>
						) : (
							<>
								<Box mb={4}>
									<SearchInput
										value={serviceSearch}
										onChange={setServiceSearch}
										placeholder="Tìm dịch vụ..."
										debounceMs={300}
									/>
								</Box>
								{paginatedServices.length === 0 ? (
									<Flex justify="center" align="center" h="200px">
										<Text color="gray.400">Không tìm thấy dịch vụ nào</Text>
									</Flex>
								) : (
									<>
										<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
											{paginatedServices.map((service) => (
												<Card
													key={service.id}
													cursor="pointer"
													_hover={{ borderColor: 'blue.500', borderWidth: '2px', transform: 'scale(1.02)' }}
													transition="all 0.2s"
													border="1px solid"
													borderColor="gray.200"
													onClick={() => handleAddService(service)}
												>
													<CardBody p={3}>
														<VStack spacing={2} align="stretch">
															<Box
																w="100%"
																h="80px"
																bg="gray.100"
																borderRadius="md"
																display="flex"
																alignItems="center"
																justifyContent="center"
															>
																<Text fontSize="2xl" color="gray.400">📦</Text>
															</Box>
															<Text fontSize="sm" fontWeight="medium" color="gray.800" noOfLines={2}>
																{service.name}
															</Text>
															<Text fontSize="md" fontWeight="bold" color="blue.600">
																{formatCurrency(service.unitPrice)}
															</Text>
														</VStack>
													</CardBody>
												</Card>
											))}
										</SimpleGrid>

										{/* Pagination */}
										{totalPages > 1 && (
											<Flex justify="center" align="center" mt={6} gap={2}>
												<Button
													size="sm"
													variant="outline"
													isDisabled={currentPage === 1}
													onClick={() => setCurrentPage(currentPage - 1)}
													_focus={{ boxShadow: 'none', outline: 'none' }}
												>
													‹
												</Button>
												<Text fontSize="sm" color="gray.600" px={3}>
													{currentPage} / {totalPages}
												</Text>
												<Button
													size="sm"
													variant="outline"
													isDisabled={currentPage === totalPages}
													onClick={() => setCurrentPage(currentPage + 1)}
													_focus={{ boxShadow: 'none', outline: 'none' }}
												>
													›
												</Button>
											</Flex>
										)}
									</>
								)}
							</>
						)}
					</Box>

					{/* Order Button */}
					<Box p={4} borderTop="1px solid" borderColor="gray.200" bg="gray.50">
						<Button
							w="100%"
							colorScheme="blue"
							size="lg"
							isDisabled={activeTab.selectedServices.length === 0 || !activeTab.selectedCustomer || isCreating}
							isLoading={isCreating}
							onClick={async () => {
								if (!activeTab.selectedCustomer) return;
								
								setIsCreating(true);
								try {
									const orderItems = activeTab.selectedServices.map(item => ({
										serviceId: item.service.id,
										quantity: item.quantity,
										unitPrice: getServicePrice(item),
									}));

									await createOrder({
										partnerId: activeTab.selectedCustomer.id,
										orderItems,
										notes: activeTab.orderNotes || null,
									});

									toast({
										status: 'success',
										title: 'Tạo đơn hàng thành công',
										duration: 2000,
										isClosable: true,
									});

									// Xóa tab sau khi tạo thành công
									if (tabs.length > 1) {
										closeTab(activeTabId);
									} else {
										// Reset tab nếu chỉ còn 1 tab
										updateTab(activeTabId, {
											selectedServices: [],
											selectedCustomer: null,
											orderNotes: '',
											customerSearch: '',
										});
									}
								} catch (err: any) {
									// Toast error đã được xử lý tự động bởi http wrapper
								} finally {
									setIsCreating(false);
								}
							}}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							ĐẶT HÀNG
						</Button>
					</Box>
				</Box>
			</Flex>

			{/* Modal Tạo khách hàng mới */}
			<Modal isOpen={isCreateCustomerOpen} onClose={onCreateCustomerClose} size="md">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Thêm khách hàng mới</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Tên khách hàng</FormLabel>
								<Input
									value={newCustomerForm.name}
									onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
									placeholder="Nhập tên khách hàng"
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								/>
							</FormControl>
							<FormControl isRequired>
								<FormLabel>SĐT</FormLabel>
								<Input
									value={newCustomerForm.phone}
									onChange={(e) => handleNewCustomerPhoneChange(e.target.value)}
									placeholder="VD: 0123456789"
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>3 số cuối SĐT (để tìm kiếm nhanh)</FormLabel>
								<Input
									value={newCustomerForm.phoneLastThreeDigits ?? ''}
									onChange={(e) => {
										const value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
										setNewCustomerForm({ ...newCustomerForm, phoneLastThreeDigits: value });
									}}
									maxLength={3}
									placeholder="Tự động điền từ SĐT"
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Địa chỉ</FormLabel>
								<Input
									value={newCustomerForm.address ?? ''}
									onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
									placeholder="Nhập địa chỉ (tùy chọn)"
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								/>
							</FormControl>
							<FormControl display="flex" alignItems="center">
								<FormLabel mb="0">Hoạt động</FormLabel>
								<Switch
									isChecked={newCustomerActive}
									onChange={(e) => setNewCustomerActive(e.target.checked)}
								/>
							</FormControl>
						</Stack>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="ghost"
							mr={3}
							onClick={onCreateCustomerClose}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							Hủy
						</Button>
						<Button
							colorScheme="green"
							onClick={handleCreateCustomer}
							isLoading={creatingCustomer}
							loadingText="Đang tạo..."
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							Tạo khách hàng
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default OrderCreate;
