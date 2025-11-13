import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Button,
	ButtonGroup,
	Flex,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
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
} from '@chakra-ui/react';
import { AddIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { deleteCustomer, getCustomers } from '../../api/customers';
import type { CustomerDto } from '../../api/customers';
import CustomerEditModal from '../../components/CustomerEditModal';

const CustomersList: React.FC = () => {
	const [items, setItems] = useState<CustomerDto[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [offset, setOffset] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [keyword, setKeyword] = useState('');
	const [loading, setLoading] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const toast = useToast();
	const navigate = useNavigate();

	const load = async () => {
		setLoading(true);
		try {
			const res = await getCustomers({ limit: pageSize, offset, keyword: keyword || undefined });
			setItems(res.items);
			setTotalItems(res.totalItems);
		} catch (err: any) {
			toast({ status: 'error', title: 'Lỗi tải danh sách', description: err?.message || 'Có lỗi xảy ra' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [offset, pageSize]);

	// Tính toán phân trang
	const currentPage = Math.floor(offset / pageSize) + 1;
	const totalPages = Math.ceil(totalItems / pageSize);
	const canPrev = offset > 0;
	const canNext = useMemo(() => offset + pageSize < totalItems, [offset, pageSize, totalItems]);

	// Tạo danh sách số trang để hiển thị
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5; // Số trang tối đa hiển thị
		
		if (totalPages <= maxVisible) {
			// Nếu tổng số trang <= maxVisible, hiển thị tất cả
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Logic hiển thị trang với ellipsis
			if (currentPage <= 3) {
				// Trang đầu
				for (let i = 1; i <= 4; i++) pages.push(i);
				pages.push('...');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				// Trang cuối
				pages.push(1);
				pages.push('...');
				for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
			} else {
				// Trang giữa
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
		setOffset(0); // Reset về trang đầu khi đổi page size
	};

	return (
		<Box>
			<Flex justify="space-between" align="center" mb={4}>
				<Heading size="md">Customers</Heading>
				<Button 
					leftIcon={<AddIcon />} 
					colorScheme="blue" 
					onClick={() => navigate('/customers/new')}
					_focus={{ boxShadow: 'none', outline: 'none' }}
				>
					Thêm mới
				</Button>
			</Flex>

			<InputGroup size="sm" mb={3}>
				<InputLeftElement pointerEvents="none">
					<SearchIcon color="gray.400" />
				</InputLeftElement>
				<Input
					placeholder="Tìm theo tên/SĐT/Mã..."
					value={keyword}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							setOffset(0);
							void load();
						}
					}}
				/>
			</InputGroup>

			{loading ? (
				<Flex justify="center" py={10}>
					<Spinner />
				</Flex>
			) : (
				<TableContainer bg="white" border="1px solid" borderColor="gray.200" borderRadius="md">
					<Table size="sm">
						<Thead>
							<Tr>
								<Th>Mã</Th>
								<Th>Tên</Th>
								<Th>SĐT</Th>
								<Th>Địa chỉ</Th>
								<Th isNumeric>Active</Th>
								<Th>Hành động</Th>
							</Tr>
						</Thead>
						<Tbody>
							{items.map((c) => (
								<Tr key={c.id}>
									<Td>{c.ref}</Td>
									<Td>{c.name}</Td>
									<Td>{c.phone}</Td>
									<Td>{c.address ?? '-'}</Td>
									<Td isNumeric>{c.active ? '✔️' : '❌'}</Td>
									<Td>
										<ButtonGroup size="sm" variant="outline">
											<Button 
												colorScheme="blue" 
												onClick={() => setEditingId(c.id)}
												_focus={{ boxShadow: 'none', outline: 'none' }}
											>
												Sửa
											</Button>
											<Button
												colorScheme="red"
												onClick={async () => {
													try {
														await deleteCustomer(c.id);
														toast({ status: 'success', title: 'Đã xóa (soft delete)' });
														void load();
													} catch (err: any) {
														toast({
															status: 'error',
															title: 'Xóa thất bại',
															description: err?.message || 'Có lỗi xảy ra',
														});
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
			)}

			<Flex justify="space-between" mt={4} align="center" flexWrap="wrap" gap={4}>
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

			{editingId && (
				<CustomerEditModal
					isOpen={!!editingId}
					onClose={() => setEditingId(null)}
					customerId={editingId}
					onSuccess={() => {
						setEditingId(null);
						void load();
					}}
				/>
			)}
		</Box>
	);
};

export default CustomersList;


