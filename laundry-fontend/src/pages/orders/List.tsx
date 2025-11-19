import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Button,
	ButtonGroup,
	Flex,
	Heading,
	IconButton,
	Select,
	Spinner,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	Badge,
	Text,
	HStack,
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	VStack,
	useDisclosure,
	Tabs,
	TabList,
	Tab,
} from '@chakra-ui/react';
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder } from '../../api/orders';
import type { OrderDto } from '../../api/orders';
import { getOrderStatusLabel, getOrderStatusColor, OrderStatus, OrderStatusLabels, type OrderStatusType } from '../../constants/orderStatus';
import { createPayment } from '../../api/payments';
import { exportOrdersToExcel } from '../../api/export';
import { FaFileExcel } from 'react-icons/fa';
import SearchInput from '../../components/SearchInput';
import { useToast } from '../../hooks/useToast';

const OrdersList: React.FC = () => {
	const [items, setItems] = useState<OrderDto[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [offset, setOffset] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [searchKeyword, setSearchKeyword] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [dateFrom, setDateFrom] = useState<string>(() => {
		return new Date().toISOString().split('T')[0];
	});
	const [dateTo, setDateTo] = useState<string>(() => {
		return new Date().toISOString().split('T')[0];
	});
	const [loading, setLoading] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
	const [creatingPayment, setCreatingPayment] = useState(false);
	const [paymentForm, setPaymentForm] = useState({
		amount: '',
		paymentMethod: 'Cash',
		paymentDate: new Date().toISOString().split('T')[0],
		note: '',
	});
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const navigate = useNavigate();

	const load = async () => {
		setLoading(true);
		try {
			const res = await getOrders({ 
				limit: pageSize, 
				offset, 
				search: searchKeyword || undefined,
				status: statusFilter || undefined,
				dateFrom: dateFrom || undefined,
				dateTo: dateTo || undefined,
			});
			setItems(res.items);
			setTotalItems(res.totalItems);
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [offset, pageSize, statusFilter, dateFrom, dateTo, searchKeyword]);

	// Tính toán phân trang
	const currentPage = Math.floor(offset / pageSize) + 1;
	const totalPages = Math.ceil(totalItems / pageSize);
	const canPrev = offset > 0;
	const canNext = useMemo(() => offset + pageSize < totalItems, [offset, pageSize, totalItems]);

	// Tạo danh sách số trang để hiển thị
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;
		
		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) pages.push(i);
				pages.push('...');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
			} else {
				pages.push(1);
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
				pages.push('...');
				pages.push(totalPages);
			}
		}
		return pages;
	};

	const goToPage = (page: number) => {
		const newOffset = (page - 1) * pageSize;
		setOffset(newOffset);
	};

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setOffset(0);
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

	const handleOpenPaymentDrawer = (order: OrderDto) => {
		setSelectedOrder(order);
		setPaymentForm({
			amount: order.remainingAmount > 0 ? order.remainingAmount.toString() : '',
			paymentMethod: 'Cash',
			paymentDate: new Date().toISOString().split('T')[0],
			note: '',
		});
		onOpen();
	};

	const handleCreatePayment = async () => {
		if (!selectedOrder || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
			toast({
				status: 'error',
				title: 'Vui lòng nhập số tiền hợp lệ',
				duration: 2000,
				isClosable: true,
			});
			return;
		}

		const amount = parseFloat(paymentForm.amount);
		if (amount > selectedOrder.remainingAmount) {
			toast({
				status: 'error',
				title: `Số tiền không được vượt quá số tiền còn lại (${formatCurrency(selectedOrder.remainingAmount)})`,
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
				orderId: selectedOrder.id,
				amount,
				paymentMethod: paymentForm.paymentMethod,
				paymentDate: paymentDateTime,
				note: paymentForm.note || null,
			});
			toast({
				status: 'success',
				title: 'Thanh toán thành công',
				description: 'Đơn hàng đã được cập nhật trạng thái',
				duration: 3000,
				isClosable: true,
			});
			onClose();
			setPaymentForm({
				amount: '',
				paymentMethod: 'Cash',
				paymentDate: new Date().toISOString().split('T')[0],
				note: '',
			});
			setSelectedOrder(null);
			await load();
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setCreatingPayment(false);
		}
	};

	const handleExportExcel = async () => {
		try {
			await exportOrdersToExcel({
				limit: pageSize,
				offset,
				search: searchKeyword || undefined,
				status: statusFilter || undefined,
				dateFrom: dateFrom || undefined,
				dateTo: dateTo || undefined,
			});
			toast({
				status: 'success',
				title: 'Xuất Excel thành công',
				duration: 2000,
				isClosable: true,
			});
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		}
	};

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Đơn hàng</Heading>
				<HStack spacing={2}>
					<Button
						leftIcon={<FaFileExcel />}
						colorScheme="green"
						variant="outline"
						onClick={handleExportExcel}
						_focus={{ boxShadow: 'none', outline: 'none' }}
					>
						Xuất Excel
					</Button>
					<Button 
						leftIcon={<AddIcon />} 
						colorScheme="blue" 
						onClick={() => navigate('/orders/new')}
						_focus={{ boxShadow: 'none', outline: 'none' }}
					>
						Tạo đơn hàng
					</Button>
				</HStack>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden">
					{/* Filter Bar */}
					<Box p={3} borderBottom="1px solid" borderColor="gray.200">
						<VStack spacing={4} align="stretch">
							{/* Tabs cho trạng thái */}
							<Tabs 
								index={statusFilter ? Object.values(OrderStatus).indexOf(statusFilter as OrderStatusType) + 1 : 0}
								onChange={(index) => {
									if (index === 0) {
										setStatusFilter('');
									} else {
										setStatusFilter(Object.values(OrderStatus)[index - 1]);
									}
									setOffset(0);
								}}
								variant="enclosed"
								colorScheme="blue"
							>
								<TabList>
									<Tab>Tất cả</Tab>
									{Object.values(OrderStatus).map((status) => (
										<Tab key={status}>{OrderStatusLabels[status]}</Tab>
									))}
								</TabList>
							</Tabs>

							{/* Search và Date Filter */}
							<HStack spacing={4} flexWrap="wrap">
								<Box flex="1" minW="200px">
									<FormLabel fontSize="sm" color="gray.600">
										Tìm kiếm (Tên khách hàng, Mã đơn)
									</FormLabel>
									<SearchInput
										value={searchKeyword}
										onChange={(value) => {
											setSearchKeyword(value);
											setOffset(0);
										}}
										placeholder="Nhập tên khách hàng hoặc mã đơn..."
										debounceMs={300}
									/>
								</Box>
								<Box>
									<FormLabel fontSize="sm" color="gray.600">
										Từ ngày
									</FormLabel>
									<Input
										type="date"
										size="sm"
										value={dateFrom}
										onChange={(e) => {
											setDateFrom(e.target.value);
											setOffset(0);
										}}
										w="150px"
										_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
									/>
								</Box>
								<Box>
									<FormLabel fontSize="sm" color="gray.600">
										Đến ngày
									</FormLabel>
									<Input
										type="date"
										size="sm"
										value={dateTo}
										onChange={(e) => {
											setDateTo(e.target.value);
											setOffset(0);
										}}
										w="150px"
										_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
									/>
								</Box>
								{(dateFrom || dateTo || searchKeyword) && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											setDateFrom('');
											setDateTo('');
											setSearchKeyword('');
											setOffset(0);
										}}
										mt={6}
										_focus={{ boxShadow: 'none', outline: 'none' }}
									>
										Xóa bộ lọc
									</Button>
								)}
							</HStack>
						</VStack>
					</Box>
					{loading ? (
						<Flex justify="center" align="center" className="h-full">
							<Spinner />
						</Flex>
					) : (
						<>
							<TableContainer 
								flex="1"
								minH="0"
								overflowY="auto" 
								overflowX="auto"
								border="1px solid"
								borderColor="gray.200"
								borderRadius="md"
								mx={2}
							>
								<Table size="sm">
									<Thead position="sticky" top={0} zIndex={10} bg="gray.100">
										<Tr>
											<Th bg="gray.100">Mã đơn</Th>
											<Th bg="gray.100">Khách hàng</Th>
											<Th bg="gray.100">SĐT</Th>
											<Th bg="gray.100" isNumeric>Tổng tiền</Th>
											<Th bg="gray.100" isNumeric>Đã thanh toán</Th>
											<Th bg="gray.100" isNumeric>Còn lại</Th>
											<Th bg="gray.100">Trạng thái</Th>
											<Th bg="gray.100">Ngày tạo</Th>
											<Th bg="gray.100">Hành động</Th>
										</Tr>
									</Thead>
									<Tbody>
										{items.length === 0 ? (
											<Tr>
												<Td colSpan={9} textAlign="center" p={8}>
													<Text color="gray.400">Chưa có đơn hàng nào</Text>
												</Td>
											</Tr>
										) : (
											items.map((order) => (
												<Tr key={order.id}>
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
													<Td>{order.partnerName}</Td>
													<Td>{order.partnerPhone || '-'}</Td>
													<Td isNumeric fontWeight="semibold">{formatCurrency(order.totalAmount)}</Td>
													<Td isNumeric>{formatCurrency(order.paidAmount)}</Td>
													<Td isNumeric color={order.remainingAmount > 0 ? 'red.500' : 'green.500'} fontWeight="semibold">
														{formatCurrency(order.remainingAmount)}
													</Td>
													<Td>
														<Badge colorScheme={getOrderStatusColor(order.status)}>
															{getOrderStatusLabel(order.status)}
														</Badge>
													</Td>
													<Td>{formatDate(order.dateCreated)}</Td>
													<Td>
														<ButtonGroup size="sm" variant="outline" spacing={1}>
															<Button 
																colorScheme="blue" 
																onClick={() => navigate(`/orders/${order.id}`)}
																_focus={{ boxShadow: 'none', outline: 'none' }}
															>
																Xem
															</Button>
															{order.remainingAmount > 0 && (
																<Button
																	colorScheme="green"
																	onClick={() => handleOpenPaymentDrawer(order)}
																	_focus={{ boxShadow: 'none', outline: 'none' }}
																>
																	Thanh toán
																</Button>
															)}
															<Button
																colorScheme="red"
																isDisabled={
																	order.paymentStatus === 'Paid' || 
																	order.paymentStatus === 'Đã thanh toán' ||
																	(order.remainingAmount <= 0 && order.totalAmount > 0)
																}
																onClick={async () => {
																	try {
																		await deleteOrder(order.id);
																		toast({ status: 'success', title: 'Đã xóa đơn hàng' });
																		void load();
																	} catch (err: any) {
																		// Toast error đã được xử lý tự động bởi http wrapper
																	}
																}}
																_focus={{ boxShadow: 'none', outline: 'none' }}
																title={
																	order.paymentStatus === 'Paid' || 
																	order.paymentStatus === 'Đã thanh toán' ||
																	(order.remainingAmount <= 0 && order.totalAmount > 0)
																		? 'Không thể xóa đơn hàng đã thanh toán'
																		: 'Xóa đơn hàng'
																}
															>
																Xóa
															</Button>
														</ButtonGroup>
													</Td>
												</Tr>
											))
										)}
									</Tbody>
								</Table>
							</TableContainer>

							<Flex justify="space-between" mt={4} mb={2} px={2} align="center" flexWrap="wrap" gap={4} flexShrink={0}>
								<Flex align="center" gap={2}>
									<Box fontSize="sm" color="gray.600" whiteSpace="nowrap">
										Hiển thị
									</Box>
									<Select
										value={pageSize}
										onChange={(e) => handlePageSizeChange(Number(e.target.value))}
										size="sm"
										w="80px"
										_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
									>
										<option value={10}>10</option>
										<option value={20}>20</option>
										<option value={50}>50</option>
										<option value={100}>100</option>
									</Select>
									<Box fontSize="sm" color="gray.600" whiteSpace="nowrap">
										/ trang
									</Box>
								</Flex>

								<Flex align="center" gap={2}>
									<Button
										onClick={() => goToPage(1)}
										isDisabled={!canPrev || currentPage === 1}
										size="sm"
										variant="outline"
										leftIcon={<ChevronLeftIcon />}
										_focus={{ boxShadow: 'none', outline: 'none' }}
									>
										Đầu
									</Button>
									<IconButton
										aria-label="Trang trước"
										icon={<ChevronLeftIcon />}
										onClick={() => goToPage(currentPage - 1)}
										isDisabled={!canPrev}
										size="sm"
										variant="outline"
										_focus={{ boxShadow: 'none', outline: 'none' }}
									/>
									
									<Flex gap={1}>
										{getPageNumbers().map((page, idx) => {
											if (page === '...') {
												return (
													<Box key={`ellipsis-${idx}`} px={2} py={1} fontSize="sm" color="gray.500">
														...
													</Box>
												);
											}
											const pageNum = page as number;
											const isActive = pageNum === currentPage;
											return (
												<Button
													key={pageNum}
													size="sm"
													variant={isActive ? 'solid' : 'outline'}
													colorScheme={isActive ? 'blue' : 'gray'}
													onClick={() => goToPage(pageNum)}
													minW="40px"
													_focus={{ boxShadow: 'none', outline: 'none' }}
												>
													{pageNum}
												</Button>
											);
										})}
									</Flex>

									<IconButton
										aria-label="Trang sau"
										icon={<ChevronRightIcon />}
										onClick={() => goToPage(currentPage + 1)}
										isDisabled={!canNext}
										size="sm"
										variant="outline"
										_focus={{ boxShadow: 'none', outline: 'none' }}
									/>
									<Button
										onClick={() => goToPage(totalPages)}
										isDisabled={!canNext || currentPage === totalPages}
										size="sm"
										variant="outline"
										rightIcon={<ChevronRightIcon />}
										_focus={{ boxShadow: 'none', outline: 'none' }}
									>
										Cuối
									</Button>
								</Flex>

								<Box fontSize="sm" color="gray.600" whiteSpace="nowrap">
									{Math.min(offset + 1, totalItems)}-{Math.min(offset + pageSize, totalItems)} / {totalItems}
								</Box>
							</Flex>
						</>
					)}
				</div>
			</div>

			{/* Drawer Thanh toán nhanh */}
			<Drawer
				isOpen={isOpen}
				placement="right"
				onClose={onClose}
				size="md"
			>
				<DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader borderBottomWidth="1px" bg="green.50">
						<Text fontSize="xl" fontWeight="bold" color="green.700">
							Thanh toán nhanh
						</Text>
						{selectedOrder && (
							<Text fontSize="sm" color="gray.600" mt={1}>
								Đơn hàng: <strong>{selectedOrder.code}</strong>
							</Text>
						)}
					</DrawerHeader>

					<DrawerBody p={6}>
						{selectedOrder && (
							<VStack spacing={6} align="stretch">
								{/* Thông tin đơn hàng */}
								<Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
									<VStack align="stretch" spacing={2}>
										<Flex justify="space-between">
											<Text fontSize="sm" color="gray.600">Khách hàng:</Text>
											<Text fontSize="sm" fontWeight="semibold">{selectedOrder.partnerName}</Text>
										</Flex>
										<Flex justify="space-between">
											<Text fontSize="sm" color="gray.600">Tổng tiền:</Text>
											<Text fontSize="sm" fontWeight="semibold" color="blue.600">
												{formatCurrency(selectedOrder.totalAmount)}
											</Text>
										</Flex>
										<Flex justify="space-between">
											<Text fontSize="sm" color="gray.600">Đã thanh toán:</Text>
											<Text fontSize="sm" fontWeight="semibold" color="green.600">
												{formatCurrency(selectedOrder.paidAmount)}
											</Text>
										</Flex>
										<Flex justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.300">
											<Text fontSize="md" fontWeight="bold" color="gray.700">Còn lại:</Text>
											<Text fontSize="md" fontWeight="bold" color="red.600">
												{formatCurrency(selectedOrder.remainingAmount)}
											</Text>
										</Flex>
									</VStack>
								</Box>

								{/* Form thanh toán */}
								<VStack spacing={4} align="stretch">
									<FormControl isRequired>
										<FormLabel>Số tiền thanh toán</FormLabel>
										<Input
											type="number"
											value={paymentForm.amount}
											onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
											placeholder="Nhập số tiền"
											size="lg"
											focusBorderColor="green.500"
										/>
										<Text fontSize="xs" color="gray.500" mt={1}>
											Tối đa: {formatCurrency(selectedOrder.remainingAmount)}
										</Text>
									</FormControl>

									<FormControl isRequired>
										<FormLabel>Phương thức thanh toán</FormLabel>
										<Select
											value={paymentForm.paymentMethod}
											onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
											size="lg"
											focusBorderColor="green.500"
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
											size="lg"
											focusBorderColor="green.500"
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
											size="lg"
											rows={3}
											focusBorderColor="green.500"
										/>
									</FormControl>
								</VStack>
							</VStack>
						)}
					</DrawerBody>

					<DrawerFooter borderTopWidth="1px" bg="gray.50">
						<ButtonGroup spacing={3} w="full">
							<Button
								variant="outline"
								onClick={onClose}
								flex={1}
								_focus={{ boxShadow: 'none', outline: 'none' }}
							>
								Hủy
							</Button>
							<Button
								colorScheme="green"
								onClick={handleCreatePayment}
								isLoading={creatingPayment}
								loadingText="Đang xử lý..."
								flex={1}
								_focus={{ boxShadow: 'none', outline: 'none' }}
							>
								Xác nhận thanh toán
							</Button>
						</ButtonGroup>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</Box>
	);
};

export default OrdersList;

