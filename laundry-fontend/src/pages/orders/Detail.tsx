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
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	Select,
	IconButton,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../api/orders';
import type { OrderDto } from '../../api/orders';
import Breadcrumb from '../../components/Breadcrumb';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { getOrderStatusLabel, getOrderStatusColor, OrderStatus, OrderStatusLabels } from '../../constants/orderStatus';

const OrderDetail: React.FC = () => {
	const params = useParams<{ id: string }>();
	const id = params.id!;
	const [order, setOrder] = useState<OrderDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const loadOrder = async () => {
			setLoading(true);
			try {
				const data = await getOrderById(id);
				setOrder(data);
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
				navigate('/orders');
			} finally {
				setLoading(false);
			}
		};

		void loadOrder();
	}, [id, navigate]);

	const handleStatusChange = async (newStatus: string) => {
		if (!order || order.status === newStatus) return;

		setUpdatingStatus(true);
		try {
			await updateOrderStatus(order.id, newStatus);
			toast({
				status: 'success',
				title: 'Cập nhật trạng thái thành công',
				duration: 2000,
				isClosable: true,
			});
			// Reload order data
			const updatedOrder = await getOrderById(id);
			setOrder(updatedOrder);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setUpdatingStatus(false);
		}
	};

	const getNextStatusOptions = (currentStatus: string): string[] => {
		switch (currentStatus) {
			case OrderStatus.Received:
				return [OrderStatus.Processing];
			case OrderStatus.Processing:
				return [OrderStatus.Completed];
			case OrderStatus.Completed:
				return [OrderStatus.Delivered];
			case OrderStatus.Delivered:
				return [];
			default:
				return [OrderStatus.Received];
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<Box className="flex flex-col h-full w-full">
				<Flex justify="center" align="center" className="h-full">
					<Spinner size="xl" />
				</Flex>
			</Box>
		);
	}

	if (!order) {
		return null;
	}

	const breadcrumbItems = [
		{ label: 'Đơn hàng', to: '/orders' },
		{ label: order.code, to: undefined },
	];

	const nextStatusOptions = getNextStatusOptions(order.status);

	return (
		<Box className="flex flex-col h-full w-full bg-gray-50">
			{/* Header với Breadcrumb */}
			<Box className="bg-white px-4 py-3 border-b border-gray-200">
				<Flex justify="space-between" align="center">
					<VStack align="start" spacing={1}>
						<Breadcrumb items={breadcrumbItems} />
						<HStack spacing={3}>
							<Heading size="md" color="gray.800">
								Đơn hàng {order.code}
							</Heading>
							<Badge colorScheme={getOrderStatusColor(order.status)} fontSize="md" px={3} py={1}>
								{getOrderStatusLabel(order.status)}
							</Badge>
						</HStack>
					</VStack>
					<HStack spacing={2}>
						<Button
							leftIcon={<ChevronLeftIcon />}
							variant="outline"
							onClick={() => navigate('/orders')}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							Quay lại
						</Button>
						{nextStatusOptions.length > 0 && (
							<Select
								value={order.status}
								onChange={(e) => handleStatusChange(e.target.value)}
								size="md"
								w="200px"
								isDisabled={updatingStatus}
								_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
							>
								<option value={order.status}>{OrderStatusLabels[order.status as keyof typeof OrderStatusLabels]}</option>
								{nextStatusOptions.map((status) => (
									<option key={status} value={status}>
										Chuyển sang: {OrderStatusLabels[status as keyof typeof OrderStatusLabels]}
									</option>
								))}
							</Select>
						)}
					</HStack>
				</Flex>
			</Box>

			{/* Main Content */}
			<Flex flex="1" overflow="hidden" className="p-4 gap-4">
				{/* Left Column - Order Info */}
				<Box flex="1" overflowY="auto" className="space-y-4">
					{/* Order Summary Card */}
					<Card>
						<CardBody>
							<Heading size="sm" mb={4} color="gray.700">
								Thông tin đơn hàng
							</Heading>
							<VStack align="stretch" spacing={3}>
								<Flex justify="space-between">
									<Text color="gray.600" fontSize="sm">Mã đơn hàng:</Text>
									<Text fontWeight="semibold">{order.code}</Text>
								</Flex>
								<Flex justify="space-between">
									<Text color="gray.600" fontSize="sm">Khách hàng:</Text>
									<Button
										variant="link"
										colorScheme="blue"
										onClick={() => navigate(`/customers/${order.partnerId}`)}
										_focus={{ boxShadow: 'none', outline: 'none' }}
									>
										{order.partnerDisplayName || `[${order.partnerRef}] ${order.partnerName}`}
									</Button>
								</Flex>
								{order.partnerPhone && (
									<Flex justify="space-between">
										<Text color="gray.600" fontSize="sm">Số điện thoại:</Text>
										<Text>{order.partnerPhone}</Text>
									</Flex>
								)}
								<Flex justify="space-between">
									<Text color="gray.600" fontSize="sm">Ngày tạo:</Text>
									<Text>{formatDate(order.dateCreated)}</Text>
								</Flex>
								{order.dateUpdated && (
									<Flex justify="space-between">
										<Text color="gray.600" fontSize="sm">Ngày cập nhật:</Text>
										<Text>{formatDate(order.dateUpdated)}</Text>
									</Flex>
								)}
								{order.notes && (
									<Box>
										<Text color="gray.600" fontSize="sm" mb={1}>Ghi chú:</Text>
										<Text color="gray.700" whiteSpace="pre-wrap" fontSize="sm" p={2} bg="gray.50" borderRadius="md">
											{order.notes}
										</Text>
									</Box>
								)}
							</VStack>
						</CardBody>
					</Card>

					{/* Order Items Card */}
					<Card>
						<CardBody>
							<Heading size="sm" mb={4} color="gray.700">
								Chi tiết dịch vụ
							</Heading>
							<TableContainer>
								<Table size="sm">
									<Thead>
										<Tr>
											<Th>Dịch vụ</Th>
											<Th isNumeric>Số lượng</Th>
											<Th isNumeric>Đơn giá</Th>
											<Th isNumeric>Thành tiền</Th>
										</Tr>
									</Thead>
									<Tbody>
										{order.orderItems.length === 0 ? (
											<Tr>
												<Td colSpan={4} textAlign="center" p={8}>
													<Text color="gray.400">Chưa có dịch vụ nào</Text>
												</Td>
											</Tr>
										) : (
											order.orderItems.map((item) => (
												<Tr key={item.id}>
													<Td>
														<VStack align="start" spacing={0}>
															<Text fontWeight="medium">{item.serviceName}</Text>
															{item.serviceCode && (
																<Text fontSize="xs" color="gray.500">
																	{item.serviceCode}
																</Text>
															)}
														</VStack>
													</Td>
													<Td isNumeric>{item.quantity}</Td>
													<Td isNumeric>{formatCurrency(item.unitPrice)}</Td>
													<Td isNumeric fontWeight="semibold">
														{formatCurrency(item.totalPrice)}
													</Td>
												</Tr>
											))
										)}
									</Tbody>
								</Table>
							</TableContainer>
						</CardBody>
					</Card>
				</Box>

				{/* Right Column - Financial Summary */}
				<Box w="350px" overflowY="auto">
					<Card>
						<CardBody>
							<Heading size="sm" mb={4} color="gray.700">
								Tổng kết thanh toán
							</Heading>
							<VStack align="stretch" spacing={3}>
								<Flex justify="space-between" align="center">
									<Text color="gray.600" fontSize="sm">Tổng tiền hàng:</Text>
									<Text fontWeight="bold" fontSize="lg">
										{formatCurrency(order.totalAmount)}
									</Text>
								</Flex>
								<Flex justify="space-between" align="center">
									<Text color="gray.600" fontSize="sm">Đã thanh toán:</Text>
									<Text fontWeight="semibold" color="green.600">
										{formatCurrency(order.paidAmount)}
									</Text>
								</Flex>
								<Box h="1px" bg="gray.200" my={2} />
								<Flex justify="space-between" align="center">
									<Text color="gray.600" fontSize="sm" fontWeight="semibold">
										Còn lại:
									</Text>
									<Text
										fontWeight="bold"
										fontSize="lg"
										color={order.remainingAmount > 0 ? 'red.500' : 'green.500'}
									>
										{formatCurrency(order.remainingAmount)}
									</Text>
								</Flex>
							</VStack>
						</CardBody>
					</Card>

					{/* Status Timeline Card */}
					<Card mt={4}>
						<CardBody>
							<Heading size="sm" mb={4} color="gray.700">
								Trạng thái đơn hàng
							</Heading>
							<VStack align="stretch" spacing={2}>
								{Object.values(OrderStatus).map((status, index) => {
									const isCompleted = 
										status === order.status ||
										(order.status === OrderStatus.Processing && status === OrderStatus.Received) ||
										(order.status === OrderStatus.Completed && 
											(status === OrderStatus.Received || status === OrderStatus.Processing)) ||
										(order.status === OrderStatus.Delivered);
									
									const isCurrent = status === order.status;

									return (
										<HStack key={status} spacing={3}>
											<Box
												w="8px"
												h="8px"
												borderRadius="full"
												bg={isCompleted ? (isCurrent ? 'blue.500' : 'gray.400') : 'gray.200'}
												border={isCurrent ? '2px solid' : 'none'}
												borderColor="blue.500"
											/>
											<Text
												fontSize="sm"
												color={isCompleted ? 'gray.700' : 'gray.400'}
												fontWeight={isCurrent ? 'semibold' : 'normal'}
											>
												{OrderStatusLabels[status as keyof typeof OrderStatusLabels]}
											</Text>
											{isCurrent && (
												<Badge colorScheme={getOrderStatusColor(order.status)} fontSize="xs">
													Hiện tại
												</Badge>
											)}
										</HStack>
									);
								})}
							</VStack>
						</CardBody>
					</Card>
				</Box>
			</Flex>
		</Box>
	);
};

export default OrderDetail;

