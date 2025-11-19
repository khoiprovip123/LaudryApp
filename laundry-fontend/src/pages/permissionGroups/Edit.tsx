import React, { useState, useEffect, useMemo } from 'react';
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	HStack,
	Input,
	InputGroup,
	InputLeftElement,
	Switch,
	useToast,
	Checkbox,
	VStack,
	Text,
	Textarea,
	Divider,
	Card,
	CardBody,
	CardHeader,
	Badge,
	IconButton,
	Collapse,
	SimpleGrid,
	Spinner,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { updatePermissionGroup, getPermissionGroupById } from '../../api/permissionGroups';
import type { UpdatePermissionGroupRequest } from '../../api/permissionGroups';
import { getAllPermissions, type PermissionDto } from '../../api/roles';
import { useNavigate, useParams } from 'react-router-dom';

const PermissionGroupEdit: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [form, setForm] = useState<UpdatePermissionGroupRequest>({
		id: id || '',
		name: '',
		description: '',
		permissions: [],
		active: true,
	});
	const [availablePermissions, setAvailablePermissions] = useState<PermissionDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const [loadingPermissions, setLoadingPermissions] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const loadData = async () => {
			if (!id) return;
			setLoadingData(true);
			setLoadingPermissions(true);
			try {
				const [permissionGroup, permissions] = await Promise.all([
					getPermissionGroupById(id),
					getAllPermissions(),
				]);
				setAvailablePermissions(permissions);
				setForm({
					id: permissionGroup.id,
					name: permissionGroup.name,
					description: permissionGroup.description,
					permissions: permissionGroup.permissions,
					active: permissionGroup.active,
				});
			} catch (err: any) {
				// Toast error đã được xử lý tự động bởi http wrapper
				navigate('/permission-groups');
			} finally {
				setLoadingData(false);
				setLoadingPermissions(false);
			}
		};
		void loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const update = <K extends keyof UpdatePermissionGroupRequest>(k: K, v: UpdatePermissionGroupRequest[K]) =>
		setForm((s: UpdatePermissionGroupRequest) => ({ ...s, [k]: v }));

	const handlePermissionChange = (permissionCode: string, checked: boolean) => {
		setForm((s) => {
			if (checked) {
				// Chỉ thêm nếu chưa có trong danh sách
				if (s.permissions.includes(permissionCode)) {
					return s;
				}
				return { ...s, permissions: [...s.permissions, permissionCode] };
			} else {
				// Loại bỏ permission khỏi danh sách
				return { ...s, permissions: s.permissions.filter((p) => p !== permissionCode) };
			}
		});
	};

	const handleSelectAllCategory = (category: string, checked: boolean) => {
		const categoryPermissions = availablePermissions
			.filter((p) => p.category === category)
			.map((p) => p.code);

		if (checked) {
			setForm((s) => ({
				...s,
				permissions: [...new Set([...s.permissions, ...categoryPermissions])],
			}));
		} else {
			setForm((s) => ({
				...s,
				permissions: s.permissions.filter((p) => !categoryPermissions.includes(p)),
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await updatePermissionGroup(id!, form);
			toast({ status: 'success', title: 'Cập nhật nhóm quyền thành công' });
			navigate('/permission-groups');
		} catch (err: any) {
			// Toast error đã được xử lý tự động bởi http wrapper
		} finally {
			setLoading(false);
		}
	};

	// Nhóm permissions theo category và filter theo search
	const permissionsByCategory = useMemo(() => {
		const filtered = searchQuery
			? availablePermissions.filter(
					(p) =>
						p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						p.category.toLowerCase().includes(searchQuery.toLowerCase())
			  )
			: availablePermissions;

		const grouped = filtered.reduce((acc, perm) => {
			if (!acc[perm.category]) {
				acc[perm.category] = [];
			}
			acc[perm.category].push(perm);
			return acc;
		}, {} as Record<string, PermissionDto[]>);

		// Auto expand categories khi search
		if (searchQuery) {
			Object.keys(grouped).forEach((cat) => {
				if (!expandedCategories[cat]) {
					setExpandedCategories((prev) => ({ ...prev, [cat]: true }));
				}
			});
		}

		return grouped;
	}, [availablePermissions, searchQuery, expandedCategories]);

	const toggleCategory = (category: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	const selectedCount = form.permissions.length;
	const totalCount = availablePermissions.length;

	if (loadingData) {
		return (
			<Flex justify="center" align="center" h="100%" bg="gray.50">
				<Spinner size="xl" thickness="4px" color="blue.500" />
			</Flex>
		);
	}

	return (
		<Box className="flex flex-col h-full w-full" bg="gray.50">
			<Flex justify="space-between" align="center" p={4} bg="white" borderBottom="1px solid" borderColor="gray.200" shadow="sm">
				<Heading size="lg" color="gray.700">Sửa nhóm quyền</Heading>
				<HStack>
					<Button 
						onClick={() => navigate('/permission-groups')}
						variant="ghost"
					>
						Hủy
					</Button>
					<Button 
						type="submit"
						form="permission-group-form"
						colorScheme="blue" 
						isLoading={loading}
					>
						Lưu nhóm quyền
					</Button>
				</HStack>
			</Flex>

			<Box as="form" id="permission-group-form" onSubmit={handleSubmit} flex="1" overflow="hidden">
			<Flex flex="1" overflow="hidden" gap={6} p={6}>
				{/* Cột trái: Form thông tin cơ bản */}
				<Card flex="0 0 400px" shadow="md" borderRadius="lg">
					<CardHeader bg="blue.50" borderTopRadius="lg">
						<Heading size="md" color="gray.700">Thông tin nhóm quyền</Heading>
					</CardHeader>
					<CardBody>
						<VStack align="stretch" spacing={6}>
							<FormControl isRequired>
								<FormLabel fontWeight="semibold" color="gray.700">Tên nhóm quyền</FormLabel>
								<Input
									value={form.name}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('name', e.target.value)}
									placeholder="Nhập tên nhóm quyền..."
									size="md"
								/>
							</FormControl>

							<FormControl>
								<FormLabel fontWeight="semibold" color="gray.700">Mô tả</FormLabel>
								<Textarea
									value={form.description}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update('description', e.target.value)}
									placeholder="Nhập mô tả cho nhóm quyền..."
									rows={4}
									resize="vertical"
								/>
							</FormControl>

							<Divider />

							<FormControl display="flex" alignItems="center" justifyContent="space-between" p={4} bg="gray.50" borderRadius="md">
								<Box>
									<FormLabel mb={1} fontWeight="semibold" color="gray.700">Trạng thái hoạt động</FormLabel>
									<Text fontSize="sm" color="gray.500">Bật/tắt nhóm quyền này</Text>
								</Box>
								<Switch
									isChecked={form.active}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('active', e.target.checked)}
									size="lg"
									colorScheme="green"
								/>
							</FormControl>

							<Card bg="blue.50" border="1px solid" borderColor="blue.200">
								<CardBody>
									<VStack align="stretch" spacing={2}>
										<Text fontSize="sm" fontWeight="semibold" color="gray.700">
											Tóm tắt quyền đã chọn
										</Text>
										<HStack justify="space-between">
											<Text fontSize="2xl" fontWeight="bold" color="blue.600">
												{selectedCount}
											</Text>
											<Text fontSize="sm" color="gray.600">
												/ {totalCount} quyền
											</Text>
										</HStack>
										{selectedCount > 0 && (
											<Badge colorScheme="blue" w="fit-content">
												{Math.round((selectedCount / totalCount) * 100)}% đã chọn
											</Badge>
										)}
									</VStack>
								</CardBody>
							</Card>
						</VStack>
					</CardBody>
				</Card>

				{/* Cột phải: Danh sách quyền */}
				<Card flex="1" shadow="md" borderRadius="lg" overflow="hidden">
					<CardHeader bg="white" borderBottom="1px solid" borderColor="gray.200">
						<VStack align="stretch" spacing={4}>
							<Heading size="md" color="gray.700">Chọn quyền cho nhóm</Heading>
							<InputGroup>
								<InputLeftElement pointerEvents="none">
									<SearchIcon color="gray.400" />
								</InputLeftElement>
								<Input
									placeholder="Tìm kiếm quyền theo tên, mô tả hoặc danh mục..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									size="md"
								/>
							</InputGroup>
						</VStack>
					</CardHeader>
					<CardBody overflowY="auto" maxH="calc(100vh - 250px)">
						{loadingPermissions ? (
							<Flex justify="center" align="center" py={12}>
								<Spinner size="xl" thickness="4px" color="blue.500" />
							</Flex>
						) : Object.keys(permissionsByCategory).length === 0 ? (
							<Text textAlign="center" color="gray.500" py={8}>
								{searchQuery ? 'Không tìm thấy quyền nào phù hợp' : 'Đang tải danh sách quyền...'}
							</Text>
						) : (
							<VStack align="stretch" spacing={4}>
								{Object.entries(permissionsByCategory).map(([category, perms]) => {
									const allSelected = perms.every((p) => form.permissions.includes(p.code));
									const someSelected = perms.some((p) => form.permissions.includes(p.code));
									const isExpanded = expandedCategories[category] !== false; // Default expanded

									return (
										<Card key={category} border="1px solid" borderColor="gray.200" shadow="sm">
											<CardHeader
												bg={allSelected ? 'blue.50' : someSelected ? 'yellow.50' : 'gray.50'}
												cursor="pointer"
												onClick={() => toggleCategory(category)}
												_hover={{ bg: allSelected ? 'blue.100' : someSelected ? 'yellow.100' : 'gray.100' }}
												py={3}
											>
												<Flex justify="space-between" align="center">
													<HStack spacing={3} flex="1">
														<Checkbox
															isChecked={allSelected}
															isIndeterminate={someSelected && !allSelected}
															onChange={(e) => {
																e.stopPropagation();
																handleSelectAllCategory(category, e.target.checked);
															}}
															size="lg"
															colorScheme="blue"
														>
															<Text fontWeight="bold" fontSize="md" color="gray.700">
																{category}
															</Text>
														</Checkbox>
														<Badge colorScheme="blue" fontSize="xs">
															{perms.length} quyền
														</Badge>
														<Badge colorScheme="green" fontSize="xs">
															{perms.filter((p) => form.permissions.includes(p.code)).length} đã chọn
														</Badge>
													</HStack>
													<IconButton
														aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
														icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
														variant="ghost"
														size="sm"
													/>
												</Flex>
											</CardHeader>
											<Collapse in={isExpanded} animateOpacity>
												<CardBody pt={2}>
													<SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
														{perms.map((perm) => {
															const isChecked = form.permissions.includes(perm.code);
															return (
																<Box
																	key={perm.code}
																	p={3}
																	border="1px solid"
																	borderColor={isChecked ? 'blue.300' : 'gray.200'}
																	borderRadius="md"
																	bg={isChecked ? 'blue.50' : 'white'}
																	_hover={{
																		borderColor: 'blue.400',
																		shadow: 'sm',
																	}}
																	transition="all 0.2s"
																>
																	<Checkbox
																		isChecked={isChecked}
																		onChange={(e) => {
																			handlePermissionChange(perm.code, e.target.checked);
																		}}
																		colorScheme="blue"
																		size="md"
																	>
																		<VStack align="start" spacing={0} ml={2}>
																			<Text fontSize="sm" fontWeight="medium" color="gray.700">
																				{perm.name}
																			</Text>
																			{perm.description && (
																				<Text fontSize="xs" color="gray.500" noOfLines={2}>
																					{perm.description}
																				</Text>
																			)}
																		</VStack>
																	</Checkbox>
																</Box>
															);
														})}
													</SimpleGrid>
												</CardBody>
											</Collapse>
										</Card>
									);
								})}
							</VStack>
						)}
					</CardBody>
				</Card>
			</Flex>
			</Box>
		</Box>
	);
};

export default PermissionGroupEdit;
