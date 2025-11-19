import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	Card,
	CardBody,
	Flex,
	Heading,
	Spinner,
	Text,
	useToast,
	Badge,
	VStack,
	HStack,
	Avatar,
	SimpleGrid,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	IconButton,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerById } from '../../api/customers';
import type { CustomerDto } from '../../api/customers';
import { getOrders } from '../../api/orders';
import type { OrderDto } from '../../api/orders';
import Breadcrumb from '../../components/Breadcrumb';
import { EditIcon, AddIcon, SearchIcon } from '@chakra-ui/icons';
import { getOrderStatusLabel, getOrderStatusColor } from '../../constants/orderStatus';

const CustomerDetail: React.FC = () => {
	const params = useParams<{ id: string }>();
	const id = params.id!;
	const [customer, setCustomer] = useState<CustomerDto | null>(null);
	const [orders, setOrders] = useState<OrderDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingOrders, setLoadingOrders] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const loadCustomer = async () => {
			setLoading(true);
			try {
				const data = await getCustomerById(id);
				setCustomer(data);
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
				navigate('/customers');
			} finally {
				setLoading(false);
			}
		};

		void loadCustomer();
	}, [id, toast, navigate]);

	useEffect(() => {
		const loadOrders = async () => {
			if (!id) return;
			
			setLoadingOrders(true);
			try {
				const result = await getOrders({
					partnerId: id,
					limit: 1000, // Lấy tất cả đơn hàng của khách hàng
					offset: 0,
				});
				setOrders(result.items);
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
			} finally {
				setLoadingOrders(false);
			}
		};

		void loadOrders();
	}, [id]);

	if (loading) {
		return (
			<Box className="flex flex-col h-full w-full">
				<Flex justify="center" align="center" className="h-full">
					<Spinner size="xl" />
				</Flex>
			</Box>
		);
	}

	if (!customer) {
		return null;
	}

	const breadcrumbItems = [
		{ label: 'Khách hàng', to: '/customers' },
		{ label: customer.displayName || `[${customer.ref}] ${customer.name}`, to: undefined },
	];

	// Tính toán thống kê từ dữ liệu đơn hàng thực tế
	const totalOrders = orders.length;
	const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
	const totalDebt = orders.reduce((sum, order) => sum + order.remainingAmount, 0);
	const totalAdvance = 0; // TODO: Tính từ Payment khi có API Payment

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	return (
		<Box className="flex flex-col h-full w-full bg-gray-50">
			{/* Header với Breadcrumb */}
			<Box className="bg-white px-4 py-3">
				<Flex justify="space-between" align="center">
					<VStack align="start" spacing={1}>
						<Breadcrumb items={breadcrumbItems} />
						<Heading size="md" color="gray.800">
							Thông tin khách hàng {customer.displayName || `[${customer.ref}] ${customer.name}`}
						</Heading>
					</VStack>
					<HStack spacing={2}>
						<Button
							leftIcon={<EditIcon />}
							colorScheme="blue"
							variant="outline"
							onClick={() => navigate(`/customers/${id}/edit`)}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							Sửa
						</Button>
					</HStack>
				</Flex>
			</Box>

			{/* Tabs */}
			<Box className="bg-white">
				<Tabs colorScheme="blue">
					<TabList className="px-4">
						<Tab>Hồ sơ</Tab>
						<Tab>Đơn hàng</Tab>
						<Tab>Lịch sử</Tab>
						<Tab>Công nợ</Tab>
					</TabList>
				</Tabs>
			</Box>

			{/* Main Content - 2 Columns */}
			<Flex flex="1" overflow="hidden" className="p-4 gap-4">
				{/* Left Column - Main Info */}
				<Box flex="1" overflowY="auto" className="space-y-4">
					{/* Customer Profile Card */}
					<Card>
						<CardBody>
							<Flex gap={4}>
								<Avatar size="xl" name={customer.name} bg="blue.500" />
								<VStack align="start" spacing={2} flex="1">
									<HStack>
										<Text fontWeight="bold" fontSize="lg">
											{customer.displayName || `[${customer.ref}] ${customer.name}`}
										</Text>
										<Badge colorScheme={customer.active ? 'green' : 'red'} fontSize="xs">
											{customer.active ? 'Hoạt động' : 'Không hoạt động'}
										</Badge>
									</HStack>
									<Text color="gray.600" fontSize="sm">
										📞 {customer.phone}
									</Text>
									{(customer.address || customer.cityName || customer.districtName || customer.wardName) && (
										<Text color="gray.600" fontSize="sm">
											📍{' '}
											{[customer.address, customer.wardName, customer.districtName, customer.cityName]
												.filter(Boolean)
												.join(', ')}
										</Text>
									)}
								</VStack>
							</Flex>
						</CardBody>
					</Card>

					{/* Financial Summary Cards */}
					<SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
						<Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
							<CardBody>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" color="gray.600">
										Tổng đơn hàng
									</Text>
									<Text fontSize="xl" fontWeight="bold" color="blue.700">
										{totalOrders}
									</Text>
								</VStack>
							</CardBody>
						</Card>
						<Card bg="green.50" borderColor="green.200" borderWidth="1px">
							<CardBody>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" color="gray.600">
										Doanh thu
									</Text>
									<Text fontSize="xl" fontWeight="bold" color="green.700">
										{formatCurrency(totalRevenue)}
									</Text>
								</VStack>
							</CardBody>
						</Card>
						<Card bg="orange.50" borderColor="orange.200" borderWidth="1px">
							<CardBody>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" color="gray.600">
										Công nợ
									</Text>
									<Text fontSize="xl" fontWeight="bold" color="orange.700">
										{formatCurrency(totalDebt)}
									</Text>
								</VStack>
							</CardBody>
						</Card>
						<Card bg="purple.50" borderColor="purple.200" borderWidth="1px">
							<CardBody>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" color="gray.600">
										Tạm ứng
									</Text>
									<Text fontSize="xl" fontWeight="bold" color="purple.700">
										{formatCurrency(totalAdvance)}
									</Text>
								</VStack>
							</CardBody>
						</Card>
					</SimpleGrid>

					{/* Order History Table */}
					<Card>
						<CardBody>
							<Tabs>
								<Flex justify="space-between" align="center" mb={4}>
									<TabList>
										<Tab>Lịch sử đơn hàng</Tab>
									</TabList>
									<Button
										leftIcon={<AddIcon />}
										colorScheme="blue"
										size="sm"
										onClick={() => navigate(`/orders/new?customerId=${id}`)}
										_focus={{ boxShadow: 'none', outline: 'none' }}
									>
										Thêm đơn hàng
									</Button>
								</Flex>
								<TabPanels>
									<TabPanel px={0}>
										{loadingOrders ? (
											<Flex justify="center" align="center" py={8}>
												<Spinner />
											</Flex>
										) : orders.length === 0 ? (
											<Box textAlign="center" py={8} color="gray.500">
												<Text>Chưa có đơn hàng nào</Text>
											</Box>
										) : (
											<TableContainer>
												<Table size="sm">
													<Thead>
														<Tr>
															<Th>Ngày</Th>
															<Th>Mã đơn</Th>
															<Th>Số dịch vụ</Th>
															<Th>Tổng tiền</Th>
															<Th>Đã thanh toán</Th>
															<Th>Còn lại</Th>
															<Th>Trạng thái</Th>
															<Th>Hành động</Th>
														</Tr>
													</Thead>
													<Tbody>
														{orders.map((order) => (
															<Tr key={order.id}>
																<Td>{new Date(order.dateCreated).toLocaleDateString('vi-VN', {
																	year: 'numeric',
																	month: '2-digit',
																	day: '2-digit',
																})}</Td>
																<Td>
																	<Button
																		variant="link"
																		colorScheme="blue"
																		onClick={() => navigate(`/orders/${order.id}`)}
																		_focus={{ boxShadow: 'none', outline: 'none' }}
																		fontWeight="semibold"
																	>
																		{order.code}
																	</Button>
																</Td>
																<Td>{order.orderItems.length}</Td>
																<Td fontWeight="semibold">{formatCurrency(order.totalAmount)}</Td>
																<Td color="green.600">{formatCurrency(order.paidAmount)}</Td>
																<Td color={order.remainingAmount > 0 ? 'red.500' : 'green.500'} fontWeight="semibold">
																	{formatCurrency(order.remainingAmount)}
																</Td>
																<Td>
																	<Badge colorScheme={getOrderStatusColor(order.status)}>
																		{getOrderStatusLabel(order.status)}
																	</Badge>
																</Td>
																<Td>
																	<Button
																		size="sm"
																		variant="ghost"
																		colorScheme="blue"
																		onClick={() => navigate(`/orders/${order.id}`)}
																		_focus={{ boxShadow: 'none', outline: 'none' }}
																	>
																		Xem
																	</Button>
																</Td>
															</Tr>
														))}
													</Tbody>
												</Table>
											</TableContainer>
										)}
									</TabPanel>
								</TabPanels>
							</Tabs>
						</CardBody>
					</Card>
				</Box>

				{/* Right Column - Activity Timeline */}
				<Box w="350px" overflowY="auto">
					<Card>
						<CardBody>
							<Tabs>
								<Flex justify="space-between" align="center" mb={4}>
									<TabList>
										<Tab>Lịch sử</Tab>
										<Tab>Ghi chú</Tab>
									</TabList>
									<IconButton
										aria-label="Lọc"
										icon={<SearchIcon />}
										size="sm"
										variant="ghost"
										_focus={{ boxShadow: 'none', outline: 'none' }}
									/>
								</Flex>
								<TabPanels>
									<TabPanel px={0}>
										<VStack align="stretch" spacing={4}>
											{/* Timeline items sẽ được thêm vào đây */}
											<Box textAlign="center" py={8} color="gray.500">
												<Text fontSize="sm">Chưa có hoạt động nào</Text>
											</Box>
										</VStack>
									</TabPanel>
									<TabPanel px={0}>
										{customer.notes ? (
											<Box>
												<Text color="gray.700" whiteSpace="pre-wrap" fontSize="sm">
													{customer.notes}
												</Text>
											</Box>
										) : (
											<Box textAlign="center" py={8} color="gray.500">
												<Text fontSize="sm">Chưa có ghi chú</Text>
											</Box>
										)}
									</TabPanel>
								</TabPanels>
							</Tabs>
						</CardBody>
					</Card>
				</Box>
			</Flex>
		</Box>
	);
};

export default CustomerDetail;
