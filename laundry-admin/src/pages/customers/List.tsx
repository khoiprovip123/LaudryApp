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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { deleteCustomer, getCustomers } from '../../api/customers';
import type { CustomerDto } from '../../api/customers';

const PAGE_SIZE = 10;

const CustomersList: React.FC = () => {
	const [items, setItems] = useState<CustomerDto[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [offset, setOffset] = useState(0);
	const [keyword, setKeyword] = useState('');
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	const load = async () => {
		setLoading(true);
		try {
			const res = await getCustomers({ limit: PAGE_SIZE, offset, keyword: keyword || undefined });
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
	}, [offset]);

	const canPrev = offset > 0;
	const canNext = useMemo(() => offset + PAGE_SIZE < totalItems, [offset, totalItems]);

	return (
		<Box>
			<Flex justify="space-between" align="center" mb={4}>
				<Heading size="md">Customers</Heading>
				<Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => navigate('/customers/new')}>
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
											<Button as={RouterLink} to={`/customers/${c.id}/edit`} colorScheme="blue">
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

			<Flex justify="space-between" mt={4} align="center">
				<Button
					leftIcon={<ChevronLeftIcon />}
					onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
					isDisabled={!canPrev}
				>
					Trang trước
				</Button>
				<Flex align="center" gap={2}>
					<IconButton
						aria-label="prev"
						icon={<ChevronLeftIcon />}
						onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
						isDisabled={!canPrev}
					/>
					<IconButton
						aria-label="next"
						icon={<ChevronRightIcon />}
						onClick={() => setOffset((o) => o + PAGE_SIZE)}
						isDisabled={!canNext}
					/>
				</Flex>
				<Box fontSize="sm" color="gray.600">
					Hiển thị {Math.min(offset + 1, totalItems)}-{Math.min(offset + PAGE_SIZE, totalItems)} / {totalItems}
				</Box>
			</Flex>
		</Box>
	);
};

export default CustomersList;


