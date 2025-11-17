import React, { useEffect, useState } from 'react';
import {
	Box,
	Card,
	CardBody,
	CardHeader,
	Checkbox,
	Flex,
	Heading,
	Spinner,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useToast,
	VStack,
	Text,
	Badge,
} from '@chakra-ui/react';
import { getAllPermissions, getAllRoles, type PermissionDto, type RoleDto } from '../../api/roles';

const RolesList: React.FC = () => {
	const [roles, setRoles] = useState<RoleDto[]>([]);
	const [permissions, setPermissions] = useState<PermissionDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedRole, setSelectedRole] = useState<string | null>(null);
	const toast = useToast();

	const loadData = async () => {
		setLoading(true);
		try {
			const [rolesData, permissionsData] = await Promise.all([
				getAllRoles(),
				getAllPermissions(),
			]);
			setRoles(rolesData);
			setPermissions(permissionsData);
		} catch (err: any) {
			toast({
				status: 'error',
				title: 'Lỗi tải dữ liệu',
				description: err?.message || 'Có lỗi xảy ra',
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadData();
	}, []);

	// Nhóm permissions theo category
	const permissionsByCategory = permissions.reduce((acc, perm) => {
		if (!acc[perm.category]) {
			acc[perm.category] = [];
		}
		acc[perm.category].push(perm);
		return acc;
	}, {} as Record<string, PermissionDto[]>);

	const selectedRoleData = roles.find((r) => r.name === selectedRole);

	return (
		<Box className="flex flex-col h-full w-full p-4">
			<Heading size="md" mb={4}>
				Cấu hình nhóm quyền
			</Heading>

			<Flex gap={4} flex="1" overflow="hidden">
				{/* Danh sách Roles */}
				<Card w="300px" flexShrink={0}>
					<CardHeader>
						<Heading size="sm">Nhóm quyền</Heading>
					</CardHeader>
					<CardBody p={0}>
						<VStack spacing={0} align="stretch">
							{loading ? (
								<Flex justify="center" align="center" p={8}>
									<Spinner />
								</Flex>
							) : roles.length === 0 ? (
								<Text p={4} color="gray.500" textAlign="center">
									Không có nhóm quyền nào
								</Text>
							) : (
								roles.map((role) => (
								<Box
									key={role.name}
									p={3}
									cursor="pointer"
									bg={selectedRole === role.name ? 'blue.50' : 'transparent'}
									borderLeft={
										selectedRole === role.name ? '3px solid' : '3px solid transparent'
									}
									borderLeftColor={selectedRole === role.name ? 'blue.500' : 'transparent'}
									_hover={{ bg: 'gray.50' }}
									onClick={() => setSelectedRole(role.name)}
								>
									<Text fontWeight={selectedRole === role.name ? 'semibold' : 'normal'}>
										{role.displayName}
									</Text>
									<Text fontSize="xs" color="gray.500" mt={1}>
										{role.description}
									</Text>
									<Badge colorScheme="blue" mt={2} fontSize="xs">
										{role.permissions.length} quyền
									</Badge>
								</Box>
							))
							)}
						</VStack>
					</CardBody>
				</Card>

				{/* Chi tiết Permissions của Role được chọn */}
				<Card flex="1" overflow="auto">
					<CardHeader>
						<Heading size="sm">
							{selectedRoleData
								? `Quyền của nhóm: ${selectedRoleData.displayName}`
								: 'Chọn nhóm quyền để xem chi tiết'}
						</Heading>
					</CardHeader>
					<CardBody>
						{selectedRoleData ? (
							<VStack spacing={6} align="stretch">
								{Object.entries(permissionsByCategory).map(([category, perms]) => {
									const categoryPerms = perms.filter((p) =>
										selectedRoleData.permissions.includes(p.code)
									);

									if (categoryPerms.length === 0) return null;

									return (
										<Box key={category}>
											<Heading size="xs" mb={3} color="gray.600">
												{category}
											</Heading>
											<TableContainer>
												<Table size="sm">
													<Thead>
														<Tr>
															<Th>Quyền</Th>
															<Th>Mô tả</Th>
														</Tr>
													</Thead>
													<Tbody>
														{categoryPerms.map((perm) => (
															<Tr key={perm.code}>
																<Td>
																	<Checkbox isChecked={true} isReadOnly>
																		{perm.name}
																	</Checkbox>
																</Td>
																<Td>
																	<Text fontSize="sm" color="gray.600">
																		{perm.description}
																	</Text>
																</Td>
															</Tr>
														))}
													</Tbody>
												</Table>
											</TableContainer>
										</Box>
									);
								})}
							</VStack>
						) : (
							<Text color="gray.500" textAlign="center" py={8}>
								Vui lòng chọn một nhóm quyền để xem chi tiết
							</Text>
						)}
					</CardBody>
				</Card>
			</Flex>
		</Box>
	);
};

export default RolesList;

