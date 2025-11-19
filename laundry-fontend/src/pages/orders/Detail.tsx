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
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	useDisclosure,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../api/orders';
import type { OrderDto } from '../../api/orders';
import { getPayments, createPayment, deletePayment, type PaymentDto } from '../../api/payments';
import Breadcrumb from '../../components/Breadcrumb';
import { ChevronLeftIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { getOrderStatusLabel, getOrderStatusColor, OrderStatus, OrderStatusLabels } from '../../constants/orderStatus';
import { getPaymentMethodLabel } from '../../constants/paymentMethod';
import OrderPrint from '../../components/OrderPrint';
import { FaPrint } from 'react-icons/fa';

const OrderDetail: React.FC = () => {
	const params = useParams<{ id: string }>();
	const id = params.id!;
	const [order, setOrder] = useState<OrderDto | null>(null);
	const [payments, setPayments] = useState<PaymentDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingPayments, setLoadingPayments] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const [creatingPayment, setCreatingPayment] = useState(false);
	const [printType, setPrintType] = useState<'Receive' | 'Delivery'>('Receive');
	const toast = useToast();
	const navigate = useNavigate();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isPrintOpen, onOpen: onPrintOpen, onClose: onPrintClose } = useDisclosure();
	const [paymentForm, setPaymentForm] = useState({
		amount: '',
		paymentMethod: 'Cash',
		paymentDate: new Date().toISOString().split('T')[0],
		note: '',
	});

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

	const loadPayments = async () => {
		if (!id) return;
		setLoadingPayments(true);
		try {
			const res = await getPayments({ orderId: id, limit: 100 });
			setPayments(res.items);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoadingPayments(false);
		}
	};

	useEffect(() => {
		void loadOrder();
		void loadPayments();
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

	const handleCreatePayment = async () => {
		if (!order || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
			toast({
				status: 'error',
				title: 'Vui lòng nhập số tiền hợp lệ',
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		const amount = parseFloat(paymentForm.amount);
		if (amount > order.remainingAmount) {
			toast({
				status: 'error',
				title: `Số tiền không được vượt quá số tiền còn lại (${formatCurrency(order.remainingAmount)})`,
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setCreatingPayment(true);
		try {
			// Gửi thời gian hiện tại theo giờ Việt Nam (UTC+7) với đầy đủ giờ phút giây
			const now = new Date();
			// Format thời gian theo múi giờ Việt Nam (UTC+7)
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const hours = String(now.getHours()).padStart(2, '0');
			const minutes = String(now.getMinutes()).padStart(2, '0');
			const seconds = String(now.getSeconds()).padStart(2, '0');
			const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
			// Format: YYYY-MM-DDTHH:mm:ss.sss+07:00
			const paymentDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+07:00`;
			await createPayment({
				orderId: order.id,
				amount,
				paymentMethod: paymentForm.paymentMethod,
				paymentDate: paymentDateTime,
				note: paymentForm.note || null,
			});
			toast({
				status: 'success',
				title: 'Tạo thanh toán thành công',
				duration: 2000,
				isClosable: true,
			});
			onClose();
			setPaymentForm({
				amount: '',
				paymentMethod: 'Cash',
				paymentDate: new Date().toISOString().split('T')[0],
				note: '',
			});
			await loadOrder();
			await loadPayments();
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setCreatingPayment(false);
		}
	};

	const handleDeletePayment = async (paymentId: string) => {
		if (!confirm('Bạn có chắc chắn muốn xóa thanh toán này?')) return;

		try {
			await deletePayment(paymentId);
			toast({
				status: 'success',
				title: 'Xóa thanh toán thành công',
				duration: 2000,
				isClosable: true,
			});
			await loadOrder();
			await loadPayments();
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		}
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
							leftIcon={<FaPrint />}
							colorScheme="blue"
							variant="outline"
							onClick={() => {
								setPrintType('Receive');
								onPrintOpen();
							}}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							In phiếu nhận
						</Button>
						{order.status === OrderStatus.Delivered && (
							<Button
								leftIcon={<FaPrint />}
								colorScheme="green"
								variant="outline"
								onClick={() => {
									setPrintType('Delivery');
									onPrintOpen();
								}}
								_focus={{ boxShadow: 'none', outline: 'none' }}
							>
								In phiếu giao
							</Button>
						)}
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
								{order.remainingAmount > 0 && (
									<Button
										leftIcon={<AddIcon />}
										colorScheme="green"
										mt={2}
										onClick={onOpen}
										_focus={{ boxShadow: 'none', outline: 'none' }}
									>
										Thêm thanh toán
									</Button>
								)}
							</VStack>
						</CardBody>
					</Card>

					{/* Payments History Card */}
					<Card mt={4}>
						<CardBody>
							<Heading size="sm" mb={4} color="gray.700">
								Lịch sử thanh toán
							</Heading>
							{loadingPayments ? (
								<Flex justify="center" py={4}>
									<Spinner size="sm" />
								</Flex>
							) : payments.length === 0 ? (
								<Text color="gray.400" fontSize="sm" textAlign="center" py={4}>
									Chưa có thanh toán nào
								</Text>
							) : (
								<VStack align="stretch" spacing={2}>
									{payments.map((payment) => (
										<Box
											key={payment.id}
											p={3}
											bg="gray.50"
											borderRadius="md"
											border="1px solid"
											borderColor="gray.200"
										>
											<Flex justify="space-between" align="start">
												<VStack align="start" spacing={1} flex="1">
													<HStack>
														<Text fontSize="xs" color="gray.500" fontWeight="semibold">
															{payment.paymentCode}
														</Text>
														<Badge colorScheme="blue" fontSize="xs">
															{getPaymentMethodLabel(payment.paymentMethod)}
														</Badge>
													</HStack>
													<Text fontSize="sm" fontWeight="bold" color="green.600">
														{formatCurrency(payment.amount)}
													</Text>
													<Text fontSize="xs" color="gray.500">
														{formatDate(payment.paymentDate)}
													</Text>
													{payment.note && (
														<Text fontSize="xs" color="gray.600" fontStyle="italic">
															{payment.note}
														</Text>
													)}
												</VStack>
												<IconButton
													aria-label="Xóa"
													icon={<DeleteIcon />}
													size="xs"
													colorScheme="red"
													variant="ghost"
													onClick={() => handleDeletePayment(payment.id)}
													_focus={{ boxShadow: 'none', outline: 'none' }}
												/>
											</Flex>
										</Box>
									))}
								</VStack>
							)}
						</CardBody>
					</Card>

					{/* Status Timeline Card */}
					<Card mt={4}>
						<CardBody>
							<Heading size="sm" mb={4} color="gray.700">
								Trạng thái đơn hàng
							</Heading>
							<VStack align="stretch" spacing={2}>
								{Object.values(OrderStatus).map((status) => {
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

			{/* Create Payment Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="md">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Thêm thanh toán</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<FormControl isRequired>
								<FormLabel>Số tiền</FormLabel>
								<HStack spacing={2}>
									<Input
										type="number"
										value={paymentForm.amount}
										min="0"
										max={order?.remainingAmount || 0}
										step="1000"
										onChange={(e) => {
											const value = e.target.value;
											const numValue = parseFloat(value);
											if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
												// Giới hạn giá trị không vượt quá số tiền còn lại
												if (order && !isNaN(numValue) && numValue > order.remainingAmount) {
													setPaymentForm({ ...paymentForm, amount: order.remainingAmount.toString() });
												} else {
													setPaymentForm({ ...paymentForm, amount: value });
												}
											}
										}}
										placeholder="Nhập số tiền"
										_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
										flex="1"
									/>
									{order && order.remainingAmount > 0 && (
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												setPaymentForm({ ...paymentForm, amount: order.remainingAmount.toString() });
											}}
											_focus={{ boxShadow: 'none', outline: 'none' }}
										>
											Tất cả
										</Button>
									)}
								</HStack>
								{order && (
									<>
										<Text fontSize="xs" color="gray.500" mt={1}>
											Số tiền còn lại: {formatCurrency(order.remainingAmount)}
										</Text>
										{paymentForm.amount && parseFloat(paymentForm.amount) > order.remainingAmount && (
											<Text fontSize="xs" color="red.500" mt={1}>
												Số tiền không được vượt quá số tiền còn lại
											</Text>
										)}
									</>
								)}
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Phương thức thanh toán</FormLabel>
								<Select
									value={paymentForm.paymentMethod}
									onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								>
									<option value="Cash">Tiền mặt</option>
									<option value="BankTransfer">Chuyển khoản</option>
									<option value="Bank">Chuyển khoản</option>
									<option value="Card">Thẻ</option>
									<option value="Other">Khác</option>
								</Select>
							</FormControl>
							<FormControl isRequired>
								<FormLabel>Ngày thanh toán</FormLabel>
								<Input
									type="date"
									value={paymentForm.paymentDate}
									isDisabled
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
									bg="gray.100"
									cursor="not-allowed"
								/>
								<Text fontSize="xs" color="gray.500" mt={1}>
									Thời gian thanh toán: {new Date().toLocaleString('vi-VN')}
								</Text>
							</FormControl>
							<FormControl>
								<FormLabel>Ghi chú</FormLabel>
								<Textarea
									value={paymentForm.note}
									onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
									placeholder="Nhập ghi chú (tùy chọn)"
									rows={3}
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								/>
							</FormControl>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={onClose} _focus={{ boxShadow: 'none', outline: 'none' }}>
							Hủy
						</Button>
						<Button
							colorScheme="blue"
							onClick={handleCreatePayment}
							isLoading={creatingPayment}
							_focus={{ boxShadow: 'none', outline: 'none' }}
						>
							Xác nhận
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Print Modal */}
			<Modal isOpen={isPrintOpen} onClose={onPrintClose} size="full">
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody p={0}>
						{isPrintOpen && <OrderPrint orderId={id} printType={printType} onClose={onPrintClose} />}
					</ModalBody>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default OrderDetail;

