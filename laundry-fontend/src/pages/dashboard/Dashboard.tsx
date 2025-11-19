import React, { useEffect, useState } from 'react';
import {
	Box,
	Card,
	CardBody,
	Flex,
	Heading,
	Spinner,
	Text,
	SimpleGrid,
	VStack,
	HStack,
	Button,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { getDashboardStats, type DashboardStatsDto } from '../../api/dashboard';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

const Dashboard: React.FC = () => {
	const [stats, setStats] = useState<DashboardStatsDto | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const loadStats = async () => {
		setLoading(true);
		try {
			const data = await getDashboardStats();
			setStats(data);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadStats();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	if (loading) {
		return (
			<Flex justify="center" align="center" h="100vh">
				<Spinner size="xl" />
			</Flex>
		);
	}

	if (!stats) {
		return null;
	}

	return (
		<Box className="flex flex-col h-full w-full bg-gray-50 p-4">
			{/* Header */}
			<Box className="bg-white rounded-md p-4 mb-4">
				<Flex justify="space-between" align="center">
					<Heading size="lg" color="gray.800">
						Dashboard
					</Heading>
					<Button
						colorScheme="blue"
						onClick={() => navigate('/reports')}
						_focus={{ boxShadow: 'none', outline: 'none' }}
					>
						Xem báo cáo chi tiết
					</Button>
				</Flex>
			</Box>

			{/* Thống kê Doanh thu */}
			<SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
				<Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
					<CardBody>
						<VStack align="start" spacing={2}>
							<HStack>
								<FaMoneyBillWave color="#3182CE" />
								<Text fontSize="sm" color="gray.600">
									Doanh thu hôm nay
								</Text>
							</HStack>
							<Text fontSize="2xl" fontWeight="bold" color="blue.700">
								{formatCurrency(stats.todayRevenue)}
							</Text>
							<Text fontSize="xs" color="gray.500">
								{stats.todayOrders} đơn hàng
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card bg="green.50" borderColor="green.200" borderWidth="1px">
					<CardBody>
						<VStack align="start" spacing={2}>
							<HStack>
								<FaChartLine color="#38A169" />
								<Text fontSize="sm" color="gray.600">
									Doanh thu tuần này
								</Text>
							</HStack>
							<Text fontSize="2xl" fontWeight="bold" color="green.700">
								{formatCurrency(stats.weekRevenue)}
							</Text>
							<Text fontSize="xs" color="gray.500">
								{stats.weekOrders} đơn hàng
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card bg="purple.50" borderColor="purple.200" borderWidth="1px">
					<CardBody>
						<VStack align="start" spacing={2}>
							<HStack>
								<FaChartLine color="#805AD5" />
								<Text fontSize="sm" color="gray.600">
									Doanh thu tháng này
								</Text>
							</HStack>
							<Text fontSize="2xl" fontWeight="bold" color="purple.700">
								{formatCurrency(stats.monthRevenue)}
							</Text>
							<Text fontSize="xs" color="gray.500">
								{stats.monthOrders} đơn hàng
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card bg="orange.50" borderColor="orange.200" borderWidth="1px">
					<CardBody>
						<VStack align="start" spacing={2}>
							<HStack>
								<FaExclamationTriangle color="#DD6B20" />
								<Text fontSize="sm" color="gray.600">
									Tổng công nợ
								</Text>
							</HStack>
							<Text fontSize="2xl" fontWeight="bold" color="orange.700">
								{formatCurrency(stats.totalDebt)}
							</Text>
							<Text fontSize="xs" color="gray.500">
								{stats.debtOrders} đơn hàng
							</Text>
						</VStack>
					</CardBody>
				</Card>
			</SimpleGrid>

			{/* Trạng thái đơn hàng */}
			<SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
				<Card>
					<CardBody>
						<VStack align="start" spacing={1}>
							<Text fontSize="sm" color="gray.600">
								Đã nhận đồ
							</Text>
							<Text fontSize="xl" fontWeight="bold" color="blue.600">
								{stats.receivedOrders}
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card>
					<CardBody>
						<VStack align="start" spacing={1}>
							<Text fontSize="sm" color="gray.600">
								Đang giặt
							</Text>
							<Text fontSize="xl" fontWeight="bold" color="yellow.600">
								{stats.processingOrders}
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card>
					<CardBody>
						<VStack align="start" spacing={1}>
							<Text fontSize="sm" color="gray.600">
								Đã giặt xong
							</Text>
							<Text fontSize="xl" fontWeight="bold" color="green.600">
								{stats.completedOrders}
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card>
					<CardBody>
						<VStack align="start" spacing={1}>
							<Text fontSize="sm" color="gray.600">
								Đã giao
							</Text>
							<Text fontSize="xl" fontWeight="bold" color="purple.600">
								{stats.deliveredOrders}
							</Text>
						</VStack>
					</CardBody>
				</Card>
			</SimpleGrid>

			{/* Cảnh báo */}
			{stats.overdueOrders > 0 && (
				<Card bg="red.50" borderColor="red.200" borderWidth="1px" mb={4}>
					<CardBody>
						<HStack>
							<FaExclamationTriangle color="#E53E3E" size={24} />
							<Text fontWeight="bold" color="red.700">
								Có {stats.overdueOrders} đơn hàng quá hạn cần xử lý
							</Text>
							<Button
								size="sm"
								colorScheme="red"
								onClick={() => navigate('/orders?status=Completed')}
								ml="auto"
								_focus={{ boxShadow: 'none', outline: 'none' }}
							>
								Xem chi tiết
							</Button>
						</HStack>
					</CardBody>
				</Card>
			)}

			<Flex gap={4} flexDirection={{ base: 'column', lg: 'row' }}>
				{/* Biểu đồ Doanh thu 7 ngày */}
				<Card flex="1" mb={{ base: 4, lg: 0 }}>
					<CardBody>
						<Heading size="md" mb={4}>
							Doanh thu 7 ngày gần nhất
						</Heading>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={stats.dailyRevenues}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="date"
									tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
								/>
								<YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
								<Tooltip
									formatter={(value: number) => formatCurrency(value)}
									labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
								/>
								<Line type="monotone" dataKey="revenue" stroke="#3182CE" strokeWidth={2} />
							</LineChart>
						</ResponsiveContainer>
					</CardBody>
				</Card>

				{/* Top khách hàng */}
				<Card flex="1">
					<CardBody>
						<Heading size="md" mb={4}>
							Top khách hàng tháng này
						</Heading>
						{stats.topCustomers.length === 0 ? (
							<Text color="gray.500" textAlign="center" py={8}>
								Chưa có dữ liệu
							</Text>
						) : (
							<TableContainer>
								<Table size="sm">
									<Thead>
										<Tr>
											<Th>Khách hàng</Th>
											<Th isNumeric>Doanh thu</Th>
											<Th isNumeric>Số đơn</Th>
										</Tr>
									</Thead>
									<Tbody>
										{stats.topCustomers.map((customer) => (
											<Tr
												key={customer.partnerId}
												cursor="pointer"
												_hover={{ bg: 'gray.50' }}
												onClick={() => navigate(`/customers/${customer.partnerId}`)}
											>
												<Td>{customer.partnerDisplayName || customer.partnerName}</Td>
												<Td isNumeric fontWeight="semibold">
													{formatCurrency(customer.totalRevenue)}
												</Td>
												<Td isNumeric>{customer.orderCount}</Td>
											</Tr>
										))}
									</Tbody>
								</Table>
							</TableContainer>
						)}
					</CardBody>
				</Card>
			</Flex>
		</Box>
	);
};

export default Dashboard;

