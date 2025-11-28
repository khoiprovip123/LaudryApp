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
} from '@chakra-ui/react';
import { useToast } from '../../hooks/useToast';
import { AddIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { deleteService, getServices } from '../../api/services';
import type { ServiceDto } from '../../api/services';
import ServiceCreateModal from '../../components/ServiceCreateModal';
import ServiceEditModal from '../../components/ServiceEditModal';
import SearchInput from '../../components/SearchInput';

const ServicesList: React.FC = () => {
	const [items, setItems] = useState<ServiceDto[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [offset, setOffset] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [keyword, setKeyword] = useState('');
	const [loading, setLoading] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const toast = useToast();

	const load = async () => {
		setLoading(true);
		try {
			const res = await getServices({ limit: pageSize, offset, search: keyword || undefined });
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
	}, [offset, pageSize, keyword]);

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

	return (
		<Box className="flex flex-col h-full w-full">
			<Flex justify="space-between" className="bg-white border-b border-gray-200" align="center" p={2}>
				<Heading size="md">Dịch vụ</Heading>
				<Button 
					leftIcon={<AddIcon />} 
					colorScheme="blue" 
					onClick={() => setIsCreateModalOpen(true)}
					_focus={{ boxShadow: 'none', outline: 'none' }}
				>
					Thêm mới
				</Button>
			</Flex>

			<div className="p-2 flex-1 w-full overflow-hidden flex flex-col">
				<div className="bg-white w-full h-full rounded-md flex flex-col overflow-hidden">
					<div className="flex justify-end gap-2 p-2">
						<div className="max-w-[550px] min-w-[300px]">
							<SearchInput
								value={keyword}
								onChange={(value) => {
									setKeyword(value);
									setOffset(0);
								}}
								placeholder="Tìm theo tên/Mã/Mô tả..."
								debounceMs={300}
							/>
						</div>
					</div>

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
											<Th bg="gray.100">Mã</Th>
											<Th bg="gray.100">Tên dịch vụ</Th>
											<Th bg="gray.100">Đơn giá</Th>
											<Th bg="gray.100">Mô tả</Th>
											<Th isNumeric bg="gray.100">Active</Th>
											<Th bg="gray.100">Hành động</Th>
										</Tr>
									</Thead>
									<Tbody>
										{items.map((s) => (
											<Tr key={s.id}>
												<Td>{s.defaultCode}</Td>
												<Td>{s.name}</Td>
												<Td>{formatCurrency(s.unitPrice)}</Td>
												<Td>{s.description || '-'}</Td>
												<Td isNumeric>
													<Badge colorScheme={s.active ? 'green' : 'red'}>
														{s.active ? 'Hoạt động' : 'Không hoạt động'}
													</Badge>
												</Td>
												<Td>
													<ButtonGroup size="sm" variant="outline">
													<Button 
														colorScheme="blue" 
														onClick={() => setEditingId(s.id)}
														_focus={{ boxShadow: 'none', outline: 'none' }}
													>
														Sửa
													</Button>
														<Button
															colorScheme="red"
															onClick={async () => {
																try {
																	await deleteService(s.id);
																	toast({ status: 'success', title: 'Đã xóa thành công' });
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
										))}
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

			{isCreateModalOpen && (
				<ServiceCreateModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
					onSuccess={() => {
						setIsCreateModalOpen(false);
						void load();
					}}
				/>
			)}

			{editingId && (
				<ServiceEditModal
					isOpen={!!editingId}
					onClose={() => setEditingId(null)}
					serviceId={editingId}
					onSuccess={() => {
						setEditingId(null);
						void load();
					}}
				/>
			)}
		</Box>
	);
};

export default ServicesList;

