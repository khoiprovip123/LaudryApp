import React, { useEffect, useState } from 'react';
import {
	Box,
	Card,
	CardBody,
	Flex,
	Heading,
	Spinner,
	Text,
	VStack,
	HStack,
	useToast,
	Button,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	FormControl,
	FormLabel,
	Input,
	SimpleGrid,
} from '@chakra-ui/react';
import { getRevenueReport, type RevenueReportDto } from '../../api/reports';
import { exportRevenueToExcel } from '../../api/export';
import { FaFileExcel } from 'react-icons/fa';
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
} from 'recharts';

const Reports: React.FC = () => {
	const [report, setReport] = useState<RevenueReportDto | null>(null);
	const [loading, setLoading] = useState(false);
	const [dateFrom, setDateFrom] = useState(() => {
		const date = new Date();
		date.setDate(1); // Ngày đầu tháng
		return date.toISOString().split('T')[0];
	});
	const [dateTo, setDateTo] = useState(() => {
		return new Date().toISOString().split('T')[0];
	});
	const toast = useToast();

	const loadReport = async () => {
		if (!dateFrom || !dateTo) return;

		setLoading(true);
		try {
			const data = await getRevenueReport({
				dateFrom,
				dateTo,
				includeByService: true,
				includeByCustomer: true,
				includeDailyDetails: true,
			});
			setReport(data);
		} catch (err: any) {
			// Toast error đã được xử lý tự động
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadReport();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleExport = async () => {
		if (!dateFrom || !dateTo) {
			toast({
				status: 'warning',
				title: 'Vui lòng chọn khoảng thời gian',
				duration: 2000,
			});
			return;
		}

		try {
			await exportRevenueToExcel({
				dateFrom,
				dateTo,
				includeByService: true,
				includeByCustomer: true,
				includeDailyDetails: true,
			});
			toast({
				status: 'success',
				title: 'Xuất Excel thành công',
				duration: 2000,
			});
		} catch (err: any) {
			// Toast error đã được xử lý tự động
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	return (
		<Box className="flex flex-col h-full w-full bg-gray-50 p-4">
			{/* Header */}
			<Card mb={4}>
				<CardBody>
					<Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
						<Heading size="lg">Báo cáo Doanh thu</Heading>
						<HStack>
							<FormControl w="150px">
								<FormLabel fontSize="sm">Từ ngày</FormLabel>
								<Input
									type="date"
									value={dateFrom}
									onChange={(e) => setDateFrom(e.target.value)}
									size="sm"
								/>
							</FormControl>
							<FormControl w="150px">
								<FormLabel fontSize="sm">Đến ngày</FormLabel>
								<Input
									type="date"
									value={dateTo}
									onChange={(e) => setDateTo(e.target.value)}
									size="sm"
								/>
							</FormControl>
							<Button
								colorScheme="blue"
								onClick={loadReport}
								isLoading={loading}
								size="sm"
								mt={6}
								_focus={{ boxShadow: 'none', outline: 'none' }}
							>
								Xem báo cáo
							</Button>
							<Button
								leftIcon={<FaFileExcel />}
								colorScheme="green"
								onClick={handleExport}
								isDisabled={!report}
								size="sm"
								mt={6}
								_focus={{ boxShadow: 'none', outline: 'none' }}
							>
								Xuất Excel
							</Button>
						</HStack>
					</Flex>
				</CardBody>
			</Card>

			{loading ? (
				<Flex justify="center" align="center" h="400px">
					<Spinner size="xl" />
				</Flex>
			) : !report ? (
				<Card>
					<CardBody>
						<Text color="gray.500" textAlign="center" py={8}>
							Chưa có dữ liệu. Vui lòng chọn khoảng thời gian và nhấn "Xem báo cáo"
						</Text>
					</CardBody>
				</Card>
			) : (
				<>
					{/* Tổng quan */}
					<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
						<Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
							<CardBody>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" color="gray.600">
										Tổng doanh thu
									</Text>
									<Text fontSize="2xl" fontWeight="bold" color="blue.700">
										{formatCurrency(report.totalRevenue)}
									</Text>
								</VStack>
							</CardBody>
						</Card>

						<Card bg="green.50" borderColor="green.200" borderWidth="1px">
							<CardBody>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" color="gray.600">
										Tổng đơn hàng
									</Text>
									<Text fontSize="2xl" fontWeight="bold" color="green.700">
										{report.totalOrders}
									</Text>
								</VStack>
							</CardBody>
						</Card>

						<Card bg="orange.50" borderColor="orange.200" borderWidth="1px">
							<CardBody>
								<VStack align="start" spacing={1}>
									<Text fontSize="sm" color="gray.600">
										Tổng công nợ
									</Text>
									<Text fontSize="2xl" fontWeight="bold" color="orange.700">
										{formatCurrency(report.totalDebt)}
									</Text>
								</VStack>
							</CardBody>
						</Card>
					</SimpleGrid>

					{/* Biểu đồ doanh thu theo ngày */}
					{report.dailyDetails.length > 0 && (
						<Card mb={4}>
							<CardBody>
								<Heading size="md" mb={4}>
									Doanh thu theo ngày
								</Heading>
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={report.dailyDetails}>
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
										<Bar dataKey="revenue" fill="#3182CE" />
									</BarChart>
								</ResponsiveContainer>
							</CardBody>
						</Card>
					)}

					<Flex gap={4} flexDirection={{ base: 'column', lg: 'row' }}>
						{/* Doanh thu theo dịch vụ */}
						{report.revenueByService.length > 0 && (
							<Card flex="1">
								<CardBody>
									<Heading size="md" mb={4}>
										Doanh thu theo dịch vụ
									</Heading>
									<TableContainer>
										<Table size="sm">
											<Thead>
												<Tr>
													<Th>Dịch vụ</Th>
													<Th isNumeric>Doanh thu</Th>
													<Th isNumeric>Số lượng</Th>
													<Th isNumeric>Số đơn</Th>
												</Tr>
											</Thead>
											<Tbody>
												{report.revenueByService.map((item) => (
													<Tr key={item.serviceId}>
														<Td>{item.serviceName}</Td>
														<Td isNumeric fontWeight="semibold">
															{formatCurrency(item.revenue)}
														</Td>
														<Td isNumeric>{item.quantity}</Td>
														<Td isNumeric>{item.orderCount}</Td>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</CardBody>
							</Card>
						)}

						{/* Doanh thu theo khách hàng */}
						{report.revenueByCustomer.length > 0 && (
							<Card flex="1">
								<CardBody>
									<Heading size="md" mb={4}>
										Doanh thu theo khách hàng
									</Heading>
									<TableContainer maxH="400px" overflowY="auto">
										<Table size="sm">
											<Thead position="sticky" top={0} bg="gray.100">
												<Tr>
													<Th>Khách hàng</Th>
													<Th isNumeric>Doanh thu</Th>
													<Th isNumeric>Đã trả</Th>
													<Th isNumeric>Công nợ</Th>
												</Tr>
											</Thead>
											<Tbody>
												{report.revenueByCustomer.map((item) => (
													<Tr key={item.partnerId}>
														<Td>{item.partnerDisplayName || item.partnerName}</Td>
														<Td isNumeric fontWeight="semibold">
															{formatCurrency(item.revenue)}
														</Td>
														<Td isNumeric color="green.600">
															{formatCurrency(item.paidAmount)}
														</Td>
														<Td isNumeric color={item.debtAmount > 0 ? 'red.600' : 'gray.500'}>
															{formatCurrency(item.debtAmount)}
														</Td>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</CardBody>
							</Card>
						)}
					</Flex>
				</>
			)}
		</Box>
	);
};

export default Reports;

