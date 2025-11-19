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
	useToast,
	Badge,
	Text,
	HStack,
} from '@chakra-ui/react';
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder } from '../../api/orders';
import type { OrderDto } from '../../api/orders';
import { getOrderStatusLabel, getOrderStatusColor, OrderStatus, OrderStatusLabels } from '../../constants/orderStatus';

const OrdersList: React.FC = () => {
	const [items, setItems] = useState<OrderDto[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [offset, setOffset] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [keyword, setKeyword] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	const load = async () => {
		setLoading(true);
		try {
			const res = await getOrders({ 
				limit: pageSize, 
				offset, 
				search: keyword || undefined,
				status: statusFilter || undefined,
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
	}, [offset, pageSize, statusFilter]);

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

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Đơn hàng</Heading>
				<Button 
					leftIcon={<AddIcon />} 
					colorScheme="blue" 
					onClick={() => navigate('/orders/new')}
					_focus={{ boxShadow: 'none', outline: 'none' }}
				>
					Tạo đơn hàng
				</Button>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden">
					{/* Filter Bar */}
					<Box p={3} borderBottom="1px solid" borderColor="gray.200">
						<HStack spacing={4}>
							<Box>
								<Text fontSize="sm" color="gray.600" mb={1}>
									Lọc theo trạng thái
								</Text>
								<Select
									value={statusFilter}
									onChange={(e) => {
										setStatusFilter(e.target.value);
										setOffset(0); // Reset về trang đầu khi filter
									}}
									size="sm"
									w="200px"
									placeholder="Tất cả trạng thái"
									_focus={{ boxShadow: 'none', outline: 'none', borderColor: 'blue.500' }}
								>
									<option value="">Tất cả trạng thái</option>
									{Object.values(OrderStatus).map((status) => (
										<option key={status} value={status}>
											{OrderStatusLabels[status]}
										</option>
									))}
								</Select>
							</Box>
						</HStack>
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
														<ButtonGroup size="sm" variant="outline">
															<Button 
																colorScheme="blue" 
																onClick={() => navigate(`/orders/${order.id}`)}
																_focus={{ boxShadow: 'none', outline: 'none' }}
															>
																Xem
															</Button>
															<Button
																colorScheme="red"
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
		</Box>
	);
};

export default OrdersList;

